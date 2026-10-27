import type { TFunction } from "../../shared/i18n/types";
import type { AdminTone } from "./ui";
import type {
  ClassifiedFeature,
  FeatureUsageState,
} from "./api/adminFeatureUsage.api";

/** Badge tone per state. `browsed-but-empty` gets `danger`: it is the row
 *  this whole panel exists to surface. */
export const STATE_TONE: Record<FeatureUsageState, AdminTone> = {
  busy: "jade",
  "browsed-but-empty": "danger",
  quiet: "amber",
  "not-launched": "ghost",
};

/** The catalog key segment for each state, since a kebab-case DTO value
 *  cannot be spliced straight into a dotted catalog path. */
export const STATE_CATALOG_SUFFIX: Record<FeatureUsageState, string> = {
  busy: "busy",
  "browsed-but-empty": "browsedButEmpty",
  quiet: "quiet",
  "not-launched": "notLaunched",
};

/** `camelCase` to "Capitalised words", e.g. `flatmateProfiles` reads
 *  "Flatmate profiles". Only the fallback path below calls this; a labelled
 *  feature never reaches it. */
export function humanizeFeatureKey(featureKey: string): string {
  const words = featureKey
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(" ")
    .filter(Boolean);
  if (words.length === 0) return featureKey;
  const [firstWord, ...restWords] = words;
  return [
    firstWord!.charAt(0).toUpperCase() + firstWord!.slice(1),
    ...restWords,
  ].join(" ");
}

/**
 * A feature's display name, catalog-first with a humanised fallback.
 *
 * The backend's tracked feature list comes from `launchedFeatures` and can
 * grow at any time; a demo fixture or a catalog merge can only ever cover the
 * keys known when it was written. `useTranslation`'s `t()` has no
 * default-value argument (`translate.ts`'s `resolveEntry` either returns the
 * resolved string or `undefined`, and `I18nProvider`'s `t()` echoes the raw
 * key back on a full miss; see `I18nProvider.tsx`'s `return key;` for details), so a
 * miss is detected here by comparing the result to the key itself. A raw
 * catalog key on an admin page ("admin:featureUsage.feature.housingGroups")
 * is a worse failure than an imperfect but readable fallback label, so an
 * unlabelled feature reads as "Housing groups", a name a reader can use.
 */
export function featureDisplayName(featureKey: string, t: TFunction): string {
  const catalogKey = `admin:featureUsage.feature.${featureKey}`;
  const resolved = t(catalogKey);
  return resolved === catalogKey ? humanizeFeatureKey(featureKey) : resolved;
}

/**
 * The explanation shown in a reach-only feature's merged Created/Total cell.
 * Resolved catalog-first so `feed`, `content` and `cinema` read in the
 * viewer's language, with two floors under it so the cell can never end up
 * blank: the backend's own `reason` (English, but real), then a generic
 * translated line. `resolveEntry`'s echo-the-key-back behaviour on a miss is
 * what `featureDisplayName` above already relies on to detect a miss, reused
 * here the same way.
 */
export function reachOnlyReason(
  feature: ClassifiedFeature,
  t: TFunction,
): string {
  const catalogKey = `admin:featureUsage.reachOnlyReason.${feature.featureKey}`;
  const resolved = t(catalogKey);
  if (resolved !== catalogKey) return resolved;
  if (feature.reason) return feature.reason;
  return t("admin:featureUsage.reachOnlyReason.generic");
}
