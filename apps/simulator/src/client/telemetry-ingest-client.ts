import { TelemetryEventPayload } from "../scenarios/normal-telemetry";

export type IngestResponse = {
  accepted: true;
  duplicate: boolean;
  readingsCreated: number;
};

export class TelemetryIngestClient {
  constructor(
    private readonly apiBaseUrl: string,
    private readonly ingestKey: string
  ) {}

  async ingest(event: TelemetryEventPayload): Promise<IngestResponse> {
    const response = await fetch(`${this.apiBaseUrl}/telemetry/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Ingest-Key": this.ingestKey
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Telemetry ingest failed with ${response.status}: ${body}`);
    }

    return response.json() as Promise<IngestResponse>;
  }
}
