import { describe, expect, it } from "vitest";
import { linkedPersonaHandleCandidate } from "../personaHandle";
import type { RestrictedState } from "../api/subprofiles.api";
import {
  DEMO_SUBPROFILES,
  findDemoSubprofileByHandle,
  resolvePublicAccessDemo,
  validatePublishDemo,
  type DemoSubprofile,
} from "./subprofiles.data";

// Unrun per repo policy (`do-not-run-tests-unless-asked`): verified statically.

/**
 * `DEMO_SUBPROFILES` also carries `QUEST_DEMO_SUBPROFILES` (from
 * `questDemoSubprofiles.data.ts`, a file this task did not touch), which has
 * one linked persona, LANTERNA_COSPLAY, whose handle still equals its own
 * slug instead of `linkedPersonaHandleCandidate`'s creator-prefixed form.
 * The loop below is scoped to the linked rows this task assigned a literal,
 * helper-derived handle to; the report flags LANTERNA_COSPLAY as needing the
 * same fix in its own file.
 */
const HANDLE_ASSIGNED_LINKED_PERSONA_IDS = new Set([
  "sp-rui-dev",
  "sp-anika-writer",
  "sp-maria-therapist",
  "sp-jordan-lechatdashinko",
  "sp-jordan-iron-orchid",
]);

function findFixture(id: string): DemoSubprofile {
  const subprofile = DEMO_SUBPROFILES.find((candidate) => candidate.id === id);
  if (!subprofile)
    throw new Error(`Fixture ${id} is missing from DEMO_SUBPROFILES`);
  return subprofile;
}

describe("linked demo personas carry a helper-derived handle", () => {
  it("matches linkedPersonaHandleCandidate(ownerSlug, slug) for every linked persona this task assigned a handle to", () => {
    const linkedPersonas = DEMO_SUBPROFILES.filter(
      (subprofile) =>
        subprofile.linkVisibility === "linked" &&
        HANDLE_ASSIGNED_LINKED_PERSONA_IDS.has(subprofile.id),
    );
    expect(linkedPersonas).toHaveLength(
      HANDLE_ASSIGNED_LINKED_PERSONA_IDS.size,
    );
    for (const persona of linkedPersonas) {
      expect(persona.handle).toBe(
        linkedPersonaHandleCandidate(persona.ownerSlug, persona.slug),
      );
    }
  });
});

describe("findDemoSubprofileByHandle", () => {
  it("resolves a linked persona by its helper-derived handle", () => {
    const found = findDemoSubprofileByHandle("rui-engineering");
    expect(found?.id).toBe("sp-rui-dev");
  });

  it("still resolves an unlinked persona by its handle", () => {
    const found = findDemoSubprofileByHandle("nightform");
    expect(found?.id).toBe("sp-diogo-nightform");
  });

  it("does not fall back to a linked persona's internal slug", () => {
    // The unlinked fallback exists so a handle-less draft still opens by
    // slug; a linked persona has no such fallback, since its address stays
    // at /members/<owner>/<slug> until it publishes and claims a handle.
    expect(findDemoSubprofileByHandle("engineering")).toBeUndefined();
  });
});

describe("resolvePublicAccessDemo for a linked persona", () => {
  it("answers members-only for a signed-out visitor, the same wall as network", () => {
    const linkedPersona = findFixture("sp-rui-dev");
    const result = resolvePublicAccessDemo(linkedPersona, null);
    expect(result).toEqual({
      kind: "restricted",
      restricted: "members_only" satisfies RestrictedState,
    });
  });

  it("still lets a signed-in visitor through", () => {
    const linkedPersona = findFixture("sp-rui-dev");
    const result = resolvePublicAccessDemo(linkedPersona, "some-other-member");
    expect(result.kind).toBe("ok");
  });
});

describe("validatePublishDemo for a linked persona", () => {
  it("returns no unmet codes for a linked DTO with no typed handle", () => {
    const dto = { ...findFixture("sp-anika-writer"), handle: null };
    expect(validatePublishDemo(dto)).toEqual([]);
  });

  it("checks only the handle format for a linked DTO with a typed handle", () => {
    const dto = { ...findFixture("sp-anika-writer"), handle: "x" };
    expect(validatePublishDemo(dto)).toEqual(["handle_invalid"]);
  });
});
