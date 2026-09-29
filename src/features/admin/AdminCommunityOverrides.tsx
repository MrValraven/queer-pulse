import { useState } from "react";
import {
  FiArchive,
  FiLock,
  FiRotateCcw,
  FiUnlock,
  FiUserCheck,
} from "react-icons/fi";
import { Button, ConfirmDialog, Eyebrow } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  useArchiveAdminCommunity,
  useFreezeAdminCommunity,
  useUnarchiveAdminCommunity,
  useUnfreezeAdminCommunity,
} from "./api/useAdminCommunityActions";
import { firstName, type Community } from "./adminCommunities.data";
import { AdminReassignOwnerModal } from "./AdminReassignOwnerModal";
import styles from "./AdminCommunitiesPage.module.css";

/**
 * The admin-only "moderation of last resort" actions on the Settings tab:
 * freeze/unfreeze, archive, and reassign ownership. Each bypasses the
 * community's own owner/mod authorization on purpose (see the backend's
 * `AdminCommunitiesController` doc) — for the case a community's own
 * leadership can't be reached or trusted, exactly the scenario this pane's
 * health-score/report-scope data already surfaces without giving the admin
 * anything to act on. Sits next to the (now-actionable) frozen status this
 * pane previously only displayed read-only.
 */
export function AdminOverridesZone({ community }: { community: Community }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const freeze = useFreezeAdminCommunity();
  const unfreeze = useUnfreezeAdminCommunity();
  const unarchive = useUnarchiveAdminCommunity();
  const freezePending = freeze.isPending || unfreeze.isPending;
  const communityFirstName = firstName(community.name);

  // Archiving is reversible (COM-18) — mirrors `toggleFreeze` below: a
  // direct, un-confirmed action, since undoing a take-down is the safe
  // direction. Archiving itself keeps its confirm dialog further down; it's
  // the one still worth pausing on.
  function unarchiveCommunity() {
    if (unarchive.isPending) return;
    unarchive.mutate(
      { slug: community.slug },
      {
        onSuccess: () =>
          showToast(
            t("admin:communities.settings.overrides.unarchiveToast", {
              name: communityFirstName,
            }),
            "success",
          ),
        onError: () =>
          showToast(
            t("admin:communities.settings.overrides.unarchiveFailedToast"),
            "error",
          ),
      },
    );
  }

  function toggleFreeze() {
    if (freezePending) return;
    if (community.frozen) {
      unfreeze.mutate(
        { slug: community.slug },
        {
          onSuccess: () =>
            showToast(
              t("admin:communities.settings.overrides.unfreezeToast", {
                name: communityFirstName,
              }),
              "success",
            ),
          onError: () =>
            showToast(
              t("admin:communities.settings.overrides.unfreezeFailedToast"),
              "error",
            ),
        },
      );
      return;
    }
    freeze.mutate(
      { slug: community.slug },
      {
        onSuccess: () =>
          showToast(
            t("admin:communities.settings.overrides.freezeToast", {
              name: communityFirstName,
            }),
            "success",
          ),
        onError: () =>
          showToast(
            t("admin:communities.settings.overrides.freezeFailedToast"),
            "error",
          ),
      },
    );
  }

  return (
    <div className={styles.setRow}>
      <div className={styles.setTop}>
        <div className={styles.setLabel}>
          {t("admin:communities.settings.overrides.title")}
        </div>
      </div>
      <p className={styles.setDetail}>
        {t("admin:communities.settings.overrides.sub")}
      </p>
      <div className={styles.overrideActions}>
        <Button
          variant="ghost"
          size="sm"
          disabled={freezePending}
          onClick={toggleFreeze}
        >
          {community.frozen ? <FiUnlock aria-hidden /> : <FiLock aria-hidden />}{" "}
          {t(
            community.frozen
              ? "admin:communities.settings.overrides.unfreezeCta"
              : "admin:communities.settings.overrides.freezeCta",
          )}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setReassignOpen(true)}>
          <FiUserCheck aria-hidden />{" "}
          {t("admin:communities.settings.overrides.reassignCta")}
        </Button>
        {community.archived ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={unarchive.isPending}
            onClick={unarchiveCommunity}
          >
            <FiRotateCcw aria-hidden />{" "}
            {t("admin:communities.settings.overrides.unarchiveCta")}
          </Button>
        ) : (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setArchiveOpen(true)}
          >
            <FiArchive aria-hidden />{" "}
            {t("admin:communities.settings.overrides.archiveCta")}
          </Button>
        )}
      </div>

      {archiveOpen && (
        <ArchiveCommunityConfirmModal
          community={community}
          onClose={() => setArchiveOpen(false)}
        />
      )}
      {reassignOpen && (
        <AdminReassignOwnerModal
          community={community}
          onClose={() => setReassignOpen(false)}
        />
      )}
    </div>
  );
}

/** Confirms the one-way archive before it fires — mirrors
 *  `ModPanelDangerModals.tsx`'s `ArchiveConfirmModal` (the member-facing
 *  equivalent), rebuilt on this admin-only mutation. */
function ArchiveCommunityConfirmModal({
  community,
  onClose,
}: {
  community: Community;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const archiveCommunity = useArchiveAdminCommunity();
  const communityFirstName = firstName(community.name);

  const confirm = () => {
    if (archiveCommunity.isPending) return;
    archiveCommunity.mutate(
      { slug: community.slug },
      {
        onSuccess: () => {
          showToast(
            t("admin:communities.settings.overrides.archiveToast", {
              name: communityFirstName,
            }),
            "success",
          );
          onClose();
        },
        onError: () =>
          showToast(
            t("admin:communities.settings.overrides.archiveFailedToast", {
              name: communityFirstName,
            }),
            "error",
          ),
      },
    );
  };

  return (
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={confirm}
      title={t("admin:communities.settings.overrides.archiveConfirmTitle", {
        name: community.name,
      })}
      tone="destructive"
      loading={archiveCommunity.isPending}
      confirmLabel={t("admin:communities.settings.overrides.archiveConfirmCta")}
      cancelLabel={t("admin:modPanel.settings.cancel")}
    >
      <Eyebrow>{t("admin:modPanel.settings.irreversible")}</Eyebrow>
      <p>{t("admin:communities.settings.overrides.archiveConfirmBody")}</p>
    </ConfirmDialog>
  );
}
