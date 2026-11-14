import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  LEAD_REASON_CODES,
  LEAD_REVERT_REFUSAL_REASONS,
} from "./api/leads.types";
import {
  LEAD_NOT_REVERTIBLE_KEY,
  LEAD_REASON_KEY,
  leadErrorKeyOf,
  leadErrorValuesOf,
} from "./leadErrors";

function refusalWith(status: number, body: Record<string, unknown>): ApiError {
  return new ApiError(status, "Conflict", {
    statusCode: status,
    message: "Conflict",
    ...body,
  });
}

describe("leadErrors", () => {
  it.each(LEAD_REASON_CODES)("names the cause for %s", (code) => {
    expect(
      leadErrorKeyOf(
        new ApiError(409, "Conflict", {
          statusCode: 409,
          message: "Conflict",
          code,
        }),
      ),
    ).toBe(LEAD_REASON_KEY[code]);
  });

  it("gives each code its own line", () => {
    expect(new Set(Object.values(LEAD_REASON_KEY)).size).toBe(25);
  });

  it.each(["draft", "not_open", "removed", "taken_down"] as const)(
    "names the %s state on a not-listed refusal",
    (publicState) => {
      expect(
        leadErrorKeyOf(
          refusalWith(409, { code: "LEAD_PERSONA_NOT_LISTED", publicState }),
        ),
      ).toBe(`admin:leads.error.personaNotListed.${publicState}`);
    },
  );

  it("names all four causes when a not-listed body carries no state", () => {
    expect(
      leadErrorKeyOf(refusalWith(409, { code: "LEAD_PERSONA_NOT_LISTED" })),
    ).toBe("admin:leads.error.personaNotListed.unknownState");
    expect(
      leadErrorKeyOf(
        refusalWith(409, {
          code: "LEAD_PERSONA_NOT_LISTED",
          publicState: "shown",
        }),
      ),
    ).toBe("admin:leads.error.personaNotListed.unknownState");
  });

  it.each(LEAD_REVERT_REFUSAL_REASONS)(
    "names the %s reason on a not-revertible refusal",
    (reason) => {
      expect(
        leadErrorKeyOf(
          refusalWith(409, { code: "LEAD_ENTRY_NOT_REVERTIBLE", reason }),
        ),
      ).toBe(`admin:leads.error.entryNotRevertible.${reason}`);
    },
  );

  it("gives each revert reason its own line", () => {
    expect(new Set(Object.values(LEAD_NOT_REVERTIBLE_KEY)).size).toBe(5);
  });

  it("says the change can no longer be undone for an unknown revert reason", () => {
    expect(
      leadErrorKeyOf(
        refusalWith(409, {
          code: "LEAD_ENTRY_NOT_REVERTIBLE",
          reason: "moon_phase",
        }),
      ),
    ).toBe("admin:leads.error.entryNotRevertible.unknownReason");
  });

  it("names a missing history line on a revert", () => {
    expect(
      leadErrorKeyOf(refusalWith(404, { code: "LEAD_ENTRY_NOT_FOUND" })),
    ).toBe("admin:leads.error.entryNotFound");
  });

  it("names missing access for a 403 with no code", () => {
    expect(leadErrorKeyOf(new ApiError(403, "Forbidden"))).toBe(
      "admin:leads.failure.forbidden",
    );
  });

  it("names the server for a 500 with no code", () => {
    expect(leadErrorKeyOf(new ApiError(500, "Internal Server Error"))).toBe(
      "admin:leads.failure.server",
    );
  });

  it("quotes the other lead and the limit", () => {
    expect(
      leadErrorValuesOf(
        refusalWith(409, {
          code: "LEAD_EMAIL_TAKEN",
          leadId: "lead-4",
          leadName: "Cave 23",
        }),
      ),
    ).toEqual({ name: "Cave 23" });
    expect(
      leadErrorValuesOf(refusalWith(400, { code: "LEAD_NOTE_TOO_LONG" })),
    ).toEqual({ max: 4000 });
    expect(
      leadErrorValuesOf(refusalWith(400, { code: "LEAD_TOO_MANY_LINKS" })),
    ).toEqual({ max: 12 });
  });

  it("quotes nothing for a failure with no body", () => {
    expect(leadErrorValuesOf(new Error("offline"))).toEqual({});
  });
});
