import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { RosterMember } from "./community.model";
import type { CommunityRole } from "./membership.types";
import { FreezeCommunityModal } from "./FreezeCommunityModal";
import { ArchiveCommunityModal } from "./ArchiveCommunityModal";
import { TransferOwnershipModal } from "./TransferOwnershipModal";
import { CommunityOwnerReviewSection } from "./CommunityOwnerReviewSection";
import { useCommunityOwnerReview } from "./api/useCommunityOwnerReview";
import {
  isOwnerRole,
  isStaffRole,
  staffRoleLabelKey,
} from "./communityStaffRole";
import styles from "./CommunityDangerZone.module.css";

type OpenModal = "freeze" | "archive" | "transfer" | null;

/**
 * Staff-only danger zone at the bottom of Mod tools: freeze (owner, co-owner
 * or moderator), archive and transfer ownership (owner only), and the
 * owner-absence escalation. Each row opens its own confirm modal — nothing
 * here fires straight off a click. Lives in the Mod tools tab (rather than the
 * edit-community modal) because these are moderation/staff actions on the
 * community itself, and the tab is already the deliberate, staff-gated surface
 * a member has to navigate to.
 *
 * A co-owner reaches everything a moderator does. Transferring ownership and
 * archiving stay owner-only, and the role line at the top says so, so a
 * co-owner is never left guessing why a row is missing.
 */
export function CommunityDangerZone({
  slug,
  name,
  role,
  roster,
}: {
  slug: string;
  name: string;
  role: CommunityRole | null;
  roster: RosterMember[];
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<OpenModal>(null);
  const isOwner = isOwnerRole(role);
  const isStaff = isStaffRole(role);
  const { state: ownerReview } = useCommunityOwnerReview(slug, isStaff);

  if (!isStaff) return null;

  const roleLabelKey = staffRoleLabelKey(role);
  // An open request (or the platform's own flag) goes to the top of the zone:
  // for the owner in particular, seeing it is the whole point.
  const isReviewRaised = Boolean(
    ownerReview?.request ?? ownerReview?.needsOwnerReviewAt,
  );
  const reviewSection = (
    <CommunityOwnerReviewSection
      slug={slug}
      state={ownerReview}
      isOwner={isOwner}
    />
  );

  return (
    <>
      <div className={styles.label}>
        <FiAlertTriangle aria-hidden />{" "}
        {t("communities:detail.dangerZone.heading")}
      </div>
      <div className={styles.zone}>
        {roleLabelKey && <p className={styles.roleLine}>{t(roleLabelKey)}</p>}
        {isReviewRaised && reviewSection}
        <DangerRow
          label={t("communities:detail.dangerZone.freeze.label")}
          text={t("communities:detail.dangerZone.freeze.text")}
          cta={t("communities:detail.dangerZone.freeze.cta")}
          onClick={() => setOpen("freeze")}
        />
        {isOwner && (
          <>
            <DangerRow
              label={t("communities:detail.dangerZone.transfer.label")}
              text={t("communities:detail.dangerZone.transfer.text")}
              cta={t("communities:detail.dangerZone.transfer.cta")}
              onClick={() => setOpen("transfer")}
            />
            <DangerRow
              label={t("communities:detail.dangerZone.archive.label")}
              text={t("communities:detail.dangerZone.archive.text")}
              cta={t("communities:detail.dangerZone.archive.cta")}
              onClick={() => setOpen("archive")}
            />
          </>
        )}
        {!isReviewRaised && reviewSection}
      </div>

      {open === "freeze" && (
        <FreezeCommunityModal
          slug={slug}
          name={name}
          onClose={() => setOpen(null)}
        />
      )}
      {open === "archive" && (
        <ArchiveCommunityModal
          slug={slug}
          name={name}
          onClose={() => setOpen(null)}
        />
      )}
      {open === "transfer" && (
        <TransferOwnershipModal
          slug={slug}
          name={name}
          roster={roster}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}

function DangerRow({
  label,
  text,
  cta,
  onClick,
}: {
  label: string;
  text: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>{label}</div>
      <p className={styles.rowText}>{text}</p>
      <Button variant="ghost" size="sm" onClick={onClick}>
        {cta}
      </Button>
    </div>
  );
}
