import "reflect-metadata";
import { config } from "dotenv";
import { DataSource } from "typeorm";
import { Feeder } from "../network/feeder.entity";
import { NetworkNode } from "../network/network-node.entity";
import { NetworkSegment } from "../network/network-segment.entity";
import { ServiceArea } from "../network/service-area.entity";
import { Substation } from "../network/substation.entity";
import { Transformer } from "../network/transformer.entity";
import { User } from "../users/user.entity";
import { InitialUsersAndPostgis1726400000000 } from "./migrations/1726400000000-initial-users-and-postgis";
import { NetworkModelAndSeed1726400100000 } from "./migrations/1726400100000-network-model-and-seed";

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
  entities: [User, Substation, NetworkNode, Feeder, NetworkSegment, Transformer, ServiceArea],
  migrations: [InitialUsersAndPostgis1726400000000, NetworkModelAndSeed1726400100000],
  synchronize: false
});
