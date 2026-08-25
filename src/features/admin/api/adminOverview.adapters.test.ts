import { beforeAll, describe, expect, it } from "vitest";
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiUserPlus,
  FiStar,
  FiArchive,
} from "react-icons/fi";
import {
  overviewToMetrics,
  overviewToTriage,
  overviewToReportChart,
  overviewToMemberGrowth,
  overviewToResponseDist,
  overviewToFeed,
  chartMax,
} from "./adminOverview.adapters";
import { REPORT_SERIES, TRIAGE_QUEUE } from "../adminDashboard.data";
import { catalogs, loadNamespace } from "../../../shared/i18n/catalogs";
import { createFormatters } from "../../../shared/i18n/format";
import type { TFunction, TranslateOptions } from "../../../shared/i18n/types";
import type { AdminOverviewDTO } from "./adminOverview.api";

/**
 * A minimal `translate` over the real `en` catalog — asserts against the
 * shipped copy rather than a fixture, so a key that goes missing fails here
 * too (mirrors `adminMembers.adapters.test.ts`, itself mirroring
 * `adminCommunities.adapters.test.ts`). Also resolves `{count}`-driven
 * `_one`/`_other` plural keys, needed for the feed's "N new members" line.
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

/* ── Fixture DTO ──────────────────────────────────────────────────────────── */

function isoWeeksAgo(weeksAgo: number): string {
  return new Date(2026, 0, 1 + (8 - weeksAgo) * 7).toISOString();
}

const reportChartWeeks: AdminOverviewDTO["reportsByType"]["weeks"] = Array.from(
  { length: 8 },
  (_, index) => ({
    weekStart: isoWeeksAgo(8 - index),
    values: [index, index + 1, index + 2, index + 3] as [
      number,
      number,
      number,
      number,
    ],
  }),
);

const baseDto: AdminOverviewDTO = {
  stats: {
    activeMembers: { value: 8500, growthPercent: 3.87, netNewThisMonth: 340 },
    openReports: { value: 19, oldestOpenHours: 5, emergencies: 1 },
    medianResponseHours: null,
    communityHealth: { averageScore: null, needingSupportCount: 0 },
    verifiedMembers: 4200,
  },
  triage: {
    emergencies: 1,
    openReports: 19,
    pendingVerifications: 8,
    openAppeals: 3,
  },
  reportsByType: { weeks: reportChartWeeks },
  memberGrowth: {
    points: [
      { at: "2026-01-01T00:00:00Z", joined: 180, churned: null, spike: false },
      { at: "2026-02-01T00:00:00Z", joined: 210, churned: null, spike: false },
      { at: "2026-03-01T00:00:00Z", joined: 240, churned: null, spike: true },
    ],
  },
  responseTime: null,
  // The 6 exact `type` strings `admin-overview.service.ts`'s `assembleFeed`
  // emits, each exercised once with `actor` present and once with the
  // null/anonymous-erased branch it also sends, plus an unmapped type for
  // the generic-fallback path.
  feed: [
    {
      id: "f1",
      type: "report_filed",
      actor: null,
      target: null,
      community: null,
      count: null,
      at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      route: "/admin/moderation",
    },
    {
      id: "f2",
      type: "report_filed",
      actor: "Théo R.",
      target: null,
      community: null,
      count: null,
      at: new Date().toISOString(),
      route: "/admin/moderation?tab=emergencies",
    },
    {
      id: "f3",
      type: "report_resolved",
      actor: "Inês M.",
      target: null,
      community: null,
      count: null,
      at: new Date().toISOString(),
      route: "/admin/moderation",
    },
    {
      id: "f4",
      type: "report_resolved",
      actor: null,
      target: null,
      community: null,
      count: null,
      at: new Date().toISOString(),
      route: "/admin/moderation",
    },
    {
      id: "f5",
      type: "member_joined",
      actor: "Devon O.",
      target: null,
      community: null,
      count: null,
      at: new Date().toISOString(),
      route: "/admin/members",
    },
    {
      id: "f6",
      type: "member_joined",
      actor: null,
      target: null,
      community: "Queer Creatives",
      count: 3,
      at: new Date().toISOString(),
      route: "/admin/members",
    },
    {
      id: "f7",
      type: "member_joined",
      actor: null,
      target: null,
      community: null,
      count: null,
      at: new Date().toISOString(),
      route: "/admin/members",
    },
    {
      id: "f8",
      type: "vouch_received",
      actor: "Devon O.",
      target: "Marco V.",
      community: null,
      count: null,
      at: new Date().toISOString(),
      route: "/admin/members",
    },
    {
      id: "f9",
      type: "vouch_received",
      actor: null,
      target: "Marco V.",
      community: null,
      count: null,
      at: new Date().toISOString(),
      route: "/admin/members",
    },
    {
      id: "f10",
      type: "community_joined",
      actor: "Júlia S.",
      target: null,
      community: "Lisbon Queers",
      count: null,
      at: new Date().toISOString(),
      route: "/admin/communities/queer-social/mod",
    },
    {
      id: "f11",
      type: "join_request_submitted",
      actor: "Marco V.",
      target: null,
      community: null,
      count: null,
      at: new Date().toISOString(),
      route: "/admin/members?tab=verification",
    },
    {
      id: "f12",
      type: "some_future_type",
      actor: "Someone",
      target: null,
      community: null,
      count: null,
      at: new Date().toISOString(),
      route: "/admin",
    },
  ],
};

