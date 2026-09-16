import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { DispatchService } from "./dispatch.service";
import { CrewView, WorkOrderView } from "./dispatch.types";

@ApiTags("dispatch")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: "dispatch", version: "1" })
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Get("crews")
  @ApiOkResponse({ description: "Crew roster" })
  listCrews(): Promise<CrewView[]> {
    return this.dispatchService.listCrews();
  }

  @Get("work-orders/open")
  @ApiOkResponse({ description: "Open work orders" })
  listOpenWorkOrders(): Promise<WorkOrderView[]> {
    return this.dispatchService.listOpenWorkOrders();
  }

  @Post("incidents/:incidentId/work-orders")
  @ApiOkResponse({ description: "Dispatch an incident to a crew" })
  dispatchIncident(@Param("incidentId") incidentId: string): Promise<WorkOrderView> {
    return this.dispatchService.dispatchIncident(incidentId);
  }
}