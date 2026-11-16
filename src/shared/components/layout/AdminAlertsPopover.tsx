import { useEffect, useId, useRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  m,
  PresenceContext,
  useIsPresent,
} from "motion/react";
import { FiCheckCircle, FiChevronRight } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { AdminEmptyState } from "../../../features/admin/ui/AdminEmptyState";
import { useOutsideDismiss } from "../../hooks";
import { useFormat } from "../../i18n/format";
import { useTranslation } from "../../i18n/useTranslation";
import { RollingNumber } from "../ui/RollingNumber";
import { useAnchoredPopover } from "../ui/useAnchoredPopover";
import type { AdminNavBadge, AdminNavItem } from "./adminNav.data";
import { useAdminNavBadges } from "./useAdminNavBadges";
import { useAdminSidebarNav } from "./useAdminSidebarNav";
import styles from "./AdminAlertsPopover.module.css";

/** The queues whose count could not be read, keyed by badge. A queue listed
 *  here shows "Count unavailable" in the popover, whatever its count reads. */
export type AdminNavBadgeUnavailable = Partial<Record<AdminNavBadge, boolean>>;

interface AdminAlertRow {
  badge: AdminNavBadge;
  /** The first destination in the viewer's rail that this queue feeds. */
  item: AdminNavItem;
  count: number;
  isUnavailable: boolean;
}

/**
 * One row per queue that needs staff: a count above 0, or a read that failed.
 * Two rail entries can share a queue (Members and Join requests both read the
 * join-request queue), so each queue is listed once, at its first entry in
 * the viewer's own rail.
 */
function useAdminAlertRows(
  unavailable: AdminNavBadgeUnavailable = {},
): AdminAlertRow[] {
  const counts = useAdminNavBadges();
  const { sections } = useAdminSidebarNav();
  const rows: AdminAlertRow[] = [];
  const listedBadges = new Set<AdminNavBadge>();
  for (const item of sections.flatMap((section) => section.items)) {
    const badge = item.badge;
    if (!badge || listedBadges.has(badge)) continue;
    const isUnavailable = unavailable[badge] === true;
    const count = counts[badge];
    if (count <= 0 && !isUnavailable) continue;
    listedBadges.add(badge);
    rows.push({ badge, item, count, isUnavailable });
  }
  return rows;
}

/**
 * What the bell's dot needs: how many items wait across every queue, and
 * whether any queue could not be read. The dot shows only for a total above 0.
 */
export function useAdminAlertsSummary(unavailable?: AdminNavBadgeUnavailable): {
  total: number;
  hasUnavailable: boolean;
} {
  const rows = useAdminAlertRows(unavailable);
  return {
    total: rows.reduce(
      (sum, row) => (row.isUnavailable ? sum : sum + row.count),
      0,
    ),
    hasUnavailable: rows.some((row) => row.isUnavailable),
  };
}

/**
 * The top bar bell's popover: every queue waiting on staff, each a link to its
 * page, with the count in the queue's tone. Portalled and anchored under the
 * bell; Esc or a press outside closes it, and Esc hands focus back to the bell.
 */
export function AdminAlertsPopover({
  anchorRef,
  isOpen,
  onClose,
  unavailable,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  /** Queues whose count read failed. Optional until the badge hook reports
   *  failures; see `AdminNavBadgeUnavailable`. */
  unavailable?: AdminNavBadgeUnavailable;
}) {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <AdminAlertsPanel
          key="alerts"
          anchorRef={anchorRef}
          onClose={onClose}
          unavailable={unavailable}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}

const TONE_CLASS = {
  alert: styles.countAlert,
  warn: styles.countWarn,
} as const;

function AdminAlertsPanel({
  anchorRef,
  onClose,
  unavailable,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  unavailable?: AdminNavBadgeUnavailable;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const isPresent = useIsPresent();
  const { reducedMotion: isReducedMotion } = useMotionPrefs();
  const placement = useAnchoredPopover(anchorRef, panelRef, isPresent);
  const rows = useAdminAlertRows(unavailable);

  useOutsideDismiss(isPresent, panelRef, onClose, {
    onEscape: () => {
      onClose();
      anchorRef.current?.focus();
    },
    additionalInsideRef: anchorRef,
  });

  // Focus waits for the first placement: until then the panel is
  // `visibility: hidden`, which refuses focus and would leave it on the bell,
  // where Tab runs on through the top bar and never reaches this portal.
  const isPlaced = placement !== null;
  const hasTakenFocusRef = useRef(false);
  useEffect(() => {
    if (!isPlaced || hasTakenFocusRef.current) return;
    hasTakenFocusRef.current = true;
    panelRef.current?.focus();
  }, [isPlaced]);

  return (
    <m.div
      ref={panelRef}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      inert={!isPresent}
      className={styles.panel}
      data-flipped={placement?.isFlipped || undefined}
      style={{
        ...placement?.style,
        visibility: placement ? undefined : "hidden",
      }}
      initial={{ opacity: 0, scale: isReducedMotion ? 1 : 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: isReducedMotion ? 1 : 0.97 }}
      transition={{ duration: isReducedMotion ? 0 : 0.16, ease: "easeOut" }}
    >
      {/* Cut the presence context, as the shared Modal does: the rolling
          counts must not hold this panel's exit open. */}
      <PresenceContext.Provider value={null}>
        <h2 id={titleId} className={styles.title}>
          {t("shared:adminShell.alerts.title")}
        </h2>
        {rows.length === 0 ? (
          <AdminEmptyState
            size="inline"
            icon={FiCheckCircle}
            title={t("shared:adminShell.alerts.empty")}
          />
        ) : (
          <ul className={styles.list}>
            {rows.map(({ badge, item, count, isUnavailable }) => {
              const label = t(item.labelKey);
              const countId = `${titleId}-${badge}`;
              const Icon = item.icon;
              return (
                <li key={badge}>
                  <Link
                    to={item.to}
                    className={styles.row}
                    aria-label={t("shared:adminShell.alerts.open", { label })}
                    aria-describedby={countId}
                    onClick={onClose}
                  >
                    <Icon className={styles.rowIcon} aria-hidden />
                    <span className={styles.rowLabel}>{label}</span>
                    {isUnavailable ? (
                      <span id={countId} className={styles.unavailable}>
                        {t("shared:adminShell.alerts.unavailable")}
                      </span>
                    ) : (
                      <span
                        id={countId}
                        className={[
                          styles.count,
                          TONE_CLASS[item.tone ?? "warn"],
                        ].join(" ")}
                      >
                        <RollingNumber
                          value={fmt.number(count)}
                          numericValue={count}
                        />
                      </span>
                    )}
                    <FiChevronRight className={styles.rowChevron} aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </PresenceContext.Provider>
    </m.div>
  );
}
