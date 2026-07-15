import { describe, expect, it } from "vitest";
import { buildExports } from "./SettingsPanes";
import { currentUser } from "../members/data/members";

describe("buildExports", () => {
  it("builds the export payload from the real member, not the old Sofia mock", () => {
    const name = `${currentUser.first} ${currentUser.last}`.trim();
    const out = buildExports("real@example.com", name, currentUser);
    expect(out.full.payload.account.email).toBe("real@example.com");
    expect(out.full.payload.account.name).toBe(name);
    expect(JSON.stringify(out)).not.toContain("Sofia Andrade");
    expect(JSON.stringify(out)).not.toContain("sofia.andrade@email.com");
  });
});
