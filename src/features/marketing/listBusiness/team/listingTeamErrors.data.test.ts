import { describe, expect, it } from "vitest";
import { ApiError } from "../../../../shared/api/client";
import { createFormatters } from "../../../../shared/i18n/format";
import { LISTING_TEAM_ERROR_CODES } from "../api/listingTeam.types";
import { listingTeamErrorCopy } from "./listingTeamErrors.data";

const formatters = createFormatters("en");
const PREFIX = "marketing:listingTeam.errors.";

function refusal(code: string, extra: Record<string, unknown> = {}): ApiError {
  return new ApiError(409, "x", { statusCode: 409, code, ...extra });
}

describe("listingTeamErrorCopy", () => {
  it("names the date a cooldown ends", () => {
    const result = listingTeamErrorCopy(
      refusal("listing_team_cooldown", { retryAt: "2026-11-02T10:00:00.000Z" }),
      "listing",
      formatters,
    );
    expect(result.messageKey).toBe(`${PREFIX}cooldown`);
    expect(result.values.date).toBe(
      formatters.date(new Date("2026-11-02T10:00:00.000Z"), {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    );
  });

  it("gives every cap its own sentence", () => {
    const full = listingTeamErrorCopy(
      refusal("listing_team_full"),
      "listing",
      formatters,
    );
    expect(full.messageKey).toBe(`${PREFIX}teamFull`);
    expect(full.values.max).toBe("40");

    const pendingListing = listingTeamErrorCopy(
      refusal("listing_team_pending_full"),
      "listing",
      formatters,
    );
    expect(pendingListing.messageKey).toBe(`${PREFIX}pendingFullListing`);
    expect(pendingListing.values.max).toBe("40");

    const pendingPersona = listingTeamErrorCopy(
      refusal("listing_team_pending_full"),
      "persona",
      formatters,
    );
    expect(pendingPersona.messageKey).toBe(`${PREFIX}pendingFullPersona`);

    const personaFull = listingTeamErrorCopy(
      refusal("listing_team_persona_full"),
      "persona",
      formatters,
    );
    expect(personaFull.messageKey).toBe(`${PREFIX}personaFull`);
    expect(personaFull.values.max).toBe("10");

    const requestsFull = listingTeamErrorCopy(
      refusal("listing_team_persona_requests_full"),
      "persona",
      formatters,
    );
    expect(requestsFull.messageKey).toBe(`${PREFIX}personaRequestsFull`);
    expect(requestsFull.values.max).toBe("10");
  });

  it("picks the pending sentence from who started it", () => {
    expect(
      listingTeamErrorCopy(
        refusal("listing_team_already_pending", { initiatedBy: "listing" }),
        "listing",
        formatters,
      ).messageKey,
    ).toBe(`${PREFIX}alreadyPendingInvite`);
    expect(
      listingTeamErrorCopy(
        refusal("listing_team_already_pending", { initiatedBy: "persona" }),
        "listing",
        formatters,
      ).messageKey,
    ).toBe(`${PREFIX}alreadyPendingRequest`);
  });

  it("maps every contract code", () => {
    expect(LISTING_TEAM_ERROR_CODES).toHaveLength(15);
    for (const code of LISTING_TEAM_ERROR_CODES) {
      const { messageKey } = listingTeamErrorCopy(
        refusal(code, { retryAt: "2026-11-02T10:00:00.000Z" }),
        "listing",
        formatters,
      );
      expect(messageKey.startsWith(PREFIX)).toBe(true);
      expect(messageKey).not.toBe(`${PREFIX}generic`);
    }
    for (const code of [
      "listing_team_link_not_found",
      "listing_team_not_pending",
    ] as const) {
      expect(
        listingTeamErrorCopy(refusal(code), "listing", formatters).messageKey,
      ).toBe(`${PREFIX}linkGone`);
    }
  });

  it("reads anything else as the generic sentence", () => {
    const generic = `${PREFIX}generic`;
    const cases: unknown[] = [
      new ApiError(400, "bad"),
      new ApiError(500, "boom"),
      new Error("plain"),
      refusal("something_else"),
    ];
    for (const error of cases) {
      expect(
        listingTeamErrorCopy(error, "listing", formatters).messageKey,
      ).toBe(generic);
    }
  });
});
