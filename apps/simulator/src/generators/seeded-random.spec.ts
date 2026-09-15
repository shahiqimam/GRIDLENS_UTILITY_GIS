import { SeededRandom } from "./seeded-random";

describe("SeededRandom", () => {
  it("returns a repeatable sequence for the same seed", () => {
    const first = new SeededRandom(1234);
    const second = new SeededRandom(1234);

    expect([first.next(), first.next(), first.next()]).toEqual([second.next(), second.next(), second.next()]);
  });
});
