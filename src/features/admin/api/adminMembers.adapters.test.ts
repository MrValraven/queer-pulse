import { beforeAll, describe, expect, it } from "vitest";
import {
  cardDtoToMember,
  detailDtoToMember,
  flaggedDtoToMember,
} from "./adminMembers.adapters";
import { catalogs, loadNamespace } from "../../../shared/i18n/catalogs";
import { createFormatters } from "../../../shared/i18n/format";
import type { TFunction, TranslateOptions } from "../../../shared/i18n/types";
import type {
  AdminMemberCardDTO,
  AdminMemberDetailDTO,
  FlaggedMemberDTO,
} from "./adminMembers.api";

/**
 * A minimal `translate` over the real `en` catalog — asserts against the
 * shipped copy rather than a fixture, so a key that goes missing fails here
 * too (mirrors `adminCommunities.adapters.test.ts`). Unlike that mock, this
 * one also resolves `{count}`-driven `_one`/`_other` plural keys (English
 * only needs the two CLDR categories `translate.ts`'s real `resolveEntry`
 * would pick via `Intl.PluralRules`), because this adapter's glance/graphNote
 * copy relies on it.
 */
function interpolate(template: string, options?: TranslateOptions): string {
  return Object.entries(options ?? {}).reduce(
    (accumulated, [token, tokenValue]) =>
      accumulated.replace(`{${token}}`, String(tokenValue)),
    template,
  );
}

// The `admin` namespace is now lazily loaded; `beforeAll` swaps in the real
// catalog (an empty placeholder is present until its chunk resolves).
let adminCatalog = catalogs.en.admin;
beforeAll(async () => {
  adminCatalog = await loadNamespace("en", "admin");
});

const translate: TFunction = (key, options) => {
  const [, path] = key.split(":");
  const catalog = adminCatalog;
  if (catalog && typeof options?.count === "number") {
    const pluralCategory = options.count === 1 ? "one" : "other";
    const pluralValue =
      catalog[`${path}_${pluralCategory}`] ?? catalog[`${path}_other`];
    if (pluralValue !== undefined) return interpolate(pluralValue, options);
  }
  const value = catalog?.[path ?? ""] ?? key;
  return interpolate(value, options);
};

const fmt = createFormatters("en");

const baseCardDto: AdminMemberCardDTO = {
  id: "u-ines",
  slug: "ines-martins",
  name: "Inês Martins",
  initials: "IM",
  tone: "jade",
  pronouns: "she/her",
  verified: true,
  role: "member",
  openReportCount: 0,
  // Day 15, not day 1: an exact-match assertion on the derived "Mar 2023"
  // must not be sensitive to the test machine's timezone offset rolling a
  // day-1 UTC instant back into February.
  joinedAt: "2023-03-15T00:00:00Z",
  tagline: "Founder, Maré Records",
  communities: ["Trans & Friends", "Queer Creatives"],
  avatarUrl: null,
  vouchCount: 21,
  vouchedBy: [{ initials: "TM", tone: "violet", slug: "t", avatarUrl: null }],
  staffRoles: [],
};

