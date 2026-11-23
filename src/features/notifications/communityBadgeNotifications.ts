import { FiAward } from "react-icons/fi";
import { communityPath } from "../../app/routeMap";
import type { TFunction, TranslateOptions } from "../../shared/i18n/types";
import type { NotifAction, Notification } from "./notifications.types";

/**
 * Where an earned-badge row opens: the community with its badge sheet open on
 * that badge. A payload with no badge id opens the sheet on the list. No slug
 * means no destination.
 */
export function communityBadgeEarnedHref(
  communitySlug: string | undefined,
  badgeId: string | undefined,
): string | undefined {
  if (!communitySlug) return undefined;
  const sheetHref = `${communityPath(communitySlug)}?badges=open`;
  return badgeId
    ? `${sheetHref}&badge=${encodeURIComponent(badgeId)}`
    : sheetHref;
}

/** Where a gift row opens: the community with the sheet on the member's gifts. */
export function communityGiftsHref(
  communitySlug: string | undefined,
): string | undefined {
  return communitySlug
    ? `${communityPath(communitySlug)}?badges=gifts`
    : undefined;
}

/** Whether a notification kind is one of the two community badge kinds. */
export function isCommunityBadgeKind(type: string): boolean {
  return (
    type === "community_badge_earned" || type === "community_gift_received"
  );
}

/**
 * The catalog key of the verb a community badge row's overlay link names, read
 * off where it opens, or `undefined` for any other row.
 */
export function communityBadgeRowVerbKey(
  sourceHref: string | undefined,
): string | undefined {
  if (!sourceHref?.includes("?badges=")) return undefined;
  return sourceHref.includes("?badges=gifts")
    ? "notifications:actions.openGifts"
    : "notifications:actions.openBadges";
}

/** The destination of a community badge row, read defensively off its payload. */
export function communityBadgeSourceHref(
  type: string,
  payload: Record<string, unknown> | null | undefined,
): string | undefined {
  const communitySlug =
    typeof payload?.communitySlug === "string"
      ? payload.communitySlug
      : undefined;
  if (type === "community_gift_received")
    return communityGiftsHref(communitySlug);
  const badgeId =
    typeof payload?.badgeId === "string" && payload.badgeId
      ? payload.badgeId
      : undefined;
  return communityBadgeEarnedHref(communitySlug, badgeId);
}

/**
 * The actions of an earned-badge row: wear the badge from the row, or open the
 * badge sheet. Live rows and the demo row build them here, so both modes read
 * the same.
 */
export function communityBadgeEarnedActions(
  t: TFunction,
  row: {
    communitySlug: string;
    badgeId: string;
    badgeName: string;
    communityName: string;
    href: string;
  },
): NotifAction[] {
  return [
    {
      label: t("notifications:actions.wearBadge"),
      variant: "primary",
      href: row.href,
      wearBadge: {
        communitySlug: row.communitySlug,
        badgeId: row.badgeId,
        toast: t("notifications:actions.woreBadgeToast", {
          badgeName: row.badgeName,
          communityName: row.communityName,
        }),
      },
    },
    {
      label: t("notifications:actions.openBadges"),
      variant: "ghost",
      href: row.href,
    },
  ];
}

/** The gift a gift row can report: its id and its name in the viewer's words. */
export interface CommunityGiftReportTarget {
  giftId: string;
  giftName: string;
}

/**
 * The actions of a gift row: open the member's gifts, and report the gift when
 * the row knows which gift it is. A gift with no id has nothing to report.
 */
export function communityGiftActions(
  t: TFunction,
  href: string | undefined,
  reportTarget?: CommunityGiftReportTarget,
): NotifAction[] {
  const actions: NotifAction[] = [];
  if (href) {
    actions.push({
      label: t("notifications:actions.openGifts"),
      variant: "ghost",
      href,
    });
  }
  if (reportTarget?.giftId) {
    actions.push({
      label: t("notifications:actions.reportGift"),
      variant: "ghost",
      href: href ?? "#",
      reportGift: {
        giftId: reportTarget.giftId,
        giftName: reportTarget.giftName,
      },
    });
  }
  return actions;
}

/**
 * What the report dialog calls a gift in its title: the gift and its sender,
 * or a gift from a deleted member when the row has no sender.
 */
export function communityGiftReportSubject(
  t: TFunction,
  giftName: string,
  senderName: string | undefined,
): string {
  return senderName
    ? t("communities:badges.shelf.reportSubject", {
        gift: giftName,
        name: senderName,
      })
    : t("communities:badges.shelf.reportSubjectDeleted", { gift: giftName });
}

/**
 * The actions a live community badge row carries, or `undefined` for any other
 * kind or a payload with no community to open. `tokens` are the row's resolved
 * copy values, so the toast names the badge exactly as the sentence does.
 */
export function communityBadgeActionsOf(
  type: string,
  payload: Record<string, unknown> | null | undefined,
  t: TFunction,
  tokens: TranslateOptions,
): NotifAction[] | undefined {
  const communitySlug =
    typeof payload?.communitySlug === "string" && payload.communitySlug
      ? payload.communitySlug
      : undefined;
  if (type === "community_gift_received") {
    const giftsHref = communityGiftsHref(communitySlug);
    const giftId =
      typeof payload?.giftId === "string" && payload.giftId
        ? payload.giftId
        : undefined;
    const giftActions = communityGiftActions(
      t,
      giftsHref,
      giftId ? { giftId, giftName: String(tokens.giftName ?? "") } : undefined,
    );
    return giftActions.length > 0 ? giftActions : undefined;
  }
  if (type !== "community_badge_earned") return undefined;
  const badgeId =
    typeof payload?.badgeId === "string" && payload.badgeId
      ? payload.badgeId
      : undefined;
  const href = communityBadgeEarnedHref(communitySlug, badgeId);
  if (!communitySlug || !badgeId || !href) return undefined;
  return communityBadgeEarnedActions(t, {
    communitySlug,
    badgeId,
    badgeName: String(tokens.badgeName ?? ""),
    communityName: String(tokens.communityName ?? ""),
    href,
  });
}

/**
 * Sets what a live community badge row adds to its view: its actions, only
 * when it has any, and the award glyph the demo row uses on an earned row.
 * Any other kind is left as it is.
 */
export function applyCommunityBadgeRow(
  view: Notification,
  type: string,
  payload: Record<string, unknown> | null | undefined,
  t: TFunction,
  tokens: TranslateOptions,
): void {
  const badgeActions = communityBadgeActionsOf(type, payload, t, tokens);
  if (badgeActions) view.actions = badgeActions;
  if (type === "community_badge_earned") {
    view.icon = { Glyph: FiAward, background: "rgba(var(--plum-rgb), .07)" };
  }
}
