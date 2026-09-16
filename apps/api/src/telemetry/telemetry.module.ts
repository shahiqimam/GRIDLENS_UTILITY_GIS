import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RulesModule } from "../rules/rules.module";
import { TelemetryController } from "./telemetry.controller";
import { TelemetryDevice } from "./telemetry-device.entity";
import { TelemetryReading } from "./telemetry-reading.entity";
import { TelemetryService } from "./telemetry.service";

@Module({
  imports: [TypeOrmModule.forFeature([TelemetryDevice, TelemetryReading]), RulesModule],
  controllers: [TelemetryController],
  providers: [TelemetryService]
})
export class TelemetryModule {}
