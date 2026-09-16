import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RulesService } from "./rules.service";
import { DetectedFaultView, FaultRuleConfigView } from "./rules.types";

@ApiTags("rules")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: "rules", version: "1" })
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Get("configs")
  @ApiOkResponse({ description: "Fault detection rule configuration" })
  listConfigs(): Promise<FaultRuleConfigView[]> {
    return this.rulesService.listConfigs();
  }

  @Get("faults/active")
  @ApiOkResponse({ description: "Currently active detected faults" })
  listActiveFaults(): Promise<DetectedFaultView[]> {
    return this.rulesService.listActiveFaults();
  }
}