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

  @Post("work-orders/:id/en-route")
  @ApiOkResponse({ description: "Mark work order en route" })
  markEnRoute(@Param("id") id: string): Promise<WorkOrderView> {
    return this.dispatchService.markEnRoute(id);
  }

  @Post("work-orders/:id/on-site")
  @ApiOkResponse({ description: "Mark work order on site" })
  markOnSite(@Param("id") id: string): Promise<WorkOrderView> {
    return this.dispatchService.markOnSite(id);
  }

  @Post("work-orders/:id/complete")
  @ApiOkResponse({ description: "Complete work order" })
  completeWorkOrder(@Param("id") id: string): Promise<WorkOrderView> {
    return this.dispatchService.completeWorkOrder(id);
  }
}