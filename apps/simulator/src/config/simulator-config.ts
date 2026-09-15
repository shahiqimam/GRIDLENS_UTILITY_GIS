export type SimulatorConfig = {
  apiBaseUrl: string;
  ingestKey: string;
  seed: number;
};

function readRequired(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required simulator environment variable: ${name}`);
  }
  return value;
}

export function loadSimulatorConfig(): SimulatorConfig {
  return {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1",
    ingestKey: readRequired("TELEMETRY_INGEST_KEY"),
    seed: Number(process.env.SIMULATOR_SEED ?? 90210)
  };
}
