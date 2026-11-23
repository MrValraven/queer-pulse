import { currentUserSlug } from "../../members/data/members";
import type {
  CommunityBadgeIconKey,
  CommunityBadgeRuleType,
  CommunityFlairTint,
  CommunityGiftKey,
} from "./communityBadges.catalog";

/**
 * The seed of the demo badges store (`communityBadgesDemoStore`). Members are
 * keyed by the same slugs the `livingCommunities.data.ts` mocks use, so the
 * name lines join this data at render through `useCommunityMemberDecor`.
 * Every top-level community also gets the four starters lazily, so only the
 * extras, the progress, the worn badges and the gifts live here. Days count
 * back from the moment a community is first read.
 */

/** A member's count for each rule, in this community only. */
export type DemoBadgeProgress = Record<CommunityBadgeRuleType, number>;

function progressOf(
  tenureDays: number,
  eventsCheckedIn: number,
  volunteerHours: number,
  postsAndReplies: number,
): DemoBadgeProgress {
  return {
    tenure_days: tenureDays,
    events_checked_in: eventsCheckedIn,
    volunteer_hours: volunteerHours,
    posts_and_replies: postsAndReplies,
  };
}

export interface DemoExtraBadgeSeed {
  /** The id suffix: the badge id is `demo-badge-<slug>-<key>`. */
  key: string;
  name: string;
  iconKey: CommunityBadgeIconKey;
  tint: CommunityFlairTint;
  ruleType: CommunityBadgeRuleType;
  threshold: number;
  isEnabled: boolean;
  /** Members who earned it while the threshold sat lower. Raising a threshold
   *  never removes an award, so these keep theirs. */
  earlierHolderSlugs: readonly string[];
}

/** Owner-made badges, created after the starters in this order. */
export const DEMO_BADGE_EXTRA_BADGES: Record<
  string,
  readonly DemoExtraBadgeSeed[]
> = {
  "queer-runners": [
    {
      key: "sunrise",
      name: "Sunrise club",
      iconKey: "sun",
      tint: "rose",
      ruleType: "events_checked_in",
      threshold: 10,
      isEnabled: true,
      earlierHolderSlugs: [],
    },
    {
      key: "trail",
      name: "Trail crew",
      iconKey: "compass",
      tint: "violet",
      ruleType: "volunteer_hours",
      threshold: 20,
      isEnabled: false,
      earlierHolderSlugs: ["monica"],
    },
  ],
};

export interface DemoCommunityProgressSeed {
  bySlug: Record<string, DemoBadgeProgress>;
  /** The count of every other roster member; null leaves them at zero. */
  otherRosterMembers: DemoBadgeProgress | null;
}

/** Progress per community. Awards are every badge whose threshold the
 *  progress reaches when the community is first read. */
export const DEMO_BADGE_PROGRESS: Record<string, DemoCommunityProgressSeed> = {
  "queer-runners": {
    bySlug: {
      [currentUserSlug]: progressOf(620, 4, 2, 12),
      monica: progressOf(900, 22, 14, 140),
      carla: progressOf(400, 9, 6, 60),
      diogo: progressOf(200, 5, 0, 25),
      sofia: progressOf(120, 3, 1, 11),
    },
    otherRosterMembers: progressOf(40, 1, 0, 2),
  },
  "trans-hub": {
    bySlug: { [currentUserSlug]: progressOf(680, 1, 8, 4) },
    otherRosterMembers: null,
  },
};

/** The seeded awards are this many days old. */
export const DEMO_BADGE_AWARDED_DAYS_AGO = 3;

/** Worn badges per community: member slug to badge key (a starter key or an
 *  extra's key). The viewer wears nothing at first. */
export const DEMO_WORN_BADGES: Record<string, Record<string, string>> = {
  "queer-runners": {
    monica: "old_friend",
    carla: "regular",
    sofia: "in_the_conversation",
  },
};

export interface DemoGiftSeed {
  senderSlug: string;
  recipientSlug: string;
  giftKey: CommunityGiftKey;
  note: string | null;
  sentDaysAgo: number;
  /** Days since the recipient hid it, or null while it shows. */
  hiddenDaysAgo: number | null;
}

/** Gifts per community, in send order. */
export const DEMO_GIFT_SEED: Record<string, readonly DemoGiftSeed[]> = {
  "queer-runners": [
    {
      senderSlug: "carla",
      recipientSlug: currentUserSlug,
      giftKey: "heart",
      note: "Thanks for sweeping the route on Sunday",
      sentDaysAgo: 2,
      hiddenDaysAgo: null,
    },
    {
      senderSlug: "monica",
      recipientSlug: currentUserSlug,
      giftKey: "coffee",
      note: null,
      sentDaysAgo: 20,
      hiddenDaysAgo: null,
    },
    {
      senderSlug: "diogo",
      recipientSlug: currentUserSlug,
      giftKey: "music",
      note: null,
      sentDaysAgo: 4,
      hiddenDaysAgo: 3,
    },
    {
      senderSlug: "monica",
      recipientSlug: "sofia",
      giftKey: "star",
      note: "Eight months and a PB",
      sentDaysAgo: 1,
      hiddenDaysAgo: null,
    },
    {
      senderSlug: currentUserSlug,
      recipientSlug: "kai",
      giftKey: "smile",
      note: null,
      sentDaysAgo: 3,
      hiddenDaysAgo: null,
    },
    {
      senderSlug: currentUserSlug,
      recipientSlug: "nuno",
      giftKey: "sun",
      note: null,
      sentDaysAgo: 5,
      hiddenDaysAgo: null,
    },
  ],
};
