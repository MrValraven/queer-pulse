import { FiCheckCircle } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type DirectoryPlace } from "./directoryPlaces";
import {
  GOODFOR_LABEL_KEYS,
  goodForLabel,
} from "./listBusiness/listBusiness.data";
import s from "./DirectorySpacePage.module.css";

const ACCESS_KEYWORDS = [
  "wheelchair",
  "step-free",
  "step free",
  "gender-neutral",
  "gender neutral",
  "accessible",
  "ramp",
  "lift access",
  "ground floor",
  "quiet",
  "low-sensory",
];

function matchesAccessKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return ACCESS_KEYWORDS.some((keyword) => lower.includes(keyword));
}

interface Props {
  place: DirectoryPlace;
}

/** "Access & inclusion" highlight row. Sourced *only* from `place.goodFor`,
 * and only entries that are both marked `yes` and an exact match against
 * the canonical live-wizard amenity vocabulary (`GOODFOR_LABEL_KEYS`),
 * further narrowed to the accessibility-flavoured subset via keyword match
 * on that canonical id. Deliberately does NOT scan `place.pills`: pills are
 * owner-typed free text on live listings (the composer even suggests
 * "e.g. Wheelchair-accessible" as example copy), so a raw keyword scan over
 * them would false-positive on incidental phrasing like "Accessible by
 * tram" or "Quiet neighbourhood" that isn't actually an accessibility
 * amenity. Demo places (directoryPlaces.ts) keep their accessibility tags in
 * `pills` with unrelated freeform `goodFor` text, so this intentionally
 * renders nothing for them — it's a live/structured-data-only feature.
 * Renders nothing when `goodFor` has no accessibility keys. */
export function DirectoryAccess({ place }: Props) {
  const { t } = useTranslation();

  const items = place.goodFor
    .filter(
      (item) =>
        item.yes &&
        GOODFOR_LABEL_KEYS[item.label] &&
        matchesAccessKeyword(item.label),
    )
    .map((item) => goodForLabel(t, item.label));

  if (items.length === 0) return null;

  return (
    <div className={s.contactRow}>
      <FiCheckCircle aria-hidden="true" />
      <span>
        <b>{t("marketing:directory.detail.accessLabel")}: </b>
        {items.join(", ")}
      </span>
    </div>
  );
}
