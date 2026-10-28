import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiRefreshCw } from "react-icons/fi";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeErrorToast } from "../../shared/api/errorMessage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useRefreshAllExpiredAdminInvites } from "./api/useAdminInvites";
import styles from "./AdminInvitesPage.module.css";

/** Same curve as the `--ease` token, for motion's JS-driven transitions. */
const EASE_CURVE = [0.22, 0.68, 0.16, 1] as const;

/** Moves focus to the Select toggle, or to the active tab while the list has
 *  no invites and the toggle is folded away. */
function focusAfterRefreshAll() {
  const focusTarget =
    document.querySelector<HTMLElement>("[data-invite-select-toggle]") ??
    document.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
  focusTarget?.focus();
}

/**
 * "Refresh all N expired" on the Expired tab: one confirm, and every expired
 * invite (from the filtered sender, when one is picked) works again for seven
 * days with its same code. `count` is the list's server total, which already
 * follows the sender filter.
 *
 * The button grows in and folds away with its width and opacity as the tab
 * and count change, at once under reduced motion. The confirm goes through
 * the shared `ConfirmDialog` in its default tone, since a refreshed link can
 * be revoked again.
 */
export function AdminInviteRefreshAllExpired({
  isShown,
  count,
  inviterSlug,
  inviterName,
  onRowLeavingChange,
}: {
  isShown: boolean;
  /** How many expired invites the refresh takes. */
  count: number;
  inviterSlug: string | null;
  /** The filtered sender's name, for the dialog, or null for every sender. */
  inviterName: string | null;
  /** Holds the grid up while refreshed cards play their exit. */
  onRowLeavingChange: (isLeaving: boolean) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { reducedMotion } = useMotionPrefs();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const refreshAll = useRefreshAllExpiredAdminInvites();
  const duration = reducedMotion ? 0 : 0.22;

  // Awaited, so the toast lands even if this unmounts while the lists
  // settle.
  const handleConfirm = async () => {
    // Every refreshed card leaves the Expired list this sits on.
    onRowLeavingChange(true);
    try {
      const { refreshedCount } = await refreshAll.mutateAsync({ inviterSlug });
      setIsConfirmOpen(false);
      if (refreshedCount === 0) {
        onRowLeavingChange(false);
        showToast(t("admin:adminInvites.refreshAll.noneLeftToast"), "info");
        return;
      }
      showToast(
        t("admin:adminInvites.refreshAll.doneToast", {
          count: refreshedCount,
        }),
        "success",
      );
      // This button folds away with the expired list it refreshed, so the
      // focus the dialog hands back to it would drop to <body>. One frame
      // later the dialog's own restore has run and focus moves on.
      requestAnimationFrame(focusAfterRefreshAll);
    } catch (error) {
      setIsConfirmOpen(false);
      onRowLeavingChange(false);
      showToast(
        describeErrorToast(
          t("admin:adminInvites.refreshAll.failedAction"),
          error,
        ),
        "error",
      );
    }
  };

  return (
    <>
      <AnimatePresence initial={false}>
        {isShown && (
          <m.span
            key="refresh-all"
            className={styles.filterBarAction}
            // Clipped only while it moves, so the button's focus ring is
            // never cut off at rest (the same idea as the shared Collapse).
            initial={{ width: 0, opacity: 0, overflow: "hidden" }}
            animate={{ width: "auto", opacity: 1, overflow: "visible" }}
            exit={{
              width: 0,
              opacity: 0,
              overflow: "hidden",
              transition: {
                duration,
                ease: EASE_CURVE,
                overflow: { duration: 0 },
              },
            }}
            transition={{
              duration,
              ease: EASE_CURVE,
              overflow: { duration: 0, delay: duration },
            }}
          >
            <span className={styles.filterBarActionInner}>
              <Button
                variant="ghost"
                size="sm"
                disabled={refreshAll.isPending}
                onClick={() => setIsConfirmOpen(true)}
              >
                <FiRefreshCw aria-hidden />{" "}
                {t("admin:adminInvites.refreshAll.cta", { count })}
              </Button>
            </span>
          </m.span>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => void handleConfirm()}
        tone="positive"
        loading={refreshAll.isPending}
        title={t("admin:adminInvites.refreshAll.confirmTitle", { count })}
        confirmLabel={t("admin:adminInvites.refreshAll.confirmCta", { count })}
        description={
          inviterName
            ? t("admin:adminInvites.refreshAll.confirmBodyForInviter", {
                count,
                name: inviterName,
              })
            : t("admin:adminInvites.refreshAll.confirmBody", { count })
        }
      />
    </>
  );
}