describe("cardDtoToMember", () => {
  it("composes the meta line from joined date, tagline, and communities", () => {
    const member = cardDtoToMember(baseCardDto, translate, fmt);
    expect(member.meta).toBe(
      "Joined Mar 2023 · Founder, Maré Records · Trans & Friends · Queer Creatives",
    );
  });

  it("statusTone is jade for a verified member, coral otherwise", () => {
    expect(cardDtoToMember(baseCardDto, translate, fmt).statusTone).toBe(
      "jade",
    );
    expect(
      cardDtoToMember(
        { ...baseCardDto, verified: false, openReportCount: 1 },
        translate,
        fmt,
      ).statusTone,
    ).toBe("coral");
  });

  it("omits openReportsCount when the count is zero, carries it through otherwise", () => {
    expect(
      cardDtoToMember(baseCardDto, translate, fmt).openReportsCount,
    ).toBeUndefined();
    expect(
      cardDtoToMember(
        { ...baseCardDto, verified: false, openReportCount: 3 },
        translate,
        fmt,
      ).openReportsCount,
    ).toBe(3);
  });

  it("newThisWeek is false for an old joinedAt, true for one under 7 days old", () => {
    expect(cardDtoToMember(baseCardDto, translate, fmt).newThisWeek).toBe(
      false,
    );
    const recentlyJoined = new Date(
      Date.now() - 2 * 24 * 60 * 60 * 1000,
    ).toISOString();
    expect(
      cardDtoToMember(
        { ...baseCardDto, joinedAt: recentlyJoined },
        translate,
        fmt,
      ).newThisWeek,
    ).toBe(true);
  });

  it("carries slug and avatarUrl through on vouchedBy (the roster keys on the slug; the graph reads the portrait)", () => {
    expect(cardDtoToMember(baseCardDto, translate, fmt).vouchedBy[0]).toEqual({
      initials: "TM",
      tone: "violet",
      avatarUrl: null,
      // Widened to `VouchAvatarRow`: the avatar stack keys on this stable slug
      // rather than on an array index.
      slug: "t",
    });
  });
});

const baseFlaggedDto: FlaggedMemberDTO = {
  id: "a",
  slug: "anon",
  handle: "@anon",
  initials: "A",
  tone: "plum",
  avatarUrl: null,
  openReportCount: 1,
  topReasonCode: "doxxing",
  moderationState: "frozen",
  joinedAt: "2024-09-15T00:00:00Z",
  latestReportDetail: null,
};

describe("flaggedDtoToMember", () => {
  it("maps doxxing to the doxxing category, danger categoryTone, and frozen statusId/statusTone", () => {
    const flagged = flaggedDtoToMember(baseFlaggedDto, translate, fmt);
    expect(flagged.category).toEqual({ kind: "doxxing" });
    expect(flagged.categoryTone).toBe("danger");
    expect(flagged.statusId).toBe("frozen");
    expect(flagged.statusTone).toBe("danger");
  });

  it("falls back to reportsCount for an unmapped reason, maps under_review → underReview", () => {
    const flagged = flaggedDtoToMember(
      {
        ...baseFlaggedDto,
        id: "b",
        openReportCount: 4,
        topReasonCode: "harassment",
        moderationState: "under_review",
        latestReportDetail: "x",
      },
      translate,
      fmt,
    );
    expect(flagged.category).toEqual({ kind: "reportsCount", count: 4 });
    expect(flagged.statusId).toBe("underReview");
    expect(flagged.statusTone).toBe("coral");
  });

  it("maps spam to amber categoryTone and limited statusTone", () => {
    const flagged = flaggedDtoToMember(
      {
        ...baseFlaggedDto,
        id: "c",
        topReasonCode: "spam",
        moderationState: "limited",
      },
      translate,
      fmt,
    );
    expect(flagged.category).toEqual({ kind: "spam" });
    expect(flagged.categoryTone).toBe("amber");
    expect(flagged.statusTone).toBe("amber");
  });

  it("composes meta from the joined date and the latest report detail", () => {
    const flagged = flaggedDtoToMember(
      {
        ...baseFlaggedDto,
        latestReportDetail: "Crypto links across 6 threads",
      },
      translate,
      fmt,
    );
    expect(flagged.meta).toBe(
      "Joined Sep 2024 · Crypto links across 6 threads",
    );
  });
});

