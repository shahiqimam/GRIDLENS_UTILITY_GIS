import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Crew } from "../dispatch/crew.entity";
import { WorkOrder } from "../dispatch/work-order.entity";
import { Incident } from "../incidents/incident.entity";
import { NetworkModule } from "../network/network.module";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";

@Module({
  imports: [TypeOrmModule.forFeature([Incident, WorkOrder, Crew]), NetworkModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService]
})
export class AnalyticsModule {}