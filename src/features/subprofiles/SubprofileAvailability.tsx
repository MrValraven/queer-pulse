import type {
  AccentKey,
  AvailabilityKey,
  SkinData,
  SubprofileKind,
} from "./api/subprofiles.api";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  accentTintStyle,
  AVAILABILITY_OPTIONS,
} from "./subprofilePresence.data";
import {
  availabilityLabelKeyFor,
  availabilityToneKeyFor,
} from "./skins/tattoo/tattooBooksStatus";
import styles from "./SubprofileAvailability.module.css";

/**
 * A status dot + label showing whether a persona is currently open to
 * collabs/booking. Colour is never the only signal — the label always
 * accompanies the dot. Renders nothing when the persona hasn't set one.
 * With a `kind`, the label follows that kind's words (a tattoo persona reads
 * Books open / Waitlist / Books closed, from its stored status when set).
 */
export function SubprofileAvailability({
  value,
  accent,
  kind,
  skinData,
}: {
  value: AvailabilityKey | null | undefined;
  accent: AccentKey;
  kind?: SubprofileKind;
  skinData?: SkinData | null;
}) {
  const { t } = useTranslation();

  let labelKey: string | null = null;
  let toneKey: string | null | undefined = value;
  if (kind) {
    labelKey = availabilityLabelKeyFor(kind, value, skinData);
    toneKey = availabilityToneKeyFor(kind, value, skinData);
  } else if (value) {
    labelKey =
      AVAILABILITY_OPTIONS.find((candidate) => candidate.value === value)
        ?.labelKey ?? null;
  }
  if (!labelKey) return null;

  const isOpen = toneKey !== "not_available";

  return (
    <span
      className={`${styles.availability} pp-avail`}
      style={accentTintStyle(accent)}
    >
      <span
        className={`${styles.dot} ${isOpen ? styles.dotOpen : styles.dotMuted}`}
        aria-hidden
      />
      {t(labelKey)}
    </span>
  );
}
