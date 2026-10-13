import { useEffect, useRef, useState } from "react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Collapse, ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringGuestCommunity } from "./api/eventCommunities.api";
import {
  useLeaveCollab,
  useSyncAfterLeaveCollab,
  type LeaveCollabVariables,
} from "./api/useCollabInvite";
import { GatheringCommunityRow } from "./GatheringCommunityRow";

/** How long the row's `Collapse` takes to fold (its 0.28s), plus a frame.
 *  The confirm has closed well before then. */
const GUEST_ROW_FOLD_MS = 300;

/**
 * An accepted guest community in the sidebar card. Its own owners,
 * co-owners and mods (`viewerManages`) get "Remove our community", behind a
 * confirm. The row folds away only once the server has removed it, so the
 * confirm it hosts is never unmounted mid-request. On success the confirm
 * closes and the row folds; once the confirm has handed focus back, focus
 * goes to the card's heading (`onLeft`). Only once the fold is over does the
 * cached detail drop the guest, which unmounts the row and clears the hero
 * line.
 */
export function GatheringGuestCommunityRow({
  guest,
  eventSlug,
  onLeft,
}: {
  guest: GatheringGuestCommunity;
  /** The gathering's slug, so the cache sync touches only its detail. */
  eventSlug?: string;
  onLeft: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const leaveCollab = useLeaveCollab({ shouldSyncOnSuccess: false });
  const scheduleFollowThrough = useFollowThroughAfterLeave(onLeft);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [hasLeft, setHasLeft] = useState(false);

  const confirmLeave = () => {
    leaveCollab.mutate(
      { id: guest.id, eventSlug },
      {
        onSuccess: (_result, variables) => {
          scheduleFollowThrough(variables);
          setIsConfirmOpen(false);
          setHasLeft(true);
          showToast(
            t("gatherings:gathering.leaveCollabToast", { name: guest.name }),
            "success",
          );
        },
      },
    );
  };

  return (
    <>
      <Collapse isOpen={!hasLeft}>
        <GatheringCommunityRow
          community={guest}
          roleLabel={t("gatherings:gathering.guestCommunityRole")}
        >
          {guest.viewerManages && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsConfirmOpen(true)}
            >
              {t("gatherings:gathering.leaveCollabCta")}
            </Button>
          )}
        </GatheringCommunityRow>
      </Collapse>
      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmLeave}
        loading={leaveCollab.isPending}
        title={t("gatherings:gathering.leaveCollabTitle", { name: guest.name })}
        description={t("gatherings:gathering.leaveCollabBody")}
        confirmLabel={t("gatherings:gathering.leaveCollabCta")}
        cancelLabel={t("gatherings:gathering.leaveCollabKeepCta")}
        tone="destructive"
        initialFocus="cancel"
      />
    </>
  );
}

/**
 * What follows a removal, once the render that closed the confirm has
 * committed: `onLeft` moves focus to the card's heading after the confirm
 * has sent it back to its opener, then the cache sync runs once the row has
 * folded away, or at once under reduced motion, where `Collapse` does not
 * animate. A row unmounted before the fold ends (the member navigates away,
 * say) runs the sync as it goes, so the caches never keep a guest that has
 * left.
 */
function useFollowThroughAfterLeave(
  onLeft: () => void,
): (variables: LeaveCollabVariables) => void {
  const syncAfterLeave = useSyncAfterLeaveCollab();
  const { reducedMotion } = useMotionPrefs();
  const leftVariablesRef = useRef<LeaveCollabVariables | null>(null);
  const pendingSyncRef = useRef<{ timer: number; run: () => void } | null>(
    null,
  );

  // No dependency list: it checks after every commit, and acts only on the
  // one that follows a removal.
  useEffect(() => {
    const leftVariables = leftVariablesRef.current;
    if (!leftVariables) return;
    leftVariablesRef.current = null;
    onLeft();
    const run = () => syncAfterLeave(leftVariables);
    if (reducedMotion) {
      run();
      return;
    }
    const timer = window.setTimeout(() => {
      pendingSyncRef.current = null;
      run();
    }, GUEST_ROW_FOLD_MS);
    pendingSyncRef.current = { timer, run };
  });

  useEffect(
    () => () => {
      const pendingSync = pendingSyncRef.current;
      if (!pendingSync) return;
      pendingSyncRef.current = null;
      window.clearTimeout(pendingSync.timer);
      pendingSync.run();
    },
    [],
  );

  return (variables) => {
    leftVariablesRef.current = variables;
  };
}
