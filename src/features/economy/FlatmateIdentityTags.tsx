import { FiHeart, FiHome } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Profile } from "./flatmates.data";
import styles from "./FlatmatesPage.module.css";

/** Renders a member's affirming safe-space needs and shared-living norms on the
 * flatmate card. Only shows what's present — the backend already gates the
 * special-category fields, so an empty value simply means "not shown to you".
 * Framed as what a home offers, never as excluding anyone. */
export function FlatmateIdentityTags({ profile }: { profile: Profile }) {
  const { t } = useTranslation();
  const safeSpaceNeeds = profile.safeSpaceNeeds ?? [];
  const householdValues = Object.values(profile.householdNorms ?? {}).filter(
    (value): value is string => Boolean(value),
  );

  if (safeSpaceNeeds.length === 0 && householdValues.length === 0) return null;

  return (
    <div className={styles.safeSpace}>
      {safeSpaceNeeds.length > 0 && (
        <div
          className={styles.safeSpaceRow}
          aria-label={t("economy:flatmates.card.safeSpaceLabel")}
        >
          <FiHeart className={styles.safeSpaceIcon} aria-hidden />
          <div className={styles.tags}>
            {safeSpaceNeeds.map((need) => (
              <span key={need} className={styles.affirmTag}>
                {need}
              </span>
            ))}
          </div>
        </div>
      )}
      {householdValues.length > 0 && (
        <div
          className={styles.safeSpaceRow}
          aria-label={t("economy:flatmates.card.householdLabel")}
        >
          <FiHome className={styles.safeSpaceIcon} aria-hidden />
          <div className={styles.tags}>
            {householdValues.map((value) => (
              <span key={value} className={styles.tag}>
                {value}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
