import { useState } from "react";
import { FiUserX, FiX } from "react-icons/fi";
import { ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  useAddModerator,
  useModeratorCandidates,
  useRemoveModerator,
} from "./api/useAdminModerators";
import { useRemoveAdminCommunityMember } from "./api/useAdminCommunityActions";
import {
  shortName,
  type Community,
  type Moderator,
} from "./adminCommunities.data";
import styles from "./AdminCommunitiesPage.module.css";

/**
 * The Moderators row of a community's admin settings pane.
 *
 * Dual-mode: demo keeps the simulated local-state prototype (an Undo-able
 * removal, an informational "search members" add); live wires both controls to
 * the real `/admin/communities/:slug/moderators` endpoints and re-reads the
 * roster off the invalidated `["admin-communities"]` query — so the founder is
 * never removable and every change is real, not a fake toast.
 */
export function ModeratorsRow({ community }: { community: Community }) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  return (
    <div className={styles.setRow}>
      <div className={styles.setLabel}>
        {t("admin:communities.settings.moderators")}
      </div>
      {demoMode ? (
        <DemoModerators community={community} />
      ) : (
        <LiveModerators community={community} />
      )}
    </div>
  );
}

/** Demo: the original functional prototype — local state, Undo-able removal,
 *  and an informational add (there is no real roster to pick from in demo). */
function DemoModerators({ community }: { community: Community }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [moderators, setModerators] = useState<Moderator[]>(
    community.moderators,
  );

  function removeMod(moderator: Moderator) {
    setModerators((prev) => prev.filter((m) => m.name !== moderator.name));
    showToast(
      t("admin:communities.settings.modRemovedToast", { name: moderator.name }),
      "success",
      undefined,
      {
        label: t("admin:common.undo"),
        onClick: () =>
          setModerators((prev) =>
            prev.some((m) => m.name === moderator.name)
              ? prev
              : [...prev, moderator],
          ),
      },
    );
  }

  return (
    <div className={styles.modChips}>
      {moderators.map((moderator) => (
        <span key={moderator.name} className={styles.modChip}>
          {shortName(moderator.name)}
          <button
            type="button"
            className={styles.modChipX}
            aria-label={t("admin:communities.settings.removeModAriaLabel", {
              name: moderator.name,
            })}
            onClick={() => removeMod(moderator)}
          >
            <FiX />
          </button>
        </span>
      ))}
      <button
        type="button"
        className={styles.addBtn}
        onClick={() =>
          showToast(t("admin:communities.settings.addModToast"), "info")
        }
      >
        {t("admin:communities.settings.addModCta")}
      </button>
    </div>
  );
}

/** Live: the roster comes from the (invalidated-on-change) detail query, so it
 *  renders `community.moderators` directly rather than local state. Each chip
 *  now carries two admin controls: demote back to a plain member (existing),
 *  and remove from the community outright (admin-override, new — see
 *  `RemoveMemberConfirmModal`). */
function LiveModerators({ community }: { community: Community }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Moderator | null>(null);
  const removeModerator = useRemoveModerator(community.slug);

  function onDemote(moderator: Moderator) {
    if (!moderator.memberId) return;
    removeModerator.mutate(
      { memberId: moderator.memberId },
      {
        onSuccess: () =>
          showToast(
            t("admin:communities.settings.modRemovedToast", {
              name: moderator.name,
            }),
            "success",
          ),
        onError: () =>
          showToast(
            t("admin:communities.settings.mod.removeFailedToast", {
              name: moderator.name,
            }),
            "error",
          ),
      },
    );
  }

  return (
    <div className={styles.modChips}>
      {community.moderators.map((moderator) => (
        <span
          key={moderator.memberId ?? moderator.name}
          className={styles.modChip}
        >
          {shortName(moderator.name)}
          {/* The founder is immovable here either way — no demote or remove
              control for the owner (mirrors the backend's own 400 on both). */}
          {!moderator.isOwner && (
            <>
              <button
                type="button"
                className={styles.modChipX}
                disabled={removeModerator.isPending}
                aria-label={t("admin:communities.settings.removeModAriaLabel", {
                  name: moderator.name,
                })}
                onClick={() => onDemote(moderator)}
              >
                <FiX />
              </button>
              {moderator.slug && (
                <button
                  type="button"
                  className={styles.modChipX}
                  aria-label={t(
                    "admin:communities.settings.mod.removeFromCommunityAriaLabel",
                    { name: moderator.name },
                  )}
                  onClick={() => setRemoveTarget(moderator)}
                >
                  <FiUserX />
                </button>
              )}
            </>
          )}
        </span>
      ))}
      <button
        type="button"
        className={styles.addBtn}
        aria-expanded={pickerOpen}
        onClick={() => setPickerOpen((open) => !open)}
      >
        {t("admin:communities.settings.addModCta")}
      </button>
      {pickerOpen && (
        <ModeratorPicker
          community={community}
          onClose={() => setPickerOpen(false)}
        />
      )}
      {removeTarget && (
        <RemoveMemberConfirmModal
          community={community}
          moderator={removeTarget}
          onClose={() => setRemoveTarget(null)}
        />
      )}
    </div>
  );
}