/* ── overviewToMetrics ────────────────────────────────────────────────────── */

describe("overviewToMetrics", () => {
  it("community-health tile is flagged notMeasured when averageScore is null, foot falls back to 0 needing support", () => {
    const [, , , communityHealthTile] = overviewToMetrics(baseDto, fmt);
    expect(communityHealthTile?.notMeasured).toBe(true);
    expect(communityHealthTile?.value).toBe(0);
    expect(communityHealthTile?.footValues).toEqual({ count: 0 });
    expect(communityHealthTile?.trend).toEqual({
      dir: "warn",
      key: "admin:dashboard.metrics.trendNoData",
    });
  });

  it("community-health tile gets a 'healthy' trend at/above the support threshold, carries the live needingSupportCount", () => {
    const measuredDto: AdminOverviewDTO = {
      ...baseDto,
      stats: {
        ...baseDto.stats,
        communityHealth: { averageScore: 82, needingSupportCount: 2 },
      },
    };
    const [, , , communityHealthTile] = overviewToMetrics(measuredDto, fmt);
    expect(communityHealthTile?.notMeasured).toBe(false);
    expect(communityHealthTile?.value).toBe(82);
    expect(communityHealthTile?.footValues).toEqual({ count: 2 });
    expect(communityHealthTile?.trend).toEqual({
      dir: "up",
      key: "admin:dashboard.metrics.trendHealthy",
    });
  });

  it("community-health tile switches to a 'needs a hand' warning below the support threshold", () => {
    const belowThresholdDto: AdminOverviewDTO = {
      ...baseDto,
      stats: {
        ...baseDto.stats,
        communityHealth: { averageScore: 60, needingSupportCount: 5 },
      },
    };
    const [, , , communityHealthTile] = overviewToMetrics(
      belowThresholdDto,
      fmt,
    );
    expect(communityHealthTile?.trend).toEqual({
      dir: "warn",
      key: "admin:dashboard.metrics.trendNeedsHand",
    });
  });

  it("median-response tile is flagged notMeasured when medianResponseHours is null", () => {
    const [, , medianTile] = overviewToMetrics(baseDto, fmt);
    expect(medianTile?.notMeasured).toBe(true);
    expect(medianTile?.value).toBe(0);
    expect(medianTile?.trend).toEqual({
      dir: "warn",
      key: "admin:dashboard.metrics.trendNoData",
    });
  });

  it("median-response tile gets the 'well under' trend when the live value is at or under the 6h SLA", () => {
    const measuredDto: AdminOverviewDTO = {
      ...baseDto,
      stats: { ...baseDto.stats, medianResponseHours: 3.2 },
    };
    const [, , medianTile] = overviewToMetrics(measuredDto, fmt);
    expect(medianTile?.notMeasured).toBe(false);
    expect(medianTile?.value).toBe(3.2);
    expect(medianTile?.trend).toEqual({
      dir: "up",
      key: "admin:dashboard.metrics.trendWellUnder",
    });
  });

  it("median-response tile switches to a 'trendOverSla' warning when the live value is over the 6h SLA", () => {
    const overSlaDto: AdminOverviewDTO = {
      ...baseDto,
      stats: { ...baseDto.stats, medianResponseHours: 9 },
    };
    const [, , medianTile] = overviewToMetrics(overSlaDto, fmt);
    expect(medianTile?.notMeasured).toBe(false);
    expect(medianTile?.value).toBe(9);
    expect(medianTile?.trend).toEqual({
      dir: "warn",
      key: "admin:dashboard.metrics.trendOverSla",
    });
  });

  it("active-members trend direction follows growthPercent's sign, formatted to one decimal", () => {
    const [activeMembersTile] = overviewToMetrics(baseDto, fmt);
    expect(activeMembersTile?.trend).toEqual({
      dir: "up",
      key: "admin:dashboard.metrics.trendPercent",
      values: { value: "3.9" },
    });
    const decliningDto: AdminOverviewDTO = {
      ...baseDto,
      stats: {
        ...baseDto.stats,
        activeMembers: { ...baseDto.stats.activeMembers, growthPercent: -2.4 },
      },
    };
    const [decliningTile] = overviewToMetrics(decliningDto, fmt);
    expect(decliningTile?.trend.dir).toBe("down");
    expect(decliningTile?.trend.values).toEqual({ value: "2.4" });
  });

  it("active-members trend falls back to a neutral 'no data' key when growthPercent is null", () => {
    const noGrowthDataDto: AdminOverviewDTO = {
      ...baseDto,
      stats: {
        ...baseDto.stats,
        activeMembers: { ...baseDto.stats.activeMembers, growthPercent: null },
      },
    };
    const [activeMembersTile] = overviewToMetrics(noGrowthDataDto, fmt);
    expect(activeMembersTile?.trend).toEqual({
      dir: "warn",
      key: "admin:dashboard.metrics.trendNoData",
    });
  });

  it("open-reports trend carries the live oldestOpenHours, foot carries live emergencies", () => {
    const [, openReportsTile] = overviewToMetrics(baseDto, fmt);
    expect(openReportsTile?.value).toBe(19);
    expect(openReportsTile?.trend).toEqual({
      dir: "warn",
      key: "admin:dashboard.metrics.trendOldest",
      values: { hours: "5h" },
    });
    expect(openReportsTile?.footValues).toEqual({ count: 1 });
  });

  it("carries labelKey/icon/comma/decimal/suffix/to through from the fixture tiles unchanged", () => {
    const tiles = overviewToMetrics(baseDto, fmt);
    expect(tiles[0]?.labelKey).toBe(
      "admin:dashboard.metrics.activeMembers.label",
    );
    expect(tiles[0]?.comma).toBe(true);
    expect(tiles[0]?.to).toBe("/admin/members");
    expect(tiles[1]?.to).toBe("/admin/moderation");
    expect(tiles[2]?.decimal).toBe(true);
    expect(tiles[2]?.suffix).toBe("h");
    expect(tiles[3]?.to).toBe("/admin/communities");
  });
});

