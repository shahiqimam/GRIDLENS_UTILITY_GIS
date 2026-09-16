import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AnalyticsService } from "./analytics.service";
import { OperationsAnalyticsView } from "./analytics.types";

@ApiTags("analytics")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: "analytics", version: "1" })
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("operations")
  @ApiOkResponse({ description: "Operations analytics summary" })
  getOperationsSummary(): Promise<OperationsAnalyticsView> {
    return this.analyticsService.getOperationsSummary();
  }
}