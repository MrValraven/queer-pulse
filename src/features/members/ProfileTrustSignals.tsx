import { useState } from "react";
import { FiHeart, FiInfo } from "react-icons/fi";
import { Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Member } from "./data/members";
import { ProfileTrustModal } from "./ProfileTrustModal";
import styles from "./ProfileTrustSignals.module.css";

/**
 * Compact trust-signals row for a member's profile: N vouches, plus an info
 * icon (tooltip: "Trust signals") that opens {@link ProfileTrustModal}.
 * Verified/Staff
 * status is deliberately NOT repeated here — the hero's photo badge
 * (`ProfileRail`'s `.vbadgeLg`) and the name-row `MemberStaffBadge` already
 * state both facts once each; restating them a third time in smaller text
 * right below the photo added noise, not information.
 *
 * The vouch count reads `profile.vouchers.length`, matching
 * `MobileProfileStats` and `PublicProfileSections`: the FE `Member` type has
 * no separate denormalized `vouchCount` field, only the `vouchers` slug
 * array, so every surface that shows a vouch number derives it from that
 * array's length. A member with no vouches still shows the "0 vouches" row
 * (honesty over hiding a low number).
 */
export function ProfileTrustSignals({ profile }: { profile: Member }) {
  const { t } = useTranslation();
  const vouchCount = profile.vouchers?.length ?? 0;
  const [explainerOpen, setExplainerOpen] = useState(false);

  return (
    <div className={styles.trust}>
      <span className={styles.row}>
        <FiHeart aria-hidden />
        {t("members:profile.trust.vouchCount", { count: vouchCount })}
      </span>
      <Tooltip label={t("members:profile.trust.modalTitle")}>
        <button
          type="button"
          className={styles.explain}
          aria-label={t("members:profile.trust.modalTitle")}
          onClick={() => setExplainerOpen(true)}
        >
          <FiInfo aria-hidden />
        </button>
      </Tooltip>
      {explainerOpen && (
        <ProfileTrustModal onClose={() => setExplainerOpen(false)} />
      )}
    </div>
  );
}
