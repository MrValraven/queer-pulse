import { describe, expect, it } from "vitest";
import { isGatedPath } from "./authGate";

describe("month page auth gate", () => {
  it("gates the month page", () => {
    expect(isGatedPath("/create-gathering/month")).toBe(true);
    expect(isGatedPath("/create-gathering")).toBe(true);
  });
});
