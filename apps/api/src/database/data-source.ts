import "reflect-metadata";
import { config } from "dotenv";
import { DataSource } from "typeorm";
import { Feeder } from "../network/feeder.entity";
import { NetworkNode } from "../network/network-node.entity";
import { NetworkSegment } from "../network/network-segment.entity";
import { ServiceArea } from "../network/service-area.entity";
import { Substation } from "../network/substation.entity";
import { Transformer } from "../network/transformer.entity";
import { DetectedFault } from "../rules/detected-fault.entity";
import { FaultRuleConfig } from "../rules/fault-rule-config.entity";
import { TelemetryDevice } from "../telemetry/telemetry-device.entity";
import { TelemetryReading } from "../telemetry/telemetry-reading.entity";
import { User } from "../users/user.entity";
import { InitialUsersAndPostgis1726400000000 } from "./migrations/1726400000000-initial-users-and-postgis";
import { NetworkModelAndSeed1726400100000 } from "./migrations/1726400100000-network-model-and-seed";
import { TelemetryModelAndSeed1726400200000 } from "./migrations/1726400200000-telemetry-model-and-seed";
import { FaultRuleConfigSeed1726400300000 } from "./migrations/1726400300000-fault-rule-config-seed";
import { DetectedFaults1726400400000 } from "./migrations/1726400400000-detected-faults";

config({ path: "../../.env" });
config();

function readNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  return raw ? Number(raw) : fallback;
}

export default new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST ?? "localhost",
  port: readNumber("DATABASE_PORT", 5432),
  database: process.env.DATABASE_NAME ?? "gridlens",
  username: process.env.DATABASE_USER ?? "gridlens",
  password: process.env.DATABASE_PASSWORD ?? "gridlens_dev_password",
  entities: [User, Substation, NetworkNode, Feeder, NetworkSegment, Transformer, ServiceArea, TelemetryDevice, TelemetryReading, FaultRuleConfig, DetectedFault],
  migrations: [
    InitialUsersAndPostgis1726400000000,
    NetworkModelAndSeed1726400100000,
    TelemetryModelAndSeed1726400200000,
    FaultRuleConfigSeed1726400300000,
    DetectedFaults1726400400000
  ],
  synchronize: false
});