const baseDetailDto: AdminMemberDetailDTO = {
  id: "ines",
  slug: "ines-martins",
  name: "Inês Martins",
  initials: "IM",
  tone: "jade",
  pronouns: "she/her",
  verified: true,
  role: "admin",
  isSystem: false,
  avatarUrl: null,
  vouchCount: 21,
  outboundVouchCount: 0,
  joinedAt: "2023-03-15T00:00:00Z",
  openReportCount: 0,
  communities: [
    { name: "Trans & Friends", role: "mod" },
    { name: "Queer Creatives", role: "member" },
  ],
  contributions: [
    {
      kind: "vouch",
      detail: "Vouched for Marco Vieira",
      at: "2026-05-30T00:00:00Z",
    },
  ],
  moderationTimeline: [
    {
      tone: "good",
      action: "no_reports",
      reasonCode: null,
      actorName: null,
      note: null,
      at: new Date().toISOString(),
      reportId: null,
    },
  ],
  graph: {
    center: {
      initials: "IM",
      tone: "jade",
      slug: "ines-martins",
      avatarUrl: "https://cdn.example.com/ines.jpg",
    },
    nodes: [
      {
        initials: "TM",
        tone: "violet",
        slug: "theo",
        avatarUrl: "https://cdn.example.com/theo.jpg",
        direction: "inbound",
      },
    ],
  },
  staffRoles: [],
};

