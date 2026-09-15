import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { timingSafeEqual } from "crypto";
import { AppConfig } from "../../config/configuration";

@Injectable()
export class IngestKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService<AppConfig, true>) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const providedHeader = request.headers["x-ingest-key"];
    const providedKey = Array.isArray(providedHeader) ? providedHeader[0] : providedHeader;
    const expectedKey = this.configService.get("telemetryIngestKey", { infer: true });

    if (!providedKey || !this.keysMatch(providedKey, expectedKey)) {
      throw new UnauthorizedException("Invalid ingest key");
    }

    return true;
  }

  private keysMatch(providedKey: string, expectedKey: string): boolean {
    const provided = Buffer.from(providedKey);
    const expected = Buffer.from(expectedKey);

    return provided.length === expected.length && timingSafeEqual(provided, expected);
  }
}
