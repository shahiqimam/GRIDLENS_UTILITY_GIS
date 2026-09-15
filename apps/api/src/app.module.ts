import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { configuration, AppConfig } from "./config/configuration";
import { HealthModule } from "./health/health.module";
import { Feeder } from "./network/feeder.entity";
import { NetworkNode } from "./network/network-node.entity";
import { NetworkSegment } from "./network/network-segment.entity";
import { NetworkModule } from "./network/network.module";
import { ServiceArea } from "./network/service-area.entity";
import { Substation } from "./network/substation.entity";
import { Transformer } from "./network/transformer.entity";
import { User } from "./users/user.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env", ".env"],
      load: [configuration]
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => ({
        type: "postgres",
        host: configService.get("database.host", { infer: true }),
        port: configService.get("database.port", { infer: true }),
        database: configService.get("database.name", { infer: true }),
        username: configService.get("database.user", { infer: true }),
        password: configService.get("database.password", { infer: true }),
        entities: [User, Substation, NetworkNode, Feeder, NetworkSegment, Transformer, ServiceArea],
        migrations: ["dist/database/migrations/*.js"],
        synchronize: false,
        autoLoadEntities: true
      })
    }),
    HealthModule,
    AuthModule,
    NetworkModule
  ]
})
export class AppModule {}
