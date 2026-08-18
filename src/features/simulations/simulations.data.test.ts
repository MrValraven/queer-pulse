import { describe, expect, it } from "vitest";
import { SIM_GROUPS, findSimFlow, withSandboxFlag } from "./simulations.data";

const allFlows = SIM_GROUPS.flatMap((group) => group.flows);

describe("simulation flow data", () => {
  it("gives every flow a unique, url-safe id", () => {
    const ids = allFlows.map((flow) => flow.id);
    expect(ids.every((id) => /^[a-z0-9-]+$/.test(id))).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("looks a flow up by id", () => {
    const first = allFlows[0];
    if (!first) throw new Error("expected at least one flow");
    expect(findSimFlow(first.id)).toEqual(first);
    expect(findSimFlow("does-not-exist")).toBeUndefined();
  });
});

describe("withSandboxFlag", () => {
  it("appends ?sandbox=1 to a bare path", () => {
    expect(withSandboxFlag("/sign-in")).toBe("/sign-in?sandbox=1");
  });

  it("appends &sandbox=1 to a path that already has a query string", () => {
    expect(withSandboxFlag("/sign-in?ref=email")).toBe(
      "/sign-in?ref=email&sandbox=1",
    );
  });
});
