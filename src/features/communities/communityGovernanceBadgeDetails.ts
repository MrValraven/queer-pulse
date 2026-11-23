import type { TFunction } from "../../shared/i18n/types";
import type { CommunityGovernanceLogDetailsDTO } from "./api/communityGovernanceLog.api";
import {
  COMMUNITY_BADGE_ICON_LABEL_KEYS,
  COMMUNITY_FLAIR_TINT_LABEL_KEYS,
  communityGiftNameKey,
} from "./badges/communityBadgeCopy.data";

/**
 * The badge and gift side of the community governance trail: the labels for a
 * `badge_updated` field diff, and the detail lines the badge and gift actions
 * carry. Kept beside the details renderer so that file stays about layout.
 *
 * `badge_updated` reuses `changedSettings`, whose `name` field means the
 * community name on a `settings_changed` entry. The details renderer picks
 * these labels by the entry's action, so a badge rename never reads as a
 * community rename.
 */

/** The badge fields a `badge_updated` diff can name. A field this client does
 *  not know yet falls back to the humanized key in the renderer. */
export const GOVERNANCE_BADGE_FIELD_LABEL_KEYS: Record<string, string> = {
  name: "communities:detail.modtools.history.badgeField.name",
  iconKey: "communities:detail.modtools.history.badgeField.iconKey",
  tint: "communities:detail.modtools.history.badgeField.tint",
  threshold: "communities:detail.modtools.history.badgeField.threshold",
  isEnabled: "communities:detail.modtools.history.badgeField.isEnabled",
};

/** The catalog key for a wire value, or `null` for a value this client has no
 *  label for. Own keys only, so `constructor` never resolves to a function. */
function labelKeyFor(
  labelKeys: Record<string, string>,
  value: unknown,
): string | null {
  if (typeof value !== "string") return null;
  return Object.prototype.hasOwnProperty.call(labelKeys, value)
    ? (labelKeys[value] ?? null)
    : null;
}

/**
 * One side of a badge diff as a moderator reads it. An icon or colour key
 * becomes its label ("Calendar", "Jade"), and every other field passes through
 * untouched for the renderer's usual formatting. An icon or colour added to the
 * catalog after this client shipped stays as its raw key.
 */
export function badgeSettingValue(
  field: string,
  value: unknown,
  t: TFunction,
): unknown {
  if (field === "iconKey") {
    const labelKey = labelKeyFor(COMMUNITY_BADGE_ICON_LABEL_KEYS, value);
    return labelKey ? t(labelKey) : value;
  }
  if (field === "tint") {
    const labelKey = labelKeyFor(COMMUNITY_FLAIR_TINT_LABEL_KEYS, value);
    return labelKey ? t(labelKey) : value;
  }
  return value;
}

/**
 * The detail lines a badge or gift entry carries: the badge under the name it
 * had when the entry was written, how many members lost a deleted badge, and
 * the gift by its translated name. These lines never read a note, and the
 * details renderer drops the generic note line for a gift action, so a gift's
 * private note stays between sender and recipient.
 */
export function badgeDetailLines(
  details: CommunityGovernanceLogDetailsDTO,
  t: TFunction,
  formatNumber: (value: number) => string,
): { key: string; label: string; value: string }[] {
  const lines: { key: string; label: string; value: string }[] = [];

  if (details.badgeName) {
    lines.push({
      key: "badgeName",
      label: t("communities:detail.modtools.history.detail.badgeName"),
      value: details.badgeName,
    });
  }

  if (typeof details.holderCount === "number") {
    lines.push({
      key: "holderCount",
      label: t("communities:detail.modtools.history.detail.holderCount"),
      value: formatNumber(details.holderCount),
    });
  }

  if (details.giftKey) {
    lines.push({
      key: "giftKey",
      label: t("communities:detail.modtools.history.detail.giftKey"),
      value: t(communityGiftNameKey(details.giftKey)),
    });
  }

  return lines;
}
