import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import type { TFunction } from "../../shared/i18n/types";
import { PersonaKindChangeError } from "./api/personaKindChangeError";
import { describePersonaKindChangeError } from "./personaKindChangeCopy";

const stubT: TFunction = (key, values) =>
  values ? `${key}|${JSON.stringify(values)}` : key;

describe("describePersonaKindChangeError", () => {
  it("names a group refusal with both groups", () => {
    const error = new PersonaKindChangeError({
      reason: "other_family",
      currentFamily: "stage",
      requestedFamily: "workshop",
    });
    expect(describePersonaKindChangeError(error, "ceramicist", stubT)).toBe(
      'subprofiles:kindChange.error.otherFamily|{"kind":"subprofiles:kind.ceramicist","currentFamily":"subprofiles:family.stage.label","requestedFamily":"subprofiles:family.workshop.label"}',
    );
  });

  it("picks the no-format line when the new type has no Studio format", () => {
    const error = new PersonaKindChangeError({
      reason: "studio_releases",
      releaseCount: 3,
      requestedHasStudio: false,
    });
    expect(describePersonaKindChangeError(error, "ceramicist", stubT)).toBe(
      'subprofiles:kindChange.error.studioNoFormat|{"count":3,"kind":"subprofiles:kind.ceramicist"}',
    );
  });

  it("picks the other-format line when the new type publishes elsewhere in Studio", () => {
    const error = new PersonaKindChangeError({
      reason: "studio_releases",
      releaseCount: 3,
      requestedHasStudio: true,
    });
    expect(describePersonaKindChangeError(error, "ceramicist", stubT)).toBe(
      'subprofiles:kindChange.error.studioOtherFormat|{"count":3,"kind":"subprofiles:kind.ceramicist"}',
    );
  });

  it("names our team's takedown with its count", () => {
    const error = new PersonaKindChangeError({
      reason: "studio_taken_down",
      takenDownCount: 2,
    });
    expect(describePersonaKindChangeError(error, "ceramicist", stubT)).toBe(
      'subprofiles:kindChange.error.studioTakenDown|{"count":2}',
    );
  });

  it("uses the restriction copy for ACCOUNT_RESTRICTED", () => {
    const error = new ApiError(403, "Restricted", {
      code: "ACCOUNT_RESTRICTED",
    });
    expect(describePersonaKindChangeError(error, "ceramicist", stubT)).toBe(
      "shared:apiError.accountRestricted",
    );
  });

  it("parses a raw 422 ApiError too", () => {
    const error = new ApiError(422, "refused", {
      code: "PERSONA_KIND_UNCHANGED",
    });
    expect(describePersonaKindChangeError(error, "ceramicist", stubT)).toBe(
      'subprofiles:kindChange.error.unchanged|{"kind":"subprofiles:kind.ceramicist"}',
    );
  });

  it("frames anything else with the action and the retry tail", () => {
    const message = describePersonaKindChangeError(
      new Error("offline"),
      "ceramicist",
      stubT,
    );
    expect(message.startsWith("subprofiles:kindChange.error.action")).toBe(
      true,
    );
    expect(message).toContain("shared:apiError.tryAgainTail");
    expect(message).not.toContain("undefined");
  });
});
