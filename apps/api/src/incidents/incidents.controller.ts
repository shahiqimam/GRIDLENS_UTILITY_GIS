import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { AuthenticatedUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
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

  @Post(":id/acknowledge")
  @ApiOkResponse({ description: "Acknowledged incident" })
  acknowledge(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser): Promise<IncidentView> {
    return this.incidentsService.acknowledge(id, user);
  }

  @Post(":id/resolve")
  @ApiOkResponse({ description: "Resolved incident" })
  resolve(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser): Promise<IncidentView> {
    return this.incidentsService.resolve(id, user);
  }
}