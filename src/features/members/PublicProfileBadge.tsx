import { useState } from "react";
import { FiStar } from "react-icons/fi";
import { Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { usePublicProfileEligibility } from "../../app/providers/usePublicProfile";
import { PublicProfileModal } from "./PublicProfileModal";
import styles from "./PublicProfileBadge.module.css";

/**
 * The self-only "go public" affordance in the profile hero: a small icon button
 * with a tooltip that opens the public-profile modal. Reads eligibility only to
 * give the icon a subtle "unlocked" accent — both states open the same modal.
 * Rendered only on the viewer's own profile (the hero gates it on `isSelf`).
 */
export function PublicProfileBadge() {
  const { t } = useTranslation();
  const { eligibility } = usePublicProfileEligibility();
  const [open, setOpen] = useState(false);
  const label = t("members:publicProfile.badge.label");

  return (
    <>
      <Tooltip label={label}>
        <button
          type="button"
          className={`${styles.badge} ${eligibility.eligible ? styles.unlocked : ""}`}
          aria-label={label}
          onClick={() => setOpen(true)}
        >
          <FiStar aria-hidden />
        </button>
      </Tooltip>
      {open && <PublicProfileModal onClose={() => setOpen(false)} />}
    </>
  );
}
