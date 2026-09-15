import { Transform } from "class-transformer";
import { IsInt, IsNumber, Max, Min } from "class-validator";

function toNumber(value: unknown): number {
  return typeof value === "string" ? Number(value) : Number(value);
}

export class MapViewportDto {
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @Min(-180)
  @Max(180)
  west!: number;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @Min(-90)
  @Max(90)
  south!: number;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @Min(-180)
  @Max(180)
  east!: number;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @Min(-90)
  @Max(90)
  north!: number;

  @Transform(({ value }) => (value === undefined ? 500 : Number(value)))
  @IsInt()
  @Min(1)
  @Max(1000)
  limit = 500;
}
