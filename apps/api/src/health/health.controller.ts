import { Controller, Get, VERSION_NEUTRAL, Version } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("health")
@Controller()
export class HealthController {
  @Get("health")
  @Version(VERSION_NEUTRAL)
  @ApiOkResponse({ description: "Liveness check" })
  health(): { status: "ok"; service: "gridlens-api" } {
    return { status: "ok", service: "gridlens-api" };
  }

  @Get("ready")
  @Version(VERSION_NEUTRAL)
  @ApiOkResponse({ description: "Readiness check" })
  ready(): { status: "ok"; dependencies: string[] } {
    return { status: "ok", dependencies: [] };
  }
}
