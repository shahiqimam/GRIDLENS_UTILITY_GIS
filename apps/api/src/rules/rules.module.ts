import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TelemetryReading } from "../telemetry/telemetry-reading.entity";
import { DetectedFault } from "./detected-fault.entity";
import { FaultRuleConfig } from "./fault-rule-config.entity";
import { RulesController } from "./rules.controller";
import { RulesService } from "./rules.service";

@Module({
  imports: [TypeOrmModule.forFeature([FaultRuleConfig, DetectedFault, TelemetryReading])],
  controllers: [RulesController],
  providers: [RulesService],
  exports: [RulesService]
})
export class RulesModule {}