describe("detailDtoToMember", () => {
  it("glance carries vouches and reportsAgainst through as strings", () => {
    const detail = detailDtoToMember(baseDetailDto, translate, fmt);
    expect(detail.glance[0]).toEqual({
      labelKey: "admin:members.glance.vouches",
      value: "21",
    });
    expect(detail.glance[2]).toEqual({
      labelKey: "admin:members.glance.reportsAgainst",
      value: "0",
    });
  });

  it('glance memberFor reads "New" under 30 days old', () => {
    const recentlyJoined = new Date(
      Date.now() - 5 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const detail = detailDtoToMember(
      { ...baseDetailDto, joinedAt: recentlyJoined },
      translate,
      fmt,
    );
    expect(detail.glance[1]?.value).toBe("New");
  });

  it("glance memberFor reads {count}mo between 30 days and a year", () => {
    const joinedTwoMonthsAgo = new Date(
      Date.now() - 60 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const detail = detailDtoToMember(
      { ...baseDetailDto, joinedAt: joinedTwoMonthsAgo },
      translate,
      fmt,
    );
    expect(detail.glance[1]?.value).toBe("2mo");
  });

  it("glance memberFor reads {count}yr at a year or older", () => {
    const joinedThreeYearsAgo = new Date(
      Date.now() - 3 * 365 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const detail = detailDtoToMember(
      { ...baseDetailDto, joinedAt: joinedThreeYearsAgo },
      translate,
      fmt,
    );
    expect(detail.glance[1]?.value).toBe("3yr");
  });

  it("graphNote pluralizes on vouchCount and names the member by first name", () => {
    const plural = detailDtoToMember(
      { ...baseDetailDto, vouchCount: 21 },
      translate,
      fmt,
    );
    expect(plural.graphNote).toBe(
      "21 members vouch for Inês. A mutual graph is a sign of trust. Honour it, and let the numbers be.",
    );
    const singular = detailDtoToMember(
      { ...baseDetailDto, vouchCount: 1 },
      translate,
      fmt,
    );
    expect(singular.graphNote).toBe(
      "1 member vouches for Inês. A mutual graph is a sign of trust. Honour it, and let the numbers be.",
    );
  });

  it("removeBody names the member", () => {
    const detail = detailDtoToMember(baseDetailDto, translate, fmt);
    expect(detail.removeBody).toContain("Inês Martins");
  });

  it("labels an owner/mod community with its role, leaves a plain member community as just the name", () => {
    const detail = detailDtoToMember(baseDetailDto, translate, fmt);
    expect(detail.communities[0]?.label).toBe("Trans & Friends · moderator");
    expect(detail.communities[1]?.label).toBe("Queer Creatives");
  });

  it("assigns a deterministic tone per community name", () => {
    const first = detailDtoToMember(baseDetailDto, translate, fmt);
    const second = detailDtoToMember(baseDetailDto, translate, fmt);
    expect(first.communities[0]?.tone).toBe(second.communities[0]?.tone);
  });

  it("uses a contribution's own detail as its title verbatim", () => {
    const detail = detailDtoToMember(baseDetailDto, translate, fmt);
    expect(detail.contributions[0]?.what).toBe("Vouched for Marco Vieira");
  });

  it("falls back to a generic title for a contribution with no detail and an unmapped kind", () => {
    const detail = detailDtoToMember(
      {
        ...baseDetailDto,
        contributions: [
          { kind: "essay_published", detail: null, at: "2026-04-18T00:00:00Z" },
        ],
      },
      translate,
      fmt,
    );
    expect(detail.contributions[0]?.what).toBe("Contributed to the community");
  });

  it("renders a contribution's `when` as a short date once it's more than a week old", () => {
    const twentyDaysAgo = new Date(
      Date.now() - 20 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const detail = detailDtoToMember(
      {
        ...baseDetailDto,
        contributions: [{ kind: "vouch", detail: null, at: twentyDaysAgo }],
      },
      translate,
      fmt,
    );
    expect(detail.contributions[0]?.when).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
  });
});

describe("detailDtoToMember — moderation timeline & vouch graph", () => {
  it("gives 'no_reports' a dateless, generic meta and a good tone", () => {
    const detail = detailDtoToMember(baseDetailDto, translate, fmt);
    expect(detail.moderationTimeline[0]).toEqual({
      tone: "good",
      title: "No reports against this member",
      meta: "A clean record so far",
      metaLink: undefined,
      note: undefined,
    });
  });

  it("composes a 'verified' entry's meta from its date", () => {
    const detail = detailDtoToMember(
      {
        ...baseDetailDto,
        moderationTimeline: [
          {
            tone: "good",
            action: "verified",
            reasonCode: null,
            actorName: null,
            note: null,
            at: "2023-03-15T00:00:00Z",
            reportId: null,
          },
        ],
      },
      translate,
      fmt,
    );
    expect(detail.moderationTimeline[0]?.title).toBe("Verified identity");
    expect(detail.moderationTimeline[0]?.meta).toBe(
      "Mar 2023 · vouches confirmed",
    );
  });

  it("composes a real moderation action's title/meta/metaLink/note from actorName + reportId", () => {
    const detail = detailDtoToMember(
      {
        ...baseDetailDto,
        moderationTimeline: [
          {
            tone: "neutral",
            action: "warn",
            reasonCode: "harassment",
            actorName: "Júlia S.",
            note: "Warned about misgendering.",
            at: "2026-01-10T00:00:00Z",
            reportId: "report-1",
          },
        ],
      },
      translate,
      fmt,
    );
    const entry = detail.moderationTimeline[0]!;
    expect(entry.title).toBe("Member warned");
    expect(entry.meta).toBe("Jan 2026 · acted on by Júlia S.");
    expect(entry.metaLink).toBe("view");
    expect(entry.note).toBe("Warned about misgendering.");
  });

  it("falls back to a generic title for an unmapped moderation action", () => {
    const detail = detailDtoToMember(
      {
        ...baseDetailDto,
        moderationTimeline: [
          {
            tone: "neutral",
            action: "some_future_action",
            reasonCode: null,
            actorName: null,
            note: null,
            at: "2026-01-10T00:00:00Z",
            reportId: null,
          },
        ],
      },
      translate,
      fmt,
    );
    expect(detail.moderationTimeline[0]?.title).toBe("Moderation action taken");
  });

  it("keeps avatarUrl on the vouch graph's center and nodes (for real portraits), drops slug, keeps direction", () => {
    const detail = detailDtoToMember(baseDetailDto, translate, fmt);
    expect(detail.graph.center).toEqual({
      initials: "IM",
      tone: "jade",
      avatarUrl: "https://cdn.example.com/ines.jpg",
    });
    expect(detail.graph.nodes[0]).toEqual({
      initials: "TM",
      tone: "violet",
      avatarUrl: "https://cdn.example.com/theo.jpg",
      direction: "inbound",
    });
  });

  it("notes both vouch directions once the member has vouched for others", () => {
    const detail = detailDtoToMember(
      { ...baseDetailDto, vouchCount: 21, outboundVouchCount: 3 },
      translate,
      fmt,
    );
    expect(detail.graphNote).toContain("21");
    expect(detail.graphNote).toContain("3");
  });
});
