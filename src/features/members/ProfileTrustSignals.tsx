import { useState } from "react";
import { FiHeart, FiInfo } from "react-icons/fi";
import { Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Member } from "./data/members";
import { ActivityBandPill } from "./ActivityBandPill";
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
 * The coarse "recently active" band sits in this same row because it belongs to
 * the same register: a quiet fact about the person, stated once. It renders
 * nothing at all when `profile.activityBand` is null, which covers a member who
 * opted out AND a member the platform has never observed. The backend has
 * already applied the opt-out for this viewer (see its `visibleBand`), so there
 * is no gate to re-apply here.
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
      <ActivityBandPill band={profile.activityBand} />
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
