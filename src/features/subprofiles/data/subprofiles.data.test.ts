import { afterEach, describe, expect, it } from "vitest";
import { currentUserSlug } from "../../members/data/members";
import {
  DEMO_CO_OWNED_SUBPROFILE_ID,
  mockLeavePersona,
  mockMineSubprofiles,
  mockPersonaMembers,
  mockSubprofileById,
  resetDemoPersonaMembersForTests,
} from "./subprofiles.data";

// Unrun per repo policy (`do-not-run-tests-unless-asked`): verified statically.

/**
 * `mockLeavePersona` is demo's stand-in for the backend's
 * creator-transfer-on-leave rule: the only demo persona modelling
 * co-ownership (`DEMO_CO_OWNED_SUBPROFILE_ID`) starts as `currentUserSlug`
 * (creator) plus "rui" (co-owner, reusing the already-seeded Rui Marçal
 * identity, see `CO_OWNER_MEMBER` above it in `subprofiles.data.ts`). These
 * specs lock down both directions of a leave (creator vs. co-owner) and the
 * no-op for every other persona id, which `mockPersonaMembers` (read by
 * `useSubprofileMembers`'s query, after the leave mutation invalidates it)
 * has to reflect afterwards.
 */
const CO_OWNER_USER_ID = "rui";

describe("mockPersonaMembers / mockLeavePersona", () => {
  afterEach(() => {
    resetDemoPersonaMembersForTests();
  });

  it("starts the co-owned demo persona with the current user as creator and Rui as co-owner", () => {
    const members = mockPersonaMembers(DEMO_CO_OWNED_SUBPROFILE_ID);
    expect(members.map((member) => member.userId).sort()).toEqual(
      [currentUserSlug, CO_OWNER_USER_ID].sort(),
    );
    expect(
      members.find((member) => member.userId === currentUserSlug)?.isCreator,
    ).toBe(true);
    expect(
      members.find((member) => member.userId === CO_OWNER_USER_ID)?.isCreator,
    ).toBe(false);
  });

  it("returns the current user as sole creator for every other persona id", () => {
    const members = mockPersonaMembers("sp-some-other-persona");
    const [soleMember] = members;
    expect(members).toHaveLength(1);
    expect(soleMember?.userId).toBe(currentUserSlug);
    expect(soleMember?.isCreator).toBe(true);
  });

  it("promotes the co-owner to creator when the creator leaves", () => {
    const afterLeave = mockLeavePersona(
      DEMO_CO_OWNED_SUBPROFILE_ID,
      currentUserSlug,
    );

    const [newCreator] = afterLeave;
    expect(afterLeave).toHaveLength(1);
    expect(newCreator?.userId).toBe(CO_OWNER_USER_ID);
    expect(newCreator?.isCreator).toBe(true);

    // The mutation is visible on the next read, matching how the real leave
    // mutation's cache invalidation re-runs the members query.
    expect(mockPersonaMembers(DEMO_CO_OWNED_SUBPROFILE_ID)).toEqual(afterLeave);
  });

  it("keeps the creator in place when a co-owner leaves", () => {
    const afterLeave = mockLeavePersona(
      DEMO_CO_OWNED_SUBPROFILE_ID,
      CO_OWNER_USER_ID,
    );

    const [remainingCreator] = afterLeave;
    expect(afterLeave).toHaveLength(1);
    expect(remainingCreator?.userId).toBe(currentUserSlug);
    expect(remainingCreator?.isCreator).toBe(true);
  });

  it("is a no-op for a persona id demo doesn't model as co-owned", () => {
    const before = mockPersonaMembers("sp-some-other-persona");
    const afterLeave = mockLeavePersona(
      "sp-some-other-persona",
      currentUserSlug,
    );
    expect(afterLeave).toEqual(before);
  });
});

/**
 * The owner DTOs demo hands the editor and dashboard have to agree with the
 * roster above. `memberCount` is what `PersonaDangerZone` and
 * `usePersonaIsCreator` read to decide whether a persona is shared, so a
 * missing count hides the creator's Leave row in demo. After a demo Leave the
 * viewer no longer belongs to the persona, so it drops out of "mine" and the
 * owner read, the same as live.
 */
describe("owner DTOs follow the co-owned demo roster", () => {
  afterEach(() => {
    resetDemoPersonaMembersForTests();
  });

  const findMine = () =>
    mockMineSubprofiles().find(
      (persona) => persona.id === DEMO_CO_OWNED_SUBPROFILE_ID,
    );

  it("reports the roster headcount as memberCount on the co-owned persona", () => {
    expect(findMine()?.memberCount).toBe(2);
    expect(mockSubprofileById(DEMO_CO_OWNED_SUBPROFILE_ID)?.memberCount).toBe(
      mockPersonaMembers(DEMO_CO_OWNED_SUBPROFILE_ID).length,
    );
  });

  it("reports a memberCount of 1 on a solo-owned persona", () => {
    expect(mockSubprofileById("sp-rui-dev")?.memberCount).toBe(1);
  });

  it("shrinks memberCount when a co-owner leaves, keeping the persona in mine", () => {
    mockLeavePersona(DEMO_CO_OWNED_SUBPROFILE_ID, CO_OWNER_USER_ID);
    expect(findMine()?.memberCount).toBe(1);
  });

  it("drops the persona from mine and the owner read once the viewer leaves", () => {
    mockLeavePersona(DEMO_CO_OWNED_SUBPROFILE_ID, currentUserSlug);
    expect(findMine()).toBeUndefined();
    expect(mockSubprofileById(DEMO_CO_OWNED_SUBPROFILE_ID)).toBeNull();
  });
});
