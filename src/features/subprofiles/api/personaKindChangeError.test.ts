import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  PersonaKindChangeError,
  toPersonaKindChangeError,
} from "./personaKindChangeError";

const refusal = (data: object) => new ApiError(422, "refused", data);

describe("toPersonaKindChangeError", () => {
  it("reads each C2 code with its details", () => {
    expect(
      toPersonaKindChangeError(refusal({ code: "PERSONA_KIND_UNCHANGED" }))
        ?.details,
    ).toEqual({ reason: "unchanged" });
    expect(
      toPersonaKindChangeError(
        refusal({
          code: "PERSONA_KIND_OTHER_FAMILY",
          currentFamily: "stage",
          requestedFamily: "workshop",
        }),
      )?.details,
    ).toEqual({
      reason: "other_family",
      currentFamily: "stage",
      requestedFamily: "workshop",
    });
    expect(
      toPersonaKindChangeError(
        refusal({
          code: "PERSONA_KIND_STUDIO_RELEASES",
          releaseCount: 3,
          requestedHasStudio: false,
        }),
      )?.details,
    ).toEqual({
      reason: "studio_releases",
      releaseCount: 3,
      requestedHasStudio: false,
    });
    expect(
      toPersonaKindChangeError(
        refusal({ code: "PERSONA_KIND_STUDIO_TAKEN_DOWN", takenDownCount: 1 }),
      )?.reason,
    ).toBe("studio_taken_down");
  });

  it("names the code in the error message", () => {
    const error = toPersonaKindChangeError(
      refusal({ code: "PERSONA_KIND_UNCHANGED" }),
    );
    expect(error).toBeInstanceOf(PersonaKindChangeError);
    expect(error?.message).toBe(
      "Persona type change refused: PERSONA_KIND_UNCHANGED",
    );
  });

  it.each([
    ["a plain Error", new Error("offline")],
    ["a 409", new ApiError(409, "conflict", { code: "PERSONA_EDIT_CONFLICT" })],
    ["an unknown code", refusal({ code: "PERSONA_KIND_SOMETHING_NEW" })],
    [
      "an unknown family",
      refusal({
        code: "PERSONA_KIND_OTHER_FAMILY",
        currentFamily: "moon",
        requestedFamily: "stage",
      }),
    ],
    [
      "a string count",
      refusal({
        code: "PERSONA_KIND_STUDIO_RELEASES",
        releaseCount: "3",
        requestedHasStudio: false,
      }),
    ],
    [
      "a zero count",
      refusal({ code: "PERSONA_KIND_STUDIO_TAKEN_DOWN", takenDownCount: 0 }),
    ],
  ])("returns null for %s", (_label, error) => {
    expect(toPersonaKindChangeError(error)).toBeNull();
  });
});
