import type { TFunction } from "../../shared/i18n/types";
import type { Community, DemoCommunity } from "../homepage/data/types";

/**
 * The member-count line on every community card, hero and sidebar row: the
 * pluralised "N members" for an open roster, "Members only" for a private one
 * (which shows no number). One resolver for live (`cardDtoToCommunity`) and
 * demo (`localizeDemoCommunity`), so both modes read the same catalog keys and
 * follow the app language.
 */
export function memberCountLabel(
  accessTier: Community["accessTier"],
  memberCount: number,
  translate: TFunction,
): string {
  return accessTier === "private"
    ? translate("communities:common.count.membersOnly")
    : translate("communities:common.count.members", { count: memberCount });
}

/**
 * Re-labels a demo fixture's `count` in the app language. The fixtures carry
 * the numeric `memberCount` plus a pre-baked English `count` fallback; the
 * demo branch of each data hook runs the fixture through here so a Portuguese
 * user sees "340 pessoas", the same string live mode builds. A row with no
 * `memberCount` (a community founded this session, already labelled through
 * `createdToCommunity`) passes through untouched.
 */
export function localizeDemoCommunity<T extends Community>(
  community: T & Partial<Pick<DemoCommunity, "memberCount">>,
  translate: TFunction,
): T {
  if (community.memberCount === undefined) return community;
  return {
    ...community,
    count: memberCountLabel(
      community.accessTier,
      community.memberCount,
      translate,
    ),
  };
}
