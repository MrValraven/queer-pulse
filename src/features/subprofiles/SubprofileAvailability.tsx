import type { AccentKey, AvailabilityKey } from "./api/subprofiles.api";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { accentTintStyle, AVAILABILITY_OPTIONS } from "./subprofilePresence.data";
import styles from "./SubprofileAvailability.module.css";

/**
 * A status dot + label showing whether a persona is currently open to
 * collabs/booking. Colour is never the only signal — the label always
 * accompanies the dot. Renders nothing when the persona hasn't set one.
 */
export function SubprofileAvailability({
  value,
  accent,
}: {
  value: AvailabilityKey | null | undefined;
  accent: AccentKey;
}) {
  const { t } = useTranslation();
  if (!value) return null;

  const option = AVAILABILITY_OPTIONS.find((candidate) => candidate.value === value);
  if (!option) return null;

  const isOpen = value !== "not_available";

  return (
    <span
      className={`${styles.availability} pp-avail`}
      style={accentTintStyle(accent)}
    >
      <span
        className={`${styles.dot} ${isOpen ? styles.dotOpen : styles.dotMuted}`}
        aria-hidden
      />
      {t(option.labelKey)}
    </span>
  );
}
