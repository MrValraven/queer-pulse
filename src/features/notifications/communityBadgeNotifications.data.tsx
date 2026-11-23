import { FiAward } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { communityBadgeDisplayName } from "../communities/badges/communityBadgeDisplayName";
import { communityGiftNameKey } from "../communities/badges/communityBadgeCopy.data";
import { DEMO_GIFT_SEED } from "../communities/badges/communityBadgesDemo.data";
import { demoGiftIdOf } from "../communities/badges/communityBadgesDemoStore";
import {
  currentUserSlug,
  memberAvatar,
  memberName,
} from "../members/data/members";
import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import {
  communityBadgeEarnedActions,
  communityBadgeEarnedHref,
  communityGiftActions,
  communityGiftsHref,
} from "./communityBadgeNotifications";
import type { DemoNotificationRow } from "./notificationsListActivity.data";

/** The demo community both rows belong to, and the badge the earned row names. */
const DEMO_COMMUNITY_SLUG = "queer-runners";
const DEMO_COMMUNITY_NAME = "Queer Runners Lisboa";
const DEMO_BADGE_ID = "demo-badge-queer-runners-regular";
const DEMO_GIFT_SENDER_SLUG = "carla";

/** The id of the demo earned row, which starts unread. */
export const DEMO_BADGE_EARNED_NOTIFICATION_ID = 40;
const DEMO_GIFT_NOTIFICATION_ID = 41;

const MILLISECONDS_PER_HOUR = 3_600_000;
const MILLISECONDS_PER_DAY = 86_400_000;

/**
 * The two demo rows for community badges: an unread earned row with its two
 * actions (id 40) and a read gift row from Carla with her note (id 41).
 */
export function buildCommunityBadgeNotifications(
  t: TFunction,
  fmt: Formatters,
): DemoNotificationRow[] {
  const badgeName = communityBadgeDisplayName(
    { name: "Regular", starterKey: "regular" },
    t,
  );
  const earnedHref = communityBadgeEarnedHref(
    DEMO_COMMUNITY_SLUG,
    DEMO_BADGE_ID,
  );
  const giftsHref = communityGiftsHref(DEMO_COMMUNITY_SLUG);
  const giftSeed = DEMO_GIFT_SEED[DEMO_COMMUNITY_SLUG]?.find(
    (seed) =>
      seed.senderSlug === DEMO_GIFT_SENDER_SLUG &&
      seed.recipientSlug === currentUserSlug,
  );
  const giftValues = {
    giftName: t(communityGiftNameKey(giftSeed?.giftKey ?? "heart")),
    communityName: DEMO_COMMUNITY_NAME,
  };
  const giftSentDaysAgo = giftSeed?.sentDaysAgo ?? 2;
  const senderAvatar = memberAvatar(DEMO_GIFT_SENDER_SLUG);
  // The demo store's id for Carla's gift, so Report gift files against the
  // gift the shelf shows.
  const giftId = demoGiftIdOf(
    DEMO_COMMUNITY_SLUG,
    DEMO_GIFT_SENDER_SLUG,
    currentUserSlug,
  );

  return [
    {
      id: DEMO_BADGE_EARNED_NOTIFICATION_ID,
      type: "community",
      unread: true,
      icon: { Glyph: FiAward, background: "rgba(var(--plum-rgb), .07)" },
      text: t("notifications:type.community_badge_earned.text", {
        badgeName,
        communityName: DEMO_COMMUNITY_NAME,
      }),
      meta: t("notifications:type.community_badge_earned.meta"),
      time: fmt.relativeTime(-5, "hour"),
      createdAtIso: new Date(
        Date.now() - 5 * MILLISECONDS_PER_HOUR,
      ).toISOString(),
      sourceHref: earnedHref,
      actions: communityBadgeEarnedActions(t, {
        communitySlug: DEMO_COMMUNITY_SLUG,
        badgeId: DEMO_BADGE_ID,
        badgeName,
        communityName: DEMO_COMMUNITY_NAME,
        href: earnedHref ?? routes.communities,
      }),
    },
    {
      id: DEMO_GIFT_NOTIFICATION_ID,
      type: "community",
      unread: false,
      avatar: {
        initials: senderAvatar?.initials ?? "",
        tint: senderAvatar?.tint ?? "plum",
        src: senderAvatar?.photo,
      },
      actorSlug: DEMO_GIFT_SENDER_SLUG,
      actor: {
        name: memberName(DEMO_GIFT_SENDER_SLUG),
        href: `${routes.members}/${DEMO_GIFT_SENDER_SLUG}`,
        textKey: "notifications:type.community_gift_received.textNamed",
        textValues: giftValues,
      },
      text: t("notifications:type.community_gift_received.text", giftValues),
      meta: t("notifications:type.community_gift_received.meta"),
      reason: giftSeed?.note ?? undefined,
      reasonLeadKey: "notifications:row.reasonLeadGiftNote",
      time: fmt.relativeTime(-giftSentDaysAgo, "day"),
      createdAtIso: new Date(
        Date.now() - giftSentDaysAgo * MILLISECONDS_PER_DAY,
      ).toISOString(),
      sourceHref: giftsHref,
      actions: communityGiftActions(
        t,
        giftsHref,
        giftId ? { giftId, giftName: giftValues.giftName } : undefined,
      ),
    },
  ];
}
