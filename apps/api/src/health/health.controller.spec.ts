import { HealthController } from "./health.controller";

describe("HealthController", () => {
  const controller = new HealthController();

  it("returns the liveness status", () => {
    expect(controller.health()).toEqual({ status: "ok", service: "gridlens-api" });
  });

  it("returns the readiness status", () => {
    expect(controller.ready()).toEqual({ status: "ok", dependencies: [] });
  });
});
