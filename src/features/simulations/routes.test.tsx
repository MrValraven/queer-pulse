import { describe, expect, it } from "vitest";
import { simulationRoutes } from "./routes";

describe("simulationRoutes", () => {
  it("returns route elements in dev", () => {
    // import.meta.env.DEV is true under vitest
    expect(simulationRoutes()).not.toBeNull();
  });
});
