import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { RulesService } from "../rules/rules.service";
import { TelemetryIngestDto } from "./dto/telemetry-ingest.dto";
import { TelemetryDevice } from "./telemetry-device.entity";
import { TelemetryReading } from "./telemetry-reading.entity";
import { TelemetryDeviceStatus } from "./telemetry.enums";
import { TelemetryIngestResult } from "./telemetry.types";

@Injectable()
export class TelemetryService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(TelemetryDevice) private readonly devices: Repository<TelemetryDevice>,
    @InjectRepository(TelemetryReading) private readonly readings: Repository<TelemetryReading>,
    private readonly rulesService: RulesService
  ) {}

  async ingest(dto: TelemetryIngestDto): Promise<TelemetryIngestResult> {
    const device = await this.devices.findOne({
      where: { deviceCode: dto.deviceCode, status: TelemetryDeviceStatus.Active }
    });

    if (!device) {
      throw new NotFoundException("Unknown telemetry device");
    }

    const duplicate = await this.readings.exist({ where: { sourceEventId: dto.sourceEventId } });
    if (duplicate) {
      return { accepted: true, duplicate: true, readingsCreated: 0 };
    }

    const recordedAt = new Date(dto.recordedAt);
    const rawPayload = dto as unknown as Record<string, unknown>;

    await this.dataSource.transaction(async (manager) => {
      const readingEntities = dto.metrics.map((metric) =>
        manager.create(TelemetryReading, {
          deviceId: device.id,
          assetType: device.assetType,
          assetId: device.assetId,
          metric: metric.metric,
          numericValue: metric.value.toString(),
          unit: metric.unit,
          quality: metric.quality,
          recordedAt,
          sourceEventId: dto.sourceEventId,
          rawPayload
        })
      );

      await manager.save(TelemetryReading, readingEntities);
      await manager.update(TelemetryDevice, { id: device.id }, { lastSeenAt: recordedAt });
    });

    await this.rulesService.evaluateTelemetry(device, recordedAt);

    return { accepted: true, duplicate: false, readingsCreated: dto.metrics.length };
  }
}
