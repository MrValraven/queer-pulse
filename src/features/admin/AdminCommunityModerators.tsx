import { useState } from "react";
import { FiX } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  useAddModerator,
  useModeratorCandidates,
  useRemoveModerator,
} from "./api/useAdminModerators";
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
 *  renders `community.moderators` directly rather than local state. */
function LiveModerators({ community }: { community: Community }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [pickerOpen, setPickerOpen] = useState(false);
  const removeModerator = useRemoveModerator(community.slug);

  function onRemove(moderator: Moderator) {
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
        <span key={moderator.memberId ?? moderator.name} className={styles.modChip}>
          {shortName(moderator.name)}
          {/* The founder cannot be demoted — no remove control for the owner. */}
          {!moderator.isOwner && (
            <button
              type="button"
              className={styles.modChipX}
              disabled={removeModerator.isPending}
              aria-label={t("admin:communities.settings.removeModAriaLabel", {
                name: moderator.name,
              })}
              onClick={() => onRemove(moderator)}
            >
              <FiX />
            </button>
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
    </div>
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
