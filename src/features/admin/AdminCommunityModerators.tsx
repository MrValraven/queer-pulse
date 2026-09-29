import { useId, useRef, useState, type RefObject } from "react";
import { FiUserX, FiX } from "react-icons/fi";
import { ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useRemoveModerator } from "./api/useAdminModerators";
import { useRemoveAdminCommunityMember } from "./api/useAdminCommunityActions";
import {
  shortName,
  type Community,
  type Moderator,
} from "./adminCommunities.data";
import { AdminCommunityModeratorPicker } from "./AdminCommunityModeratorPicker";
import styles from "./AdminCommunitiesPage.module.css";

/**
 * The Moderators row of a community's admin settings pane.
 *
 * Dual-mode: demo keeps the simulated local-state prototype (an Undo-able
 * removal, and a picker over the fixture roster that adds a local chip); live
 * wires both controls to the real `/admin/communities/:slug/moderators`
 * endpoints and re-reads the roster off the invalidated `["admin-communities"]`
 * query, so the founder stays unremovable and every change reaches the server.
 */
export function ModeratorsRow({ community }: { community: Community }) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  // Focus target for `LiveModerators`' post-removal refocus (S11): the trigger
  // a removal confirm would otherwise restore focus to is the very chip the
  // roster refetch deletes.
  const headingRef = useRef<HTMLDivElement>(null);
  return (
    <div className={styles.setRow}>
      <div className={styles.setLabel} tabIndex={-1} ref={headingRef}>
        {t("admin:communities.settings.moderators")}
      </div>
      {demoMode ? (
        <DemoModerators community={community} />
      ) : (
        <LiveModerators community={community} headingRef={headingRef} />
      )}
    </div>
  );
}

/** Demo: the original functional prototype. Local state, Undo-able removal,
 *  and a picker over the fixture roster that adds to the local chips. */
function DemoModerators({ community }: { community: Community }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [moderators, setModerators] = useState<Moderator[]>(
    community.moderators,
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);

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
        ref={addButtonRef}
        type="button"
        className={styles.addBtn}
        aria-expanded={isPickerOpen}
        onClick={() => setIsPickerOpen((isOpen) => !isOpen)}
      >
        {t("admin:communities.settings.addModCta")}
      </button>
      {isPickerOpen && (
        <AdminCommunityModeratorPicker
          communitySlug={community.slug}
          moderators={moderators}
          onClose={() => setIsPickerOpen(false)}
          returnFocusRef={addButtonRef}
          onDemoPromote={(candidate) =>
            setModerators((prev) => [
              ...prev,
              {
                initials: candidate.initials,
                name: candidate.name,
                pronouns: "",
                tone: "plum",
                role: "",
              },
            ])
          }
        />
      )}
    </div>
  );
}

/** Live: the roster comes from the (invalidated-on-change) detail query, so it
 *  renders `community.moderators` directly rather than local state. Each chip
 *  now carries two admin controls: demote back to a plain member (existing),
 *  and remove from the community outright (admin-override, new — see
 *  `RemoveMemberConfirmModal`). */
function LiveModerators({
  community,
  headingRef,
}: {
  community: Community;
  headingRef: RefObject<HTMLDivElement | null>;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [pickerOpen, setPickerOpen] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const [removeTarget, setRemoveTarget] = useState<Moderator | null>(null);
  const removeModerator = useRemoveModerator(community.slug);

  // A successful removal closes `RemoveMemberConfirmModal`, whose own
  // unmount restores focus to the row's FiUserX trigger, the very chip the
  // roster refetch is about to delete, stranding focus on <body> once it
  // goes. Deferred one frame so it runs after that restore (and after the
  // roster re-render): the moderators heading gets focus instead (S11).
  function onMemberRemoved() {
    requestAnimationFrame(() => headingRef.current?.focus());
  }

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
        ref={addButtonRef}
        type="button"
        className={styles.addBtn}
        aria-expanded={pickerOpen}
        onClick={() => setPickerOpen((open) => !open)}
      >
        {t("admin:communities.settings.addModCta")}
      </button>
      {pickerOpen && (
        <AdminCommunityModeratorPicker
          communitySlug={community.slug}
          moderators={community.moderators}
          onClose={() => setPickerOpen(false)}
          returnFocusRef={addButtonRef}
        />
      )}
      {removeTarget && (
        <RemoveMemberConfirmModal
          community={community}
          moderator={removeTarget}
          onClose={() => setRemoveTarget(null)}
          onRemoved={onMemberRemoved}
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
  onRemoved,
}: {
  community: Community;
  moderator: Moderator;
  onClose: () => void;
  /** Fires after a successful removal, once the toast is queued and the
   *  dialog is told to close (S11's post-removal refocus lives in the
   *  caller, which owns the moderators section heading). */
  onRemoved: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const removeMember = useRemoveAdminCommunityMember();
  const [shouldBarReturn, setShouldBarReturn] = useState(false);
  const barHintId = useId();

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
      { slug: community.slug, memberSlug: moderator.slug, shouldBarReturn },
      {
        onSuccess: () => {
          showToast(
            t("admin:communities.settings.mod.removedFromCommunityToast", {
              name: moderator.name,
            }),
            "success",
          );
          onClose();
          onRemoved();
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
      initialFocus="cancel"
      confirmLabel={t(
        shouldBarReturn
          ? "admin:communities.settings.mod.removeFromCommunityAndBarCta"
          : "admin:communities.settings.mod.removeFromCommunityCta",
      )}
      cancelLabel={t("admin:modPanel.settings.cancel")}
    >
      <p>
        {t(
          shouldBarReturn
            ? "admin:communities.settings.mod.removeFromCommunityConfirmBodyBarred"
            : "admin:communities.settings.mod.removeFromCommunityConfirmBody",
          { name: moderator.name },
        )}
      </p>
      <label className={styles.removeBarCheck}>
        <input
          type="checkbox"
          checked={shouldBarReturn}
          aria-describedby={barHintId}
          onChange={(event) => setShouldBarReturn(event.target.checked)}
        />
        <span className={styles.removeBarCheckText}>
          {t("admin:communities.settings.mod.removeFromCommunityBarLabel")}
        </span>
      </label>
      <p id={barHintId} className={styles.removeBarCheckHint}>
        {t("admin:communities.settings.mod.removeFromCommunityBarHint")}
      </p>
    </ConfirmDialog>
  );
}
