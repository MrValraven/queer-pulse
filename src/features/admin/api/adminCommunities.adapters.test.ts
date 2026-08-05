import { beforeAll, describe, expect, it } from "vitest";
import { cardDtoToCommunity, detailDtoToCommunity } from "./adminCommunities.adapters";
import { catalogs, loadNamespace } from "../../../shared/i18n/catalogs";
import { createFormatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import type {
  AdminCommunityCardDTO,
  AdminCommunityDetailDTO,
  AdminCommunityModeratorDTO,
  AdminCommunityQueueItemDTO,
} from "./adminCommunities.api";

/**
 * A minimal `translate` over the real `en` catalog — asserts against the
 * shipped copy rather than a fixture, so a key that goes missing fails here
 * too. Mirrors `src/features/economy/api/jobs.adapters.test.ts`'s `t`, just
 * renamed (this task's binding constraint bans single-letter identifiers).
 */
// The `admin` namespace is now lazily loaded; `beforeAll` swaps in the real
// catalog (an empty placeholder is present until its chunk resolves).
let adminCatalog = catalogs.en.admin;
beforeAll(async () => {
  adminCatalog = await loadNamespace("en", "admin");
});

const translate: TFunction = (key, options) => {
  const [, path] = key.split(":");
  const value = adminCatalog?.[path ?? ""] ?? key;
  return Object.entries(options ?? {}).reduce(
    (accumulated, [token, tokenValue]) =>
      accumulated.replace(`{${token}}`, String(tokenValue)),
    value,
  );
};

/** Mirrors `jobs.adapters.test.ts`'s `fmt` — an EN formatter, so the existing
 *  assertions ("3,180", "Mar 2023") stay exact. */
const fmt = createFormatters("en");

const baseCardDto: AdminCommunityCardDTO = {
  slug: "trans-friends",
  name: "Trans & Friends",
  initials: "TR",
  tone: "jade",
  tag: "Peer support · private",
  memberCount: 1204,
  activityLabel: "High",
  activePercentage: 68,
  openReportCount: 1,
  healthScore: 94,
  healthBreakdown: {
    memberActivity: 91,
    reportResolution: 100,
    memberSentiment: null,
    safetyLoad: 90,
  },
  activitySparkline: [5, 6, 5, 7, 6, 8, 7, 9],
  needsSupport: false,
};

const baseModeratorDto: AdminCommunityModeratorDTO = {
  userId: "00000000-0000-0000-0000-0000000000a1",
  slug: "ines-martins",
  name: "Inês Martins",
  initials: "IM",
  role: "owner",
  joinedAt: "2023-03-15T00:00:00.000Z",
};

const baseQueueItemDto: AdminCommunityQueueItemDTO = {
  id: "queue-item-1",
  severity: "high",
  reasonCode: "harassment",
  detail: "Repeated unwanted DMs after being asked to stop",
  status: "open",
  overdue: true,
  createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
};

const baseDetailDto: AdminCommunityDetailDTO = {
  ...baseCardDto,
  description: "A peer-support and friendship space for trans, non-binary and questioning members.",
  foundedAt: "2023-03-15T00:00:00.000Z",
  visibility: "private",
  resolvedPercentage: 100,
  moderators: [baseModeratorDto],
  scopedQueue: [baseQueueItemDto],
};

describe("cardDtoToCommunity", () => {
  it("formats the member count with thousands separators", () => {
    const community = cardDtoToCommunity(
      { ...baseCardDto, memberCount: 3180 },
      translate,
      fmt,
    );
    expect(community.members).toBe("3,180");
  });

  it("passes the health score and breakdown through positionally as breakdown", () => {
    const community = cardDtoToCommunity(
      {
        ...baseCardDto,
        healthScore: 88,
        healthBreakdown: {
          memberActivity: 82,
          reportResolution: 96,
          memberSentiment: null,
          safetyLoad: 84,
        },
      },
      translate,
      fmt,
    );
    expect(community.health).toBe(88);
    expect(community.breakdown).toEqual([82, 96, null, 84]);
  });

  it("carries a null sentiment through to breakdown[2] rather than defaulting it to 0", () => {
    const community = cardDtoToCommunity(baseCardDto, translate, fmt);
    expect(community.breakdown[2]).toBeNull();
  });

  it("substitutes an eight-zero sparkline when the API returns an empty one", () => {
    const community = cardDtoToCommunity(
      { ...baseCardDto, activitySparkline: [] },
      translate,
      fmt,
    );
    expect(community.spark).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it("substitutes an eight-zero sparkline when the API returns a single point (would otherwise divide by zero)", () => {
    const community = cardDtoToCommunity(
      { ...baseCardDto, activitySparkline: [7] },
      translate,
      fmt,
    );
    expect(community.spark).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it("marks a community needing support so the card shows the warning", () => {
    const community = cardDtoToCommunity(
      { ...baseCardDto, needsSupport: true },
      translate,
      fmt,
    );
    expect(community.support).toBe(true);
  });

  it("defaults mods and queue to empty arrays on the card path", () => {
    const community = cardDtoToCommunity(baseCardDto, translate, fmt);
    expect(community.moderators).toEqual([]);
    expect(community.queue).toEqual([]);
  });
});

describe("detailDtoToCommunity", () => {
  it("formats foundedAt as a month and year", () => {
    const community = detailDtoToCommunity(baseDetailDto, translate, fmt);
    expect(community.founded).toBe("Mar 2023");
  });

  it("maps moderators onto the Moderator view shape", () => {
    const community = detailDtoToCommunity(
      {
        ...baseDetailDto,
        moderators: [
          baseModeratorDto,
          {
            userId: "00000000-0000-0000-0000-0000000000a2",
            slug: "sofia-almeida",
            name: "Sofia Almeida",
            initials: "SA",
            role: "mod",
            joinedAt: "2024-06-01T00:00:00.000Z",
          },
        ],
      },
      translate,
      fmt,
    );
    expect(community.moderators).toHaveLength(2);
    const founder = community.moderators[0];
    expect(founder).toMatchObject({
      initials: "IM",
      name: "Inês Martins",
      pronouns: "",
      role: "Founded the community",
      memberId: "00000000-0000-0000-0000-0000000000a1",
      isOwner: true,
    });
    expect(typeof founder?.tone).toBe("string");
    expect(community.moderators[1]?.role).toBe("Moderator since Jun 2024");
    expect(community.moderators[1]?.memberId).toBe(
      "00000000-0000-0000-0000-0000000000a2",
    );
    expect(community.moderators[1]?.isOwner).toBe(false);
  });

  it("maps the scoped queue onto the QueueItem view shape", () => {
    const community = detailDtoToCommunity(
      {
        ...baseDetailDto,
        scopedQueue: [
          {
            id: "queue-item-2",
            severity: "low",
            reasonCode: "spam",
            detail: null,
            status: "open",
            overdue: false,
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          },
        ],
      },
      translate,
      fmt,
    );
    expect(community.queue).toHaveLength(1);
    const queueItem = community.queue[0]!;
    expect(queueItem.severity).toBe("jade");
    expect(queueItem.categoryTone).toBe("jade");
    expect(queueItem.categoryLabel).toBe("Spam");
    // No `detail` text on this fixture, so the title falls back to the
    // reason's human label.
    expect(queueItem.title).toBe("Spam or self-promotion");
    expect(queueItem.meta).toBe("Open · 5h ago");
  });

  it("carries an overdue queue item's status into meta, still untranslated", () => {
    const community = detailDtoToCommunity(baseDetailDto, translate, fmt);
    const queueItem = community.queue[0]!;
    expect(queueItem.severity).toBe("coral");
    expect(queueItem.title).toBe(
      "Repeated unwanted DMs after being asked to stop",
    );
    expect(queueItem.meta).toBe("Open · overdue · 3h ago");
  });
});
