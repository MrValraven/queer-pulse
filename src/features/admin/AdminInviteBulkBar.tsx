import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiRefreshCw, FiSlash } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import {
  ADMIN_INVITE_BULK_CAP,
  type AdminInviteBulkAction,
} from "./api/adminInvites.api";
import {
  isInviteInFilter,
  useBulkAdminInviteAction,
  type AdminInviteFilter,
} from "./api/useAdminInvites";
import {
  BULK_ACTION_SOURCE_STATUS,
  BULK_ACTION_TARGET_STATUS,
  skippedInvitesSummary,
} from "./adminInviteBulkCopy";
import {
  AdminInviteBulkConfirm,
  type AdminInviteBulkConfirmRequest,
} from "./AdminInviteBulkConfirm";
import type { AdminInviteSelection } from "./useAdminInviteSelection";
import styles from "./AdminInvitesPage.module.css";

/** The bar's rendered height, published on the root element so the page can
 *  reserve that much room below the invite grid (`.rowsWithBulkBar`). */
const BULK_BAR_HEIGHT_PROPERTY = "--invite-bulk-bar-h";

/** Same curve as the `--ease` token, for motion's JS-driven transitions. */
const EASE_CURVE = [0.22, 0.68, 0.16, 1] as const;

/** Where focus goes once the bar leaves: the page's Select/Done toggle, or
 *  the open tab when the toggle is not on screen. */
const SELECT_TOGGLE_SELECTOR = "[data-invite-select-toggle]";
const ACTIVE_TAB_SELECTOR = '[role="tab"][aria-selected="true"]';

/** True when the bar's items no longer share one row: some item starts
 *  below where another ends. Reads the bar's children and grandchildren, so
 *  a summary that wraps inside itself counts too. */
function isBarWrapped(barElement: HTMLElement): boolean {
  const items = barElement.querySelectorAll<HTMLElement>(
    ":scope > *, :scope > * > *",
  );
  let lowestTop = Number.NEGATIVE_INFINITY;
  let highestBottom = Number.POSITIVE_INFINITY;
  for (const item of Array.from(items)) {
    const itemRect = item.getBoundingClientRect();
    if (itemRect.height === 0) continue;
    lowestTop = Math.max(lowestTop, itemRect.top);
    highestBottom = Math.min(highestBottom, itemRect.bottom);
  }
  return lowestTop >= highestBottom;
}

/** Once the selection empties, the bar unmounts with focus inside it. On the
 *  next frame (after a closing confirm dialog has handed focus back to the
 *  bar), focus moves to the Select/Done toggle, or the open tab. It stays put
 *  when the admin has already moved it somewhere else. */
function moveFocusOutOfBar(barRef: RefObject<HTMLDivElement | null>) {
  requestAnimationFrame(() => {
    const activeElement = document.activeElement;
    const isFocusLost =
      !activeElement ||
      activeElement === document.body ||
      Boolean(barRef.current?.contains(activeElement));
    if (!isFocusLost) return;
    // The toggle is hidden once the list has emptied, so a focus that does
    // not land on it falls through to the open tab.
    const selectToggle = document.querySelector<HTMLElement>(
      SELECT_TOGGLE_SELECTOR,
    );
    selectToggle?.focus();
    if (selectToggle && document.activeElement === selectToggle) return;
    document.querySelector<HTMLElement>(ACTIVE_TAB_SELECTOR)?.focus();
  });
}

/** Keeps `--invite-bulk-bar-h` in step with the bar's height (one pill row
 *  when everything fits, a card of two or more lines when it does not, taller
 *  with the cap note), and removes it once the bar has gone. Mirrors
 *  `BulkActionBar`'s. It also marks the bar `data-wrapped` while its items
 *  run over more than one line, so the pill turns into a rounded card at any
 *  width and in any language. */
function usePublishedBarHeight(barRef: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const barElement = barRef.current;
    if (!barElement || typeof ResizeObserver === "undefined") return;
    const rootStyle = document.documentElement.style;
    const publishHeight = () => {
      // Measured with the mark off: the wrapped layout stretches the actions
      // to a full line, so measuring it as it is would keep the bar wrapped
      // after its content fits one row again.
      barElement.removeAttribute("data-wrapped");
      barElement.toggleAttribute("data-wrapped", isBarWrapped(barElement));
      rootStyle.setProperty(
        BULK_BAR_HEIGHT_PROPERTY,
        `${Math.ceil(barElement.offsetHeight)}px`,
      );
    };
    publishHeight();
    const resizeObserver = new ResizeObserver(publishHeight);
    resizeObserver.observe(barElement);
    return () => {
      resizeObserver.disconnect();
      rootStyle.removeProperty(BULK_BAR_HEIGHT_PROPERTY);
    };
  }, [barRef]);
}

/**
 * Floating action bar for the invite page's select mode, mounted by the page
 * inside an `AnimatePresence` while at least one invite is selected, so it
 * rises in and sinks away. It mirrors the listings queue's `BulkActionBar`:
 * the count, the cap note, Select all and Clear, then the two actions.
 *
 * Each action names its verb and how many selected invites it applies to,
 * and sends only those: refresh takes the expired ones, revoke the pending
 * ones. Both confirm first through `AdminInviteBulkConfirm`. The result names
 * how many changed and, reason by reason, how many were left as they were.
 */
