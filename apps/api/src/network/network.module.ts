import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Feeder } from "./feeder.entity";
import { NetworkController } from "./network.controller";
import { NetworkNode } from "./network-node.entity";
import { NetworkSegment } from "./network-segment.entity";
import { NetworkService } from "./network.service";
import { ServiceArea } from "./service-area.entity";
import { Substation } from "./substation.entity";
import { Transformer } from "./transformer.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Substation, NetworkNode, Feeder, NetworkSegment, Transformer, ServiceArea])],
  controllers: [NetworkController],
  providers: [NetworkService],
  exports: [NetworkService]
})
export class NetworkModule {}
