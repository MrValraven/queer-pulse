import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  PERSONA_WALL_REASON_CODES,
  type PersonaWallPickDTO,
  type PersonaWallPublicState,
} from "../../subprofiles/api/personaWall.api";
import {
  desktopOnlyPickIds,
  PERSONA_WALL_ERROR_VALUES,
  PERSONA_WALL_FAILURE_KEY,
  PERSONA_WALL_PHONE_TILES,
  PERSONA_WALL_REASON_KEY,
  PERSONA_WALL_STATE_CHIP_KEY,
  PERSONA_WALL_STATE_REASON_KEY,
  personaKindLabelKey,
  personaWallErrorKeyOf,
} from "./personaWallAdmin.model";

const UNKNOWN_STATE_KEY = "admin:personaWall.error.notListed.unknownState";

function conflictWith(body: Record<string, unknown>): ApiError {
  return new ApiError(409, "Conflict", {
    statusCode: 409,
    message: "Conflict",
    error: "Conflict",
    ...body,
  });
}

function pickAt(
  position: number,
  publicState: PersonaWallPublicState = "shown",
): PersonaWallPickDTO {
  return {
    id: `pick-${position}`,
    position,
    publicState,
    persona: {
      id: `persona-${position}`,
      handle: null,
      displayName: `Persona ${position}`,
      kind: "musician",
      imageUrl: null,
      imageCrop: null,
      imageSource: null,
      accent: null,
    },
  };
}

describe("personaWallErrorKeyOf", () => {
  it.each(PERSONA_WALL_REASON_CODES)("names the cause for %s", (code) => {
    expect(
      personaWallErrorKeyOf(
        new ApiError(409, "Conflict", {
          statusCode: 409,
          message: "Conflict",
          code,
        }),
      ),
    ).toBe(PERSONA_WALL_REASON_KEY[code]);
  });

  it("gives each reason its own line", () => {
    expect(new Set(Object.values(PERSONA_WALL_REASON_KEY)).size).toBe(7);
  });

  it.each(["draft", "not_open", "removed", "taken_down"] as const)(
    "names the %s state on a not-listed refusal",
    (publicState) => {
      const refusal = conflictWith({
        code: "PERSONA_WALL_NOT_LISTED",
        publicState,
      });
      expect(personaWallErrorKeyOf(refusal)).toBe(
        `admin:personaWall.error.notListed.${publicState}`,
      );
    },
  );

  it("names all four causes when a not-listed refusal carries no state", () => {
    expect(
      personaWallErrorKeyOf(conflictWith({ code: "PERSONA_WALL_NOT_LISTED" })),
    ).toBe(UNKNOWN_STATE_KEY);
    expect(
      personaWallErrorKeyOf(
        conflictWith({ code: "PERSONA_WALL_NOT_LISTED", publicState: "shown" }),
      ),
    ).toBe(UNKNOWN_STATE_KEY);
    expect(
      personaWallErrorKeyOf(
        conflictWith({
          code: "PERSONA_WALL_NOT_LISTED",
          publicState: "made_up",
        }),
      ),
    ).toBe(UNKNOWN_STATE_KEY);
  });

  it("names missing admin access for a 403 with no code", () => {
    expect(personaWallErrorKeyOf(new ApiError(403, "Forbidden"))).toBe(
      "admin:personaWall.failure.forbidden",
    );
  });

  it("names the server for a 500 with no code", () => {
    expect(personaWallErrorKeyOf(new ApiError(500, "Internal"))).toBe(
      "admin:personaWall.failure.server",
    );
  });

  it("falls back to the status for an unknown code", () => {
    expect(personaWallErrorKeyOf(conflictWith({ code: "MADE_UP" }))).toBe(
      "admin:personaWall.failure.unknown",
    );
  });

  it("gives each failure its own line", () => {
    const failureKeys = Object.values(PERSONA_WALL_FAILURE_KEY);
    expect(new Set(failureKeys).size).toBe(failureKeys.length);
  });

  it("quotes the wall size", () => {
    expect(PERSONA_WALL_ERROR_VALUES).toEqual({ max: 9 });
  });
});

describe("persona wall states", () => {
  it("has a chip and a reason for every hidden state", () => {
    expect(Object.keys(PERSONA_WALL_STATE_CHIP_KEY).sort()).toEqual([
      "draft",
      "not_open",
      "removed",
      "taken_down",
    ]);
    expect(Object.keys(PERSONA_WALL_STATE_REASON_KEY).sort()).toEqual([
      "draft",
      "not_open",
      "removed",
      "taken_down",
    ]);
  });
});

describe("desktopOnlyPickIds", () => {
  it("draws six tiles on a phone", () => {
    expect(PERSONA_WALL_PHONE_TILES).toBe(6);
  });

  it("marks shown picks after the sixth as desktop only", () => {
    const picks = Array.from({ length: 8 }, (_unused, index) =>
      pickAt(index + 1),
    );
    expect([...desktopOnlyPickIds(picks)].sort()).toEqual(["pick-7", "pick-8"]);
  });

  it("counts only shown picks toward the phone's six", () => {
    const picks = Array.from({ length: 8 }, (_unused, index) =>
      pickAt(index + 1, index === 1 ? "draft" : "shown"),
    );
    const desktopOnly = desktopOnlyPickIds(picks);
    expect([...desktopOnly]).toEqual(["pick-8"]);
    expect(desktopOnly.has("pick-2")).toBe(false);
  });
});

describe("personaKindLabelKey", () => {
  it("reads the label key of a known kind", () => {
    expect(personaKindLabelKey("musician")).toBe("subprofiles:kind.musician");
  });

  it("answers null for a kind this build does not know", () => {
    expect(personaKindLabelKey("made_up")).toBeNull();
    expect(personaKindLabelKey("toString")).toBeNull();
  });
});