/**
 * Confirms removing a roster member from the community outright — the
 * admin-override `DELETE /admin/communities/:slug/members/:memberSlug`, not
 * the demote-to-member action above. Rejects the current owner client-side
 * too (`moderator.isOwner`), matching the backend's own 400 for that case, so
 * the error path is a clear message rather than a raw failed-request toast —
 * belt-and-braces on top of the trigger button already being hidden for the
 * owner in `LiveModerators`.
 */
function RemoveMemberConfirmModal({
  community,
  moderator,
  onClose,
}: {
  community: Community;
  moderator: Moderator;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const removeMember = useRemoveAdminCommunityMember();

  const confirm = () => {
    if (!moderator.slug || removeMember.isPending) return;
    // Defensive, on top of the trigger button already being hidden for the
    // owner in `LiveModerators` — a clear client-side rejection here, rather
    // than a raw failed-request toast, matches the backend's own 400.
    if (moderator.isOwner) {
      showToast(
        t("admin:communities.settings.mod.removeFromCommunityOwnerError"),
        "error",
      );
      onClose();
      return;
    }
    removeMember.mutate(
      { slug: community.slug, memberSlug: moderator.slug },
      {
        onSuccess: () => {
          showToast(
            t("admin:communities.settings.mod.removedFromCommunityToast", {
              name: moderator.name,
            }),
            "success",
          );
          onClose();
        },
        onError: () =>
          showToast(
            t("admin:communities.settings.mod.removeFromCommunityFailedToast", {
              name: moderator.name,
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
      title={t(
        "admin:communities.settings.mod.removeFromCommunityConfirmTitle",
        { name: moderator.name },
      )}
      tone="destructive"
      loading={removeMember.isPending}
      confirmLabel={t("admin:communities.settings.mod.removeFromCommunityCta")}
      cancelLabel={t("admin:modPanel.settings.cancel")}
    >
      <p>
        {t("admin:communities.settings.mod.removeFromCommunityConfirmBody", {
          name: moderator.name,
        })}
      </p>
    </ConfirmDialog>
  );
}

/** The add-moderator picker: the community's promotable plain members, fetched
 *  only while open. Picking one promotes them and closes the picker. */
function ModeratorPicker({
  community,
  onClose,
}: {
  community: Community;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const {
    data: candidates,
    isLoading,
    isError,
  } = useModeratorCandidates(community.slug, true);
  const addModerator = useAddModerator(community.slug);

  function onPick(userId: string, name: string) {
    addModerator.mutate(
      { memberId: userId },
      {
        onSuccess: () => {
          showToast(
            t("admin:communities.settings.mod.addedToast", { name }),
            "success",
          );
          onClose();
        },
        onError: () =>
          showToast(
            t("admin:communities.settings.mod.addFailedToast", { name }),
            "error",
          ),
      },
    );
  }

  return (
    <div
      className={styles.modPicker}
      role="group"
      aria-label={t("admin:communities.settings.mod.addPickerTitle")}
    >
      {isLoading && (
        <p className={styles.modPickerNote}>
          {t("admin:communities.settings.mod.pickerLoading")}
        </p>
      )}
      {isError && (
        <p className={styles.modPickerNote}>
          {t("admin:communities.settings.mod.pickerError")}
        </p>
      )}
      {candidates && candidates.length === 0 && (
        <p className={styles.modPickerNote}>
          {t("admin:communities.settings.mod.pickerEmpty")}
        </p>
      )}
      {candidates?.map((candidate) => (
        <button
          key={candidate.userId}
          type="button"
          className={styles.modPickerItem}
          disabled={addModerator.isPending}
          onClick={() => onPick(candidate.userId, candidate.name)}
        >
          {candidate.name}
        </button>
      ))}
      <button type="button" className={styles.addBtn} onClick={onClose}>
        {t("admin:communities.settings.mod.cancelCta")}
      </button>
    </div>
  );
}
