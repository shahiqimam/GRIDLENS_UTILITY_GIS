import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Incident } from "../incidents/incident.entity";
import { Crew } from "./crew.entity";
import { DispatchController } from "./dispatch.controller";
import { DispatchService } from "./dispatch.service";
import { WorkOrder } from "./work-order.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Crew, WorkOrder, Incident])],
  controllers: [DispatchController],
  providers: [DispatchService]
})
export class DispatchModule {}