export function AdminInviteBulkBar({
  selection,
  filter,
  onRowLeavingChange,
}: {
  selection: AdminInviteSelection;
  /** The open tab, to tell whether acted-on cards will leave it. */
  filter: AdminInviteFilter;
  /** Holds the grid up while acted-on cards play their exit. */
  onRowLeavingChange: (isLeaving: boolean) => void;
}) {
  const { t, language } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { reducedMotion } = useMotionPrefs();
  const bulkAction = useBulkAdminInviteAction();
  const [confirmRequest, setConfirmRequest] =
    useState<AdminInviteBulkConfirmRequest | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  usePublishedBarHeight(barRef);

  const { selectedInvites, isAtCap, isEveryLoadedSelected } = selection;
  const count = selectedInvites.length;
  const eligibleFor = (action: AdminInviteBulkAction) =>
    selectedInvites.filter(
      (invite) => invite.status === BULK_ACTION_SOURCE_STATUS[action],
    );
  const expiredCount = eligibleFor("refresh").length;
  const pendingCount = eligibleFor("revoke").length;

  const openConfirm = (action: AdminInviteBulkAction) => {
    const eligibleCount = eligibleFor(action).length;
    setConfirmRequest({
      action,
      eligibleCount,
      ineligibleCount: count - eligibleCount,
    });
    setIsConfirmOpen(true);
  };

  const handleSelectAll = () => {
    if (selection.selectAllLoaded()) {
      showToast(
        t("admin:adminInvites.select.capToast", { cap: ADMIN_INVITE_BULK_CAP }),
        "info",
      );
    }
  };

  const handleClear = () => {
    selection.clearSelection();
    moveFocusOutOfBar(barRef);
  };

  // Awaited, so the toasts land even when the acted-on cards leaving the
  // list have emptied the selection and the bar is already on its way out.
  const runAction = async (action: AdminInviteBulkAction) => {
    const invites = eligibleFor(action);
    const actionLabel = t(`admin:adminInvites.bulk.${action}FailedAction`);
    onRowLeavingChange(
      !isInviteInFilter(filter, BULK_ACTION_TARGET_STATUS[action]),
    );
    try {
      const result = await bulkAction.mutateAsync({ action, invites });
      setIsConfirmOpen(false);
      const updatedCount = result.updated.length;
      if (updatedCount === 0) onRowLeavingChange(false);
      else {
        showToast(
          t(`admin:adminInvites.bulk.${action}DoneToast`, {
            count: updatedCount,
          }),
          "success",
        );
      }
      const skippedSummary = skippedInvitesSummary(t, language, result.skipped);
      if (skippedSummary) {
        showToast(skippedSummary, updatedCount === 0 ? "warning" : "info");
      }
      selection.clearSelection();
      moveFocusOutOfBar(barRef);
    } catch (error) {
      setIsConfirmOpen(false);
      onRowLeavingChange(false);
      showToast(describeError(actionLabel, error), "error");
    }
  };

  return (
    <>
      <m.div
        ref={barRef}
        className={styles.bulkBar}
        role="region"
        aria-label={t("admin:adminInvites.bulk.ariaLabel")}
        style={{ x: "-50%" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: reducedMotion ? 0 : 0.2, ease: EASE_CURVE }}
      >
        <div className={styles.bulkSummary}>
          {/* `role="status"` so a screen reader hears the bar arrive and the
              count change; the bar never takes focus on its own. */}
          <span className={styles.bulkCount} role="status">
            <Translation
              i18nKey="admin:adminInvites.bulk.selectedCount"
              values={{ count }}
              slots={{
                count: (
                  <RollingNumber
                    value={fmt.number(count)}
                    numericValue={count}
                  />
                ),
              }}
            />
          </span>
          <div className={styles.bulkSummaryButtons}>
            <Button
              variant="ghost-dark"
              size="sm"
              onClick={handleSelectAll}
              disabled={
                bulkAction.isPending || isEveryLoadedSelected || isAtCap
              }
            >
              {t("admin:adminInvites.select.selectAllCta")}
            </Button>
            <Button
              variant="ghost-dark"
              size="sm"
              onClick={handleClear}
              disabled={bulkAction.isPending}
            >
              {t("admin:adminInvites.select.clearCta")}
            </Button>
          </div>
        </div>
        {/* A child of the bar, so it can take a full line of its own. */}
        {isAtCap && (
          <span className={styles.bulkCapNote}>
            {t("admin:adminInvites.bulk.capNote", {
              cap: ADMIN_INVITE_BULK_CAP,
            })}
          </span>
        )}
        <div className={styles.bulkActions}>
          <Button
            variant="jade"
            onClick={() => openConfirm("refresh")}
            disabled={bulkAction.isPending || expiredCount === 0}
          >
            <FiRefreshCw aria-hidden />{" "}
            {expiredCount === 0
              ? t("admin:adminInvites.bulk.refreshCtaNone")
              : t("admin:adminInvites.bulk.refreshCta", {
                  count: expiredCount,
                })}
          </Button>
          <Button
            variant="danger"
            onClick={() => openConfirm("revoke")}
            disabled={bulkAction.isPending || pendingCount === 0}
          >
            <FiSlash aria-hidden />{" "}
            {pendingCount === 0
              ? t("admin:adminInvites.bulk.revokeCtaNone")
              : t("admin:adminInvites.bulk.revokeCta", {
                  count: pendingCount,
                })}
          </Button>
        </div>
      </m.div>
      {/* Its own AnimatePresence, so the dialog's `usePresence` registers
          here. Registered with the page's AnimatePresence around this bar,
          it never unregisters on unmount and holds the bar's exit open,
          leaving an invisible bar over the page. It also lets the dialog
          play its own exit. */}
      <AnimatePresence>
        {confirmRequest && isConfirmOpen && (
          <AdminInviteBulkConfirm
            key="bulk-confirm"
            request={confirmRequest}
            isOpen
            isPending={bulkAction.isPending}
            onConfirm={(action) => void runAction(action)}
            onClose={() => setIsConfirmOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