/* ── overviewToTriage ─────────────────────────────────────────────────────── */

describe("overviewToTriage", () => {
  it("carries live counts into the fixture's rows, preserving titleKey/tone/icon/to", () => {
    const rows = overviewToTriage(baseDto);
    expect(rows.map((row) => row.count)).toEqual([1, 19, 8, 3]);
    rows.forEach((row, index) => {
      expect(row.titleKey).toBe(TRIAGE_QUEUE[index]?.titleKey);
      expect(row.tone).toBe(TRIAGE_QUEUE[index]?.tone);
      expect(row.icon).toBe(TRIAGE_QUEUE[index]?.icon);
      expect(row.to).toBe(TRIAGE_QUEUE[index]?.to);
    });
  });
});

/* ── overviewToReportChart ────────────────────────────────────────────────── */

describe("overviewToReportChart", () => {
  it("has 8 week bars, each a 4-number tuple, labelled with the fixture's offset scheme", () => {
    const { weeks } = overviewToReportChart(baseDto);
    expect(weeks).toHaveLength(8);
    weeks.forEach((week) => expect(week.values).toHaveLength(4));
    expect(weeks[0]?.week).toBe("-7");
    expect(weeks[5]?.week).toBe("-2");
    expect(weeks[6]?.week).toBe("last");
    expect(weeks[7]?.week).toBe("this");
    expect(weeks[7]?.values).toEqual([7, 8, 9, 10]);
  });

  it("reuses the relabeled REPORT_SERIES (4th entry is 'Other', not 'vouch abuse')", () => {
    const { series } = overviewToReportChart(baseDto);
    expect(series).toBe(REPORT_SERIES);
    expect(series[3]?.labelKey).toBe("admin:dashboard.charts.series.other");
    expect(translate(series[3].labelKey)).toBe("Other");
  });
});

