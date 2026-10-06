import type { Ref } from "react";
import { FiStar } from "react-icons/fi";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./GatheringLineupViewerPanel.module.css";

/** What the viewer sees of their own lineup row. A declined row shows
 *  nothing, like no row at all. */
export type LineupViewerState = "pending" | "accepted" | "none";

/** The viewer's lineup state and actions, from `GatheringLineup`'s hook. */
export interface LineupViewer {
  viewerState: LineupViewerState;
  roleLabel: string | undefined;
  isAnswering: boolean;
  answer: (outcome: "accepted" | "declined") => void;
  isLeaveConfirmOpen: boolean;
  openLeaveConfirm: () => void;
  closeLeaveConfirm: () => void;
  leave: () => void;
}

/**
 * Sits above the Lineup section and always renders: the focus anchor that
 * holds the open-invite banner (Join or Decline), plus the Leave
 * confirmation. The dialog is hosted here, outside the on-lineup line, and
 * closes before the request, so the optimistic removal cannot unmount it
 * mid-flight. Empty when the viewer has no open invite.
 */
export function GatheringLineupViewerPanel({
  ref,
  viewer,
}: {
  ref: Ref<HTMLDivElement>;
  viewer: LineupViewer;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div ref={ref} tabIndex={-1} className={styles.anchor}>
        {viewer.viewerState === "pending" && (
          <section className={styles.banner}>
            <FiStar className={styles.icon} aria-hidden />
            <p className={styles.text}>
              {t("gatherings:lineupInvite.bannerText", {
                role: viewer.roleLabel,
              })}
            </p>
            <div className={styles.actions}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => viewer.answer("declined")}
                disabled={viewer.isAnswering}
              >
                {t("gatherings:lineupInvite.declineCta")}
              </Button>
              {/* Tonal: the page's RSVP button is the coral primary a few
                  lines above, so two solid coral buttons would compete. */}
              <Button
                variant="soft"
                size="sm"
                onClick={() => viewer.answer("accepted")}
                disabled={viewer.isAnswering}
              >
                {t("gatherings:lineupInvite.acceptCta")}
              </Button>
            </div>
          </section>
        )}
      </div>
      {viewer.isLeaveConfirmOpen && (
        <ConfirmDialog
          open
          onClose={viewer.closeLeaveConfirm}
          onConfirm={viewer.leave}
          title={t("gatherings:lineupInvite.leaveConfirmTitle")}
          description={t("gatherings:lineupInvite.leaveConfirmBody")}
          confirmLabel={t("gatherings:lineupInvite.leaveCta")}
          tone="destructive"
        />
      )}
    </>
  );
}

/** "You're on the lineup" with a quiet Leave, rendered inside the Lineup
 *  section under the list. Its wrapper takes focus after Join. */
export function GatheringLineupViewerLine({
  ref,
  viewer,
}: {
  ref: Ref<HTMLDivElement>;
  viewer: LineupViewer;
}) {
  const { t } = useTranslation();
  if (viewer.viewerState !== "accepted") return null;
  return (
    <div ref={ref} tabIndex={-1} className={styles.line}>
      <p className={styles.text}>
        {t("gatherings:lineupInvite.onLineupText", { role: viewer.roleLabel })}
      </p>
      <button
        type="button"
        className={styles.leaveLink}
        onClick={viewer.openLeaveConfirm}
      >
        {t("gatherings:lineupInvite.leaveCta")}
      </button>
    </div>
  );
}
