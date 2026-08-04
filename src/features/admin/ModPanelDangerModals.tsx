import { useState } from "react";
import {
  Avatar,
  ConfirmDialog,
  EmptyState,
  Eyebrow,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  useArchiveCommunity,
  useTransferOwnership,
} from "../communities/api/useCommunityMutations";
import { useRoster } from "../communities/api/useRoster";
import { photoOf } from "../communities/communityPeople";
import styles from "./ModPanel.module.css";

/* -------------------------------------------------------------------------- */
/* ArchiveConfirmModal                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Confirms an irreversible community archive before it fires. Live: POSTs
 * `/communities/:slug/archive` (owner-only) via `useArchiveCommunity`, which
 * invalidates the detail + listings on success. Demo: the mutation is a no-op,
 * so this just confirms and toasts (the mock stays put).
 */
export function ArchiveConfirmModal({
  slug,
  onClose,
  onArchived,
}: {
  slug: string;
  onClose: () => void;
  onArchived?: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const archiveCommunity = useArchiveCommunity();

  const confirm = () => {
    if (archiveCommunity.isPending) return;
    archiveCommunity.mutate(
      { slug },
      {
        onSuccess: () => {
          showToast(t("admin:modPanel.settings.archive.toast"), "success");
          onArchived?.();
          onClose();
        },
        onError: () =>
          showToast(t("admin:modPanel.settings.errorToast"), "error"),
      },
    );
  };

  return (
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={confirm}
      title={t("admin:modPanel.settings.archive.confirm.title")}
      tone="destructive"
      loading={archiveCommunity.isPending}
      confirmLabel={t("admin:modPanel.settings.archive.confirm.cta")}
      cancelLabel={t("admin:modPanel.settings.cancel")}
    >
      <Eyebrow>{t("admin:modPanel.settings.irreversible")}</Eyebrow>
      <p>{t("admin:modPanel.settings.archive.confirm.body")}</p>
    </ConfirmDialog>
  );
}

/* -------------------------------------------------------------------------- */
/* TransferOwnershipModal                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Picks a member to hand the community to, then transfers ownership. Live:
 * POSTs `/communities/:slug/transfer` (owner-only) via `useTransferOwnership`;
 * the caller is demoted to a moderator server-side. Demo: a no-op that confirms
 * + toasts. The candidate list is the real roster (live) or the mock roster
 * (demo), minus the current owner and anyone without a resolvable slug (a slug
 * is the transfer target the API addresses).
 */
export function TransferOwnershipModal({
  slug,
  onClose,
}: {
  slug: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { roster } = useRoster(slug);
  const transferOwnership = useTransferOwnership(slug);
  const [selected, setSelected] = useState<string>("");

  const candidates = roster.filter(
    (member) => member.role !== "owner" && Boolean(member.slug),
  );

  const confirm = () => {
    if (!selected || transferOwnership.isPending) return;
    transferOwnership.mutate(
      { memberSlug: selected },
      {
        onSuccess: () => {
          showToast(t("admin:modPanel.settings.transfer.toast"), "success");
          onClose();
        },
        onError: () =>
          showToast(t("admin:modPanel.settings.errorToast"), "error"),
      },
    );
  };

  return (
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={confirm}
      title={t("admin:modPanel.settings.transfer.modal.title")}
      description={t("admin:modPanel.settings.transfer.modal.body")}
      tone="destructive"
      loading={transferOwnership.isPending}
      confirmLabel={t("admin:modPanel.settings.transfer.modal.cta")}
      cancelLabel={t("admin:modPanel.settings.cancel")}
    >
      <Eyebrow>{t("admin:modPanel.settings.irreversible")}</Eyebrow>
      {candidates.length === 0 ? (
        <EmptyState
          compact
          title={t("admin:modPanel.settings.transfer.modal.emptyTitle")}
          description={t("admin:modPanel.settings.transfer.modal.emptyDesc")}
        />
      ) : (
        <div
          role="radiogroup"
          aria-label={t("admin:modPanel.settings.transfer.modal.pickLabel")}
        >
          {candidates.map((member) => (
            <label className={styles.modRow} key={member.slug}>
              <input
                type="radio"
                name="transfer-owner"
                value={member.slug}
                checked={selected === member.slug}
                onChange={() => setSelected(member.slug ?? "")}
              />
              <Avatar
                initials={member.initials}
                tint={member.tint}
                src={photoOf(member, demoMode)}
                size={38}
                alt={member.name}
              />
              <div className={styles.modMain}>
                <div className={styles.modName}>{member.name}</div>
                {member.title && (
                  <div className={styles.modMeta}>{member.title}</div>
                )}
              </div>
            </label>
          ))}
        </div>
      )}
    </ConfirmDialog>
  );
}
