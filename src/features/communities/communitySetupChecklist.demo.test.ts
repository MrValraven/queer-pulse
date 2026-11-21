import { describe, expect, it } from "vitest";
import { getLiving } from "./livingCommunities.data";
import {
  demoSetupChecklistFor,
  type DemoSetupChecklistInput,
} from "./communitySetupChecklist.demo";

// queer-runners seeds one owner (monica) and two mods (carla, diogo).
const living = getLiving("queer-runners")!;

const staffInput: DemoSetupChecklistInput = {
  role: "mod",
  isSpace: false,
  living,
  foundingStewardCount: null,
  sharedPostCount: 0,
  override: undefined,
};

describe("demoSetupChecklistFor", () => {
  it("counts the demo roster's owner and mods as staff", () => {
    expect(demoSetupChecklistFor(staffInput)?.staffCount).toBe(3);
  });

  it("counts pinned, pulse and shared demo posts", () => {
    expect(
      demoSetupChecklistFor({ ...staffInput, sharedPostCount: 2 })?.postCount,
    ).toBe(living.pinned.length + living.pulse.length + 2);
  });

  it("reads dismissal from the demo override", () => {
    expect(demoSetupChecklistFor(staffInput)?.isDismissed).toBe(false);
    expect(
      demoSetupChecklistFor({
        ...staffInput,
        override: { setupChecklistDismissed: true },
      })?.isDismissed,
    ).toBe(true);
  });

  it("answers null for a member, a visitor and a space", () => {
    expect(demoSetupChecklistFor({ ...staffInput, role: "member" })).toBeNull();
    expect(demoSetupChecklistFor({ ...staffInput, role: null })).toBeNull();
    expect(
      demoSetupChecklistFor({ ...staffInput, role: "owner", isSpace: true }),
    ).toBeNull();
  });

  it("falls back to the founding stewards for a community founded this session", () => {
    expect(
      demoSetupChecklistFor({
        role: "owner",
        isSpace: false,
        living: undefined,
        foundingStewardCount: 2,
        sharedPostCount: 0,
        override: undefined,
      }),
    ).toEqual({ isDismissed: false, staffCount: 2, postCount: 0 });
  });

  it("floors the staff count at one when the demo roster holds no staff", () => {
    const membersOnlyLiving = {
      ...living,
      roster: living.roster.filter((entry) => entry.role === "member"),
    };
    expect(membersOnlyLiving.roster.length).toBeGreaterThan(0);
    expect(
      demoSetupChecklistFor({ ...staffInput, living: membersOnlyLiving })
        ?.staffCount,
    ).toBe(1);
  });

  it("counts one steward when there is no fixture and no founding stewards", () => {
    expect(
      demoSetupChecklistFor({
        role: "owner",
        isSpace: false,
        living: undefined,
        foundingStewardCount: null,
        sharedPostCount: 0,
        override: undefined,
      }),
    ).toEqual({ isDismissed: false, staffCount: 1, postCount: 0 });
  });
});
