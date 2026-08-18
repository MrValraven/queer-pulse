import { useState } from "react";
import { FiArchive, FiLock, FiUnlock, FiUserCheck } from "react-icons/fi";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  Eyebrow,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useModeratorCandidates } from "./api/useAdminModerators";
import {
  useArchiveAdminCommunity,
  useFreezeAdminCommunity,
  useReassignAdminCommunityOwner,
  useUnfreezeAdminCommunity,
} from "./api/useAdminCommunityActions";
import { firstName, type Community } from "./adminCommunities.data";
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
  const freezePending = freeze.isPending || unfreeze.isPending;

  function toggleFreeze() {
    if (freezePending) return;
    const communityFirstName = firstName(community.name);
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
          {community.frozen ? (
            <FiUnlock aria-hidden />
          ) : (
            <FiLock aria-hidden />
          )}{" "}
          {t(
            community.frozen
              ? "admin:communities.settings.overrides.unfreezeCta"
              : "admin:communities.settings.overrides.freezeCta",
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setReassignOpen(true)}
        >
          <FiUserCheck aria-hidden />{" "}
          {t("admin:communities.settings.overrides.reassignCta")}
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setArchiveOpen(true)}
        >
          <FiArchive aria-hidden />{" "}
          {t("admin:communities.settings.overrides.archiveCta")}
        </Button>
      </div>

      {archiveOpen && (
        <ArchiveCommunityConfirmModal
          community={community}
          onClose={() => setArchiveOpen(false)}
        />
      )}
      {reassignOpen && (
        <ReassignOwnerModal
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
      confirmLabel={t(
        "admin:communities.settings.overrides.archiveConfirmCta",
      )}
      cancelLabel={t("admin:modPanel.settings.cancel")}
    >
      <Eyebrow>{t("admin:modPanel.settings.irreversible")}</Eyebrow>
      <p>{t("admin:communities.settings.overrides.archiveConfirmBody")}</p>
    </ConfirmDialog>
  );
}

/** One roster member the reassign-owner picker can target — the union of the
 *  community's current moderators (minus the owner) and its promotable plain
 *  members, reusing `useModeratorCandidates` (the same roster-fetching
 *  `AdminCommunityModerators.tsx` already does for the add-moderator picker)
 *  rather than adding a new roster query. */
interface OwnerCandidate {
  slug: string;
  name: string;
  isModerator: boolean;
}

/** Picks a roster member to hand ownership to, then reassigns it — mirrors
 *  `ModPanelDangerModals.tsx`'s `TransferOwnershipModal` shape (a radiogroup
 *  inside a `ConfirmDialog`), rebuilt on this admin-only mutation, which —
 *  unlike the member-facing transfer — works even when the community
 *  currently has no owner at all. */
function ReassignOwnerModal({
  community,
  onClose,
}: {
  community: Community;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const [selectedSlug, setSelectedSlug] = useState("");
  // Live-only endpoint (mirrors `AdminCommunityModerators.tsx`'s own
  // add-moderator picker) — demo mode never fetches it, so the picker falls
  // back to the community's own moderators alone.
  const { data: candidates } = useModeratorCandidates(
    community.slug,
    !demoMode,
  );
  const reassignOwner = useReassignAdminCommunityOwner();

  const options: OwnerCandidate[] = [
    ...community.moderators
      .filter((moderator) => !moderator.isOwner && moderator.slug)
      .map((moderator) => ({
        slug: moderator.slug!,
        name: moderator.name,
        isModerator: true,
      })),
    ...(candidates ?? []).map((candidate) => ({
      slug: candidate.slug,
      name: candidate.name,
      isModerator: false,
    })),
  ];

  const confirm = () => {
    if (!selectedSlug || reassignOwner.isPending) return;
    const target = options.find((option) => option.slug === selectedSlug);
    reassignOwner.mutate(
      { slug: community.slug, memberSlug: selectedSlug },
      {
        onSuccess: () => {
          showToast(
            t("admin:communities.settings.overrides.reassignToast", {
              name: target?.name ?? selectedSlug,
            }),
            "success",
          );
          onClose();
        },
        onError: () =>
          showToast(
            t("admin:communities.settings.overrides.reassignFailedToast"),
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
      title={t("admin:communities.settings.overrides.reassignTitle", {
        name: community.name,
      })}
      description={t("admin:communities.settings.overrides.reassignBody")}
      tone="destructive"
      loading={reassignOwner.isPending}
      confirmLabel={t(
        "admin:communities.settings.overrides.reassignConfirmCta",
      )}
      cancelLabel={t("admin:modPanel.settings.cancel")}
    >
      <Eyebrow>{t("admin:modPanel.settings.irreversible")}</Eyebrow>
      {options.length === 0 ? (
        <EmptyState
          compact
          title={t("admin:communities.settings.overrides.reassignEmptyTitle")}
          description={t(
            "admin:communities.settings.overrides.reassignEmptyDesc",
          )}
        />
      ) : (
        <div
          role="radiogroup"
          aria-label={t(
            "admin:communities.settings.overrides.reassignPickLabel",
          )}
          className={styles.ownerPickList}
        >
          {options.map((option) => (
            <label className={styles.ownerPickRow} key={option.slug}>
              <input
                type="radio"
                name="admin-reassign-owner"
                value={option.slug}
                checked={selectedSlug === option.slug}
                onChange={() => setSelectedSlug(option.slug)}
              />
              <div className={styles.ownerPickMain}>
                <div className={styles.ownerPickName}>{option.name}</div>
                {option.isModerator && (
                  <div className={styles.ownerPickMeta}>
                    {t("admin:communities.members.moderatorChip")}
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      )}
    </ConfirmDialog>
  );
}
