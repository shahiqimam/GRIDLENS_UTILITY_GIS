import { config } from "dotenv";
import { TelemetryIngestClient } from "./client/telemetry-ingest-client";
import { loadSimulatorConfig } from "./config/simulator-config";
import { buildNormalTelemetryBatch } from "./scenarios/normal-telemetry";

config({ path: "../../.env" });
config();

async function main(): Promise<void> {
  const simulatorConfig = loadSimulatorConfig();
  const client = new TelemetryIngestClient(simulatorConfig.apiBaseUrl, simulatorConfig.ingestKey);
  const batch = buildNormalTelemetryBatch(simulatorConfig.seed, new Date());

  for (const event of batch) {
    const result = await client.ingest(event);
    console.log(`${event.sourceEventId} ${event.deviceCode} duplicate=${result.duplicate} readings=${result.readingsCreated}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
