import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { NetworkService } from "./network.service";
import { FeederOverview, NetworkSummary } from "./network.types";

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
}
