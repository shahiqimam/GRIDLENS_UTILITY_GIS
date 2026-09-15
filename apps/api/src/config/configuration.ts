export type AppConfig = {
  nodeEnv: string;
  appOrigin: string;
  apiPort: number;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  redis: {
    host: string;
    port: number;
  };
  jwtSecret: string;
  telemetryIngestKey: string;
};

function readRequired(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function readNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Environment variable ${name} must be a positive integer`);
  }

  return parsed;
}

export function configuration(): AppConfig {
  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    appOrigin: process.env.APP_ORIGIN ?? "http://localhost:3000",
    apiPort: readNumber("API_PORT", 4000),
    database: {
      host: process.env.DATABASE_HOST ?? "localhost",
      port: readNumber("DATABASE_PORT", 5432),
      name: process.env.DATABASE_NAME ?? "gridlens",
      user: process.env.DATABASE_USER ?? "gridlens",
      password: process.env.DATABASE_PASSWORD ?? "gridlens_dev_password"
    },
    redis: {
      host: process.env.REDIS_HOST ?? "localhost",
      port: readNumber("REDIS_PORT", 6379)
    },
    jwtSecret: readRequired("JWT_SECRET"),
    telemetryIngestKey: readRequired("TELEMETRY_INGEST_KEY")
  };
}
