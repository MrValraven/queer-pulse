import { beforeAll, describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { loadNamespace, loadPtNamespace } from "../../../shared/i18n/catalogs";
import { createFormatters } from "../../../shared/i18n/format";
import { parseKey, resolveEntry } from "../../../shared/i18n/translate";
import type {
  Catalog,
  Language,
  TFunction,
  TranslateOptions,
} from "../../../shared/i18n/types";
import {
  canManageCommunityBadges,
  canSendCommunityGifts,
} from "./communityBadgeAccess";
import {
  COMMUNITY_BADGE_ERROR_KEYS,
  COMMUNITY_BADGE_REASON_STATUS,
  COMMUNITY_BADGE_SPACES_ERROR_KEY,
  GIFT_RESET_FORMAT,
  communityBadgeErrorCopy,
  communityBadgeErrorText,
  communityBadgeRefusal,
} from "./communityBadgeErrors";

const resolvedCatalogs: Partial<Record<Language, Catalog>> = {};

beforeAll(async () => {
  resolvedCatalogs.en = await loadNamespace("en", "communities");
  resolvedCatalogs.pt = await loadPtNamespace("communities");
});

function makeT(language: Language): TFunction {
  return (key: string, options?: TranslateOptions) => {
    const { path } = parseKey(key);
    const hit = resolveEntry(
      resolvedCatalogs[language],
      path,
      language,
      options,
    );
    if (hit === undefined) throw new Error(`missing key: ${key}`);
    return hit;
  };
}

const fmt = createFormatters("en");

function badgeError(data: Record<string, unknown>): ApiError {
  return new ApiError(400, String(data.code), data);
}

describe("communityBadgeErrorCopy", () => {
  it.each(Object.keys(COMMUNITY_BADGE_REASON_STATUS))(
    "gives %s its own line",
    (code) => {
      const copy = communityBadgeErrorCopy(
        badgeError({ code }),
        makeT("en"),
        fmt,
      );
      expect(copy.key).toBe(`communities:badges.error.${code}`);
      expect(
        COMMUNITY_BADGE_ERROR_KEYS[
          code as keyof typeof COMMUNITY_BADGE_ERROR_KEYS
        ],
      ).toBe(copy.key);
    },
  );

  it.each(Object.keys(COMMUNITY_BADGE_REASON_STATUS))(
    "reads %s in both languages",
    (code) => {
      const error = badgeError({
        code,
        limit: 12,
        maxLength: 32,
        min: 30,
        max: 3650,
        ruleType: "tenure_days",
        resetsAt: "2026-11-29T18:00:00.000Z",
      });
      expect(communityBadgeErrorText(error, makeT("en"), fmt)).not.toContain(
        "{",
      );
      expect(
        communityBadgeErrorText(error, makeT("pt"), createFormatters("pt-PT")),
      ).not.toContain("{");
    },
  );

  it("names the badge cap", () => {
    const copy = communityBadgeErrorCopy(
      badgeError({ code: "badge_limit_reached", limit: 12 }),
      makeT("en"),
      fmt,
    );
    expect(copy.values?.limit).toBe(12);
  });

  it("names the range and unit of a threshold", () => {
    const error = badgeError({
      code: "badge_threshold_out_of_range",
      ruleType: "tenure_days",
      min: 30,
      max: 3650,
    });
    expect(communityBadgeErrorText(error, makeT("en"), fmt)).toBe(
      "Pick a whole number between 30 and 3650 days.",
    );
  });

  it("leaves the unit empty for an unknown rule type", () => {
    const copy = communityBadgeErrorCopy(
      badgeError({
        code: "badge_threshold_out_of_range",
        ruleType: "mystery",
        min: 1,
        max: 5,
      }),
      makeT("en"),
      fmt,
    );
    expect(copy.values?.unit).toBe("");
  });

  it("names the gift cap with its reset time", () => {
    const resetsAt = "2026-11-29T18:00:00.000Z";
    const text = communityBadgeErrorText(
      badgeError({ code: "gift_weekly_limit_reached", limit: 10, resetsAt }),
      makeT("en"),
      fmt,
    );
    expect(text).toContain("10 gifts");
    expect(text).toContain(fmt.date(new Date(resetsAt), GIFT_RESET_FORMAT));
  });

  it("names the note length cap", () => {
    const text = communityBadgeErrorText(
      badgeError({ code: "gift_note_too_long", maxLength: 140 }),
      makeT("en"),
      fmt,
    );
    expect(text).toContain("140 characters");
  });

  it("names a note that did not arrive as text", () => {
    const text = communityBadgeErrorText(
      badgeError({ code: "gift_note_invalid" }),
      makeT("en"),
      fmt,
    );
    expect(text).toBe(
      "The gift note didn't come through as text. Write it again and send.",
    );
  });

  it("names the space refusal", () => {
    const copy = communityBadgeErrorCopy(
      communityBadgeRefusal("SUBCOMMUNITY_FEATURE_UNAVAILABLE"),
      makeT("en"),
      fmt,
    );
    expect(copy.key).toBe(COMMUNITY_BADGE_SPACES_ERROR_KEY);
  });

  it("keeps the members-only line", () => {
    const copy = communityBadgeErrorCopy(
      communityBadgeRefusal("COMMUNITY_MEMBERS_ONLY"),
      makeT("en"),
      fmt,
    );
    expect(copy.key).toBe("communities:error.membersOnly");
  });

  it("keeps the offline line for a request that never arrived", () => {
    const copy = communityBadgeErrorCopy(
      new TypeError("Failed to fetch"),
      makeT("en"),
      fmt,
    );
    expect(copy.key).toBe("shared:apiError.noConnection");
  });
});

describe("communityBadgeRefusal", () => {
  it("builds a refusal with the contract status", () => {
    const refusal = communityBadgeRefusal("gift_to_self");
    expect(refusal.status).toBe(400);
    expect((refusal.data as { code: string }).code).toBe("gift_to_self");
  });

  it("carries the extras in the body", () => {
    const refusal = communityBadgeRefusal("gift_weekly_limit_reached", {
      limit: 10,
      resetsAt: "2026-11-29T18:00:00.000Z",
    });
    expect(refusal.status).toBe(429);
    expect(refusal.data).toMatchObject({ statusCode: 429, limit: 10 });
  });
});

describe("badge access", () => {
  it("lets any staff seat manage in demo and only owner-level live", () => {
    expect(canManageCommunityBadges("mod", true)).toBe(true);
    expect(canManageCommunityBadges("mod", false)).toBe(false);
    expect(canManageCommunityBadges("co_owner", false)).toBe(true);
    expect(canManageCommunityBadges("owner", false)).toBe(true);
    expect(canManageCommunityBadges("member", true)).toBe(false);
    expect(canManageCommunityBadges(null, true)).toBe(false);
  });

  it("lets every staff seat send gifts", () => {
    expect(canSendCommunityGifts("mod")).toBe(true);
    expect(canSendCommunityGifts("co_owner")).toBe(true);
    expect(canSendCommunityGifts("member")).toBe(false);
  });
});
