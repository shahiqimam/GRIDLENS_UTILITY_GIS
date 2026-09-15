import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { NetworkService } from "./network.service";
import { DownstreamTraceResult, FeederOverview, NetworkSummary } from "./network.types";

@ApiTags("network")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: "network", version: "1" })
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @Get("summary")
  @ApiOkResponse({ description: "Synthetic network aggregate counts" })
  getSummary(): Promise<NetworkSummary> {
    return this.networkService.getSummary();
  }

  @Get("feeders")
  @ApiOkResponse({ description: "Synthetic feeder overview list" })
  listFeeders(): Promise<FeederOverview[]> {
    return this.networkService.listFeeders();
  }

  @Get("feeders/:feederId/trace")
  @ApiOkResponse({ description: "Downstream trace from a feeder source or provided start node" })
  traceFeeder(
    @Param("feederId") feederId: string,
    @Query("startNodeId") startNodeId?: string
  ): Promise<DownstreamTraceResult> {
    return this.networkService.traceFeeder(feederId, startNodeId);
  }
}
