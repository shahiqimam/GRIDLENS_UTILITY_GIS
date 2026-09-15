import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { MapViewportDto } from "./dto/map-viewport.dto";
import { MapService } from "./map.service";
import {
  GeoJsonFeatureCollection,
  SegmentMapProperties,
  ServiceAreaMapProperties,
  SubstationMapProperties,
  TransformerMapProperties
} from "./map.types";

@ApiTags("map")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: "map", version: "1" })
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get("substations")
  @ApiOkResponse({ description: "Viewport-filtered synthetic substation GeoJSON" })
  getSubstations(@Query() viewport: MapViewportDto): Promise<GeoJsonFeatureCollection<SubstationMapProperties>> {
    return this.mapService.getSubstations(viewport);
  }

  @Get("segments")
  @ApiOkResponse({ description: "Viewport-filtered synthetic network segment GeoJSON" })
  getSegments(@Query() viewport: MapViewportDto): Promise<GeoJsonFeatureCollection<SegmentMapProperties>> {
    return this.mapService.getSegments(viewport);
  }

  @Get("transformers")
  @ApiOkResponse({ description: "Viewport-filtered synthetic transformer GeoJSON" })
  getTransformers(@Query() viewport: MapViewportDto): Promise<GeoJsonFeatureCollection<TransformerMapProperties>> {
    return this.mapService.getTransformers(viewport);
  }

  @Get("service-areas")
  @ApiOkResponse({ description: "Viewport-filtered synthetic service area GeoJSON" })
  getServiceAreas(@Query() viewport: MapViewportDto): Promise<GeoJsonFeatureCollection<ServiceAreaMapProperties>> {
    return this.mapService.getServiceAreas(viewport);
  }
}
