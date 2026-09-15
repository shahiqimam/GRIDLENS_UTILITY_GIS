import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsEnum, IsISO8601, IsNumber, IsString, Length, ValidateNested } from "class-validator";
import { TelemetryMetric, TelemetryQuality } from "../telemetry.enums";

export class TelemetryMetricDto {
  @IsEnum(TelemetryMetric)
  metric!: TelemetryMetric;

  @IsNumber()
  value!: number;

  @IsString()
  @Length(1, 24)
  unit!: string;

  @IsEnum(TelemetryQuality)
  quality!: TelemetryQuality;
}

export class TelemetryIngestDto {
  @IsString()
  @Length(1, 120)
  sourceEventId!: string;

  @IsString()
  @Length(1, 80)
  deviceCode!: string;

  @IsISO8601()
  recordedAt!: string;

  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => TelemetryMetricDto)
  metrics!: TelemetryMetricDto[];
}
