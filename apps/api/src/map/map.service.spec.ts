import { BadRequestException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { MapService } from "./map.service";

function makeDataSource(rows: unknown[]) {
  return {
    query: jest.fn().mockResolvedValue(rows)
  } as unknown as DataSource;
}

const viewport = {
  west: -97,
  south: 32,
  east: -96,
  north: 33,
  limit: 500
};

describe("MapService", () => {
  it("returns viewport-filtered substation GeoJSON", async () => {
    const dataSource = makeDataSource([
      {
        id: "substation-1",
        code: "SS-SYN-01",
        name: "Synthetic North Substation",
        status: "ACTIVE",
        nominalVoltageKv: "33.00",
        geometry: { type: "Point", coordinates: [-96.8, 32.78] }
      }
    ]);
    const service = new MapService(dataSource);

    await expect(service.getSubstations(viewport)).resolves.toEqual({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "substation-1",
          geometry: { type: "Point", coordinates: [-96.8, 32.78] },
          properties: {
            layer: "substations",
            code: "SS-SYN-01",
            name: "Synthetic North Substation",
            status: "ACTIVE",
            nominalVoltageKv: 33
          }
        }
      ]
    });
    expect(dataSource.query).toHaveBeenCalledWith(expect.stringContaining("ST_MakeEnvelope"), [-97, 32, -96, 33, 500]);
  });

  it("rejects invalid bounding boxes", async () => {
    const service = new MapService(makeDataSource([]));

    await expect(
      service.getSegments({ west: -96, south: 32, east: -97, north: 33, limit: 500 })
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.getTransformers({ west: -97, south: 33, east: -96, north: 32, limit: 500 })
    ).rejects.toThrow(BadRequestException);
  });

  it("parses GeoJSON returned as text by the database driver", async () => {
    const dataSource = makeDataSource([
      {
        id: "tx-1",
        code: "TX-SYN-A-001",
        name: "Synthetic Transformer A1",
        feederId: "feeder-1",
        status: "ONLINE",
        capacityKva: 750,
        currentLoadPercent: "54.20",
        geometry: '{"type":"Point","coordinates":[-96.785,32.786]}'
      }
    ]);
    const service = new MapService(dataSource);

    const result = await service.getTransformers(viewport);

    expect(result.features[0]?.geometry).toEqual({ type: "Point", coordinates: [-96.785, 32.786] });
    expect(result.features[0]?.properties.currentLoadPercent).toBe(54.2);
  });
});
