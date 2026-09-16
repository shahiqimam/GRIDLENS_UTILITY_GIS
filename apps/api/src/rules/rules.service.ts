import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThanOrEqual, Repository } from "typeorm";
import { IncidentsService } from "../incidents/incidents.service";
import { TelemetryDevice } from "../telemetry/telemetry-device.entity";
import { TelemetryReading } from "../telemetry/telemetry-reading.entity";
import { TelemetryAssetType, TelemetryMetric } from "../telemetry/telemetry.enums";
import { DetectedFault } from "./detected-fault.entity";
import { FaultRuleConfig } from "./fault-rule-config.entity";
import { DetectedFaultSeverity, DetectedFaultStatus, FaultRuleType } from "./rules.enums";
import { DetectedFaultView, FaultEvaluationResult, FaultRuleConfigView } from "./rules.types";

@Injectable()
export class RulesService {
  constructor(
    @InjectRepository(FaultRuleConfig) private readonly ruleConfigs: Repository<FaultRuleConfig>,
    @InjectRepository(DetectedFault) private readonly detectedFaults: Repository<DetectedFault>,
    @InjectRepository(TelemetryReading) private readonly telemetryReadings: Repository<TelemetryReading>,
    private readonly incidentsService: IncidentsService
  ) {}

  async listConfigs(): Promise<FaultRuleConfigView[]> {
    const configs = await this.ruleConfigs.find({ order: { ruleType: "ASC", assetType: "ASC" } });
    return configs.map((config) => ({
      id: config.id,
      ruleType: config.ruleType,
      enabled: config.enabled,
      assetType: config.assetType,
      warningThreshold: config.warningThreshold === null ? null : Number(config.warningThreshold),
      criticalThreshold: config.criticalThreshold === null ? null : Number(config.criticalThreshold),
      consecutiveCount: config.consecutiveCount,
      timeoutSeconds: config.timeoutSeconds
    }));
  }


  async listActiveFaults(): Promise<DetectedFaultView[]> {
    const faults = await this.detectedFaults.find({
      where: { status: DetectedFaultStatus.Active },
      order: { lastDetectedAt: "DESC" },
      take: 50
    });

    return faults.map((fault) => ({
      id: fault.id,
      fingerprint: fault.fingerprint,
      faultType: fault.faultType,
      assetType: fault.assetType,
      assetId: fault.assetId,
      feederId: fault.feederId,
      severity: fault.severity,
      status: fault.status,
      firstDetectedAt: fault.firstDetectedAt.toISOString(),
      lastDetectedAt: fault.lastDetectedAt.toISOString(),
      evidence: fault.evidence
    }));
  }
  async evaluateTelemetry(device: TelemetryDevice, recordedAt: Date): Promise<FaultEvaluationResult> {
    if (device.assetType !== TelemetryAssetType.Feeder) {
      return { faultDetected: false };
    }

    const config = await this.ruleConfigs.findOne({
      where: {
        ruleType: FaultRuleType.FeederVoltageLoss,
        assetType: TelemetryAssetType.Feeder,
        enabled: true
      }
    });

    if (!config?.criticalThreshold || !config.consecutiveCount) {
      return { faultDetected: false };
    }

    const recentReadings = await this.telemetryReadings.find({
      where: {
        deviceId: device.id,
        metric: TelemetryMetric.Voltage,
        recordedAt: LessThanOrEqual(recordedAt)
      },
      order: { recordedAt: "DESC" },
      take: config.consecutiveCount
    });

    if (recentReadings.length < config.consecutiveCount) {
      return { faultDetected: false };
    }

    const threshold = Number(config.criticalThreshold);
    const allBelowThreshold = recentReadings.every((reading) => Number(reading.numericValue) < threshold);
    if (!allBelowThreshold) {
      return { faultDetected: false };
    }

    const fingerprint = `${FaultRuleType.FeederVoltageLoss}:${device.assetType}:${device.assetId}`;
    const evidence = {
      threshold,
      consecutiveCount: config.consecutiveCount,
      readings: recentReadings.map((reading) => ({
        id: reading.id,
        value: Number(reading.numericValue),
        recordedAt: reading.recordedAt.toISOString()
      }))
    };

    const existingFault = await this.detectedFaults.findOne({
      where: { fingerprint, status: DetectedFaultStatus.Active }
    });

    if (existingFault) {
      await this.detectedFaults.update(
        { id: existingFault.id },
        { lastDetectedAt: recordedAt, evidence }
      );
      return { faultDetected: true, fingerprint };
    }

    const fault = this.detectedFaults.create({
      fingerprint,
      faultType: FaultRuleType.FeederVoltageLoss,
      assetType: device.assetType,
      assetId: device.assetId,
      feederId: device.assetId,
      severity: DetectedFaultSeverity.Critical,
      status: DetectedFaultStatus.Active,
      firstDetectedAt: recordedAt,
      lastDetectedAt: recordedAt,
      evidence
    });
    await this.detectedFaults.save(fault);
    await this.incidentsService.openForFault(fault);

    return { faultDetected: true, fingerprint };
  }
}
