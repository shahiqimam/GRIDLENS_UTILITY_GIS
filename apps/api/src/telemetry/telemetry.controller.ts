import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiHeader, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { TelemetryIngestDto } from "./dto/telemetry-ingest.dto";
import { IngestKeyGuard } from "./guards/ingest-key.guard";
import { TelemetryService } from "./telemetry.service";
import { TelemetryIngestResult } from "./telemetry.types";

@ApiTags("telemetry")
@Controller({ path: "telemetry", version: "1" })
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post("ingest")
  @UseGuards(IngestKeyGuard)
  @ApiHeader({ name: "X-Ingest-Key", required: true })
  @ApiOkResponse({ description: "Telemetry ingest acceptance response" })
  ingest(@Body() dto: TelemetryIngestDto): Promise<TelemetryIngestResult> {
    return this.telemetryService.ingest(dto);
  }
}
