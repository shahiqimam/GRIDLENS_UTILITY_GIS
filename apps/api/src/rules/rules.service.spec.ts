import { TelemetryAssetType } from "../telemetry/telemetry.enums";
import { FaultRuleType } from "./rules.enums";
import { RulesService } from "./rules.service";

function makeRepository(overrides: Record<string, unknown>) {
  return overrides;
}

describe("RulesService", () => {
  it("returns normalized rule configuration views", async () => {
    const service = new RulesService(
      makeRepository({
        find: jest.fn().mockResolvedValue([
          {
            id: "rule-1",
            ruleType: FaultRuleType.FeederVoltageLoss,
            enabled: true,
            assetType: TelemetryAssetType.Feeder,
            warningThreshold: null,
            criticalThreshold: "1.0000",
            consecutiveCount: 3,
            timeoutSeconds: null
          }
        ])
      }) as never
    );

    await expect(service.listConfigs()).resolves.toEqual([
      {
        id: "rule-1",
        ruleType: "FEEDER_VOLTAGE_LOSS",
        enabled: true,
        assetType: "FEEDER",
        warningThreshold: null,
        criticalThreshold: 1,
        consecutiveCount: 3,
        timeoutSeconds: null
      }
    ]);
  });
});
