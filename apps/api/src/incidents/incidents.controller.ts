import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { IncidentsService } from "./incidents.service";
import { IncidentView } from "./incidents.types";

@ApiTags("incidents")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: "incidents", version: "1" })
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get("open")
  @ApiOkResponse({ description: "Open and acknowledged incidents" })
  listOpen(): Promise<IncidentView[]> {
    return this.incidentsService.listOpen();
  }
}