import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { RosterMember } from "./community.model";
import type { CommunityRole } from "./membership.types";
import { FreezeCommunityModal } from "./FreezeCommunityModal";
import { ArchiveCommunityModal } from "./ArchiveCommunityModal";
import { TransferOwnershipModal } from "./TransferOwnershipModal";
import styles from "./CommunityDangerZone.module.css";

type OpenModal = "freeze" | "archive" | "transfer" | null;

/**
 * Owner/mod-only danger zone at the bottom of Mod tools: freeze (owner/mod),
 * archive and transfer ownership (owner-only). Each row opens its own confirm
 * modal — nothing here fires straight off a click. Lives in the Mod tools tab
 * (rather than the edit-community modal) because these are moderation/staff
 * actions on the community itself, not info-editing, and the tab is already
 * the deliberate, owner/mod-gated surface a member has to navigate to.
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
  const isOwner = role === "owner";
  const isStaff = isOwner || role === "mod";

  if (!isStaff) return null;

  return (
    <>
      <div className={styles.label}>
        <FiAlertTriangle aria-hidden />{" "}
        {t("communities:detail.dangerZone.heading")}
      </div>
      <div className={styles.zone}>
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
