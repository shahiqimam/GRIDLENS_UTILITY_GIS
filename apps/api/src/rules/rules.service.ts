import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FaultRuleConfig } from "./fault-rule-config.entity";
import { FaultRuleConfigView } from "./rules.types";

@Injectable()
export class RulesService {
  constructor(@InjectRepository(FaultRuleConfig) private readonly ruleConfigs: Repository<FaultRuleConfig>) {}

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
}