/* ── overviewToMemberGrowth ───────────────────────────────────────────────── */

describe("overviewToMemberGrowth", () => {
  it("keeps churned null when the DTO has no churn data", () => {
    const points = overviewToMemberGrowth(baseDto);
    expect(points.every((point) => point.churned === null)).toBe(true);
  });

  it("passes a real churned number through unchanged when the DTO has one", () => {
    const withChurnDto: AdminOverviewDTO = {
      ...baseDto,
      memberGrowth: {
        points: [
          {
            at: "2026-01-01T00:00:00Z",
            joined: 180,
            churned: 60,
            spike: false,
          },
        ],
      },
    };
    const points = overviewToMemberGrowth(withChurnDto);
    expect(points[0]?.churned).toBe(60);
  });

  it("maps `at`/joined/spike onto Date/joined/spike", () => {
    const points = overviewToMemberGrowth(baseDto);
    expect(points[0]?.date).toBeInstanceOf(Date);
    expect(points[0]?.date?.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(points[0]?.joined).toBe(180);
    expect(points[2]?.spike).toBe(true);
  });
});

/* ── overviewToResponseDist ───────────────────────────────────────────────── */

describe("overviewToResponseDist", () => {
  it("returns null when responseTime is null", () => {
    expect(overviewToResponseDist(baseDto)).toBeNull();
  });

  it("maps the buckets through when responseTime is present", () => {
    const measuredDto: AdminOverviewDTO = {
      ...baseDto,
      responseTime: {
        medianHours: 3.2,
        buckets: [
          { label: "<1h", value: 34, overSla: false },
          { label: "8h+", value: 7, overSla: true },
        ],
      },
    };
    expect(overviewToResponseDist(measuredDto)).toEqual([
      { label: "<1h", value: 34, overSla: false },
      { label: "8h+", value: 7, overSla: true },
    ]);
  });
});

/* ── overviewToFeed ───────────────────────────────────────────────────────── */

describe("overviewToFeed", () => {
  it("maps report_filed to danger + FiAlertTriangle, falling back to an anonymous lead/body when actor is null", () => {
    const feed = overviewToFeed(baseDto, translate, fmt);
    const anonymousFiling = feed.find((item) => item.id === "f1");
    expect(anonymousFiling?.tone).toBe("danger");
    expect(anonymousFiling?.icon).toBe(FiAlertTriangle);
    expect(anonymousFiling?.lead).toBe("A report");
    expect(anonymousFiling?.body).toBe("was filed anonymously");
    expect(anonymousFiling?.to).toBe("/admin/moderation");

    const namedFiling = feed.find((item) => item.id === "f2");
    expect(namedFiling?.lead).toBe("Théo R.");
    expect(namedFiling?.body).toBe("filed a report");
  });

  it("maps a report_resolved type to jade + FiCheckCircle, composing lead/body from actor; falls back when actor is null", () => {
    const feed = overviewToFeed(baseDto, translate, fmt);
    const resolvedByModerator = feed.find((item) => item.id === "f3");
    expect(resolvedByModerator?.tone).toBe("jade");
    expect(resolvedByModerator?.icon).toBe(FiCheckCircle);
    expect(resolvedByModerator?.lead).toBe("Inês M.");
    expect(resolvedByModerator?.body).toBe("resolved a report");
    expect(resolvedByModerator?.to).toBe("/admin/moderation");
    expect(resolvedByModerator?.id).toBe("f3");

    const resolvedAnonymously = feed.find((item) => item.id === "f4");
    expect(resolvedAnonymously?.lead).toBe("A moderator");
  });

  it("member_joined prefers the real actor name over `count`, falls back to a pluralized count, then a generic lead", () => {
    const feed = overviewToFeed(baseDto, translate, fmt);
    const namedJoin = feed.find((item) => item.id === "f5");
    expect(namedJoin?.tone).toBe("coral");
    expect(namedJoin?.lead).toBe("Devon O.");
    expect(namedJoin?.body).toBe("joined the platform");

    const countedJoin = feed.find((item) => item.id === "f6");
    expect(countedJoin?.lead).toBe("3 new members");
    expect(countedJoin?.em).toBe("Queer Creatives");

    const genericJoin = feed.find((item) => item.id === "f7");
    expect(genericJoin?.lead).toBe("New members");
  });

  it("vouch_received leads with the target (vouchee), emphasises the actor (voucher) when present", () => {
    const feed = overviewToFeed(baseDto, translate, fmt);
    const withVoucher = feed.find((item) => item.id === "f8");
    expect(withVoucher?.tone).toBe("violet");
    expect(withVoucher?.icon).toBe(FiStar);
    expect(withVoucher?.lead).toBe("Marco V.");
    expect(withVoucher?.body).toBe("received a vouch from");
    expect(withVoucher?.em).toBe("Devon O.");
    expect(withVoucher?.bodyAfter).toBe(".");

    const withoutVoucher = feed.find((item) => item.id === "f9");
    expect(withoutVoucher?.lead).toBe("Marco V.");
    expect(withoutVoucher?.body).toBe("received a new vouch");
    expect(withoutVoucher?.em).toBeUndefined();
  });

  it("maps community_joined to coral + FiUserPlus, emphasising the community", () => {
    const feed = overviewToFeed(baseDto, translate, fmt);
    const communityJoined = feed.find((item) => item.id === "f10");
    expect(communityJoined?.tone).toBe("coral");
    expect(communityJoined?.icon).toBe(FiUserPlus);
    expect(communityJoined?.lead).toBe("Júlia S.");
    expect(communityJoined?.body).toBe("joined");
    expect(communityJoined?.em).toBe("Lisbon Queers");
  });

  it("maps join_request_submitted to amber + FiArchive", () => {
    const feed = overviewToFeed(baseDto, translate, fmt);
    const joinRequest = feed.find((item) => item.id === "f11");
    expect(joinRequest?.tone).toBe("amber");
    expect(joinRequest?.icon).toBe(FiArchive);
    expect(joinRequest?.lead).toBe("Marco V.");
    expect(joinRequest?.body).toBe("requested to join");
  });

  it("falls back to a generic jade line for an unmapped feed type", () => {
    const feed = overviewToFeed(baseDto, translate, fmt);
    const unmapped = feed.find((item) => item.id === "f12");
    expect(unmapped?.tone).toBe("jade");
    expect(unmapped?.icon).toBe(FiCheckCircle);
    expect(unmapped?.lead).toBe("Someone");
    expect(unmapped?.body).toBe("made an update");
  });

  it("formats `time` as a relative string from `at`", () => {
    const feed = overviewToFeed(baseDto, translate, fmt);
    const ninetyMinutesAgo = feed.find((item) => item.id === "f1");
    expect(ninetyMinutesAgo?.time).toBe("2 hours ago");
  });
});

/* ── chartMax ─────────────────────────────────────────────────────────────── */

describe("chartMax", () => {
  it("rounds up above the data max", () => {
    expect(chartMax([1, 2, 20])).toBeGreaterThanOrEqual(20);
    expect(chartMax([1, 2, 20])).toBe(20);
  });

  it("rounds up to the next nice step, not just the bare max", () => {
    expect(chartMax([73])).toBe(100);
  });

  it("returns a sane default axis max for empty or all-zero data", () => {
    expect(chartMax([])).toBe(10);
    expect(chartMax([0, 0, 0])).toBe(10);
  });
});
