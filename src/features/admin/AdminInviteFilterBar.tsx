import { useLayoutEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { FiCheck, FiCheckSquare } from "react-icons/fi";
import { Button, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { AdminInviteRefreshAllExpired } from "./AdminInviteRefreshAllExpired";
import styles from "./AdminInvitesPage.module.css";

interface InviterOption {
  value: string;
  label: string;
  keywords: string;
}

/** Same curve as the `--ease` token, for motion's JS-driven transitions. */
const EASE_CURVE = [0.22, 0.68, 0.16, 1] as const;

/**
 * One state of the Select toggle: its icon and label. Both states sit in the
 * same grid cell, so the button always takes the wider one's width and
 * nothing beside it moves when it flips. The state not in use fades out and
 * stays hidden from assistive tech, so the button's name is the shown label.
 */
function SelectToggleFace({
  isActive,
  icon,
  label,
}: {
  isActive: boolean;
  icon: ReactNode;
  label: string;
}) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <span
      aria-hidden={isActive ? undefined : true}
      style={{
        gridArea: "1 / 1",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        // The button's own icon-to-label gap, passed down through the cell.
        gap: "inherit",
        opacity: isActive ? 1 : 0,
        visibility: isActive ? "visible" : "hidden",
        transition: reducedMotion
          ? "none"
          : "opacity var(--dur-base) var(--ease), visibility var(--dur-base) var(--ease)",
      }}
    >
      {icon}
      {label}
    </span>
  );
}

/**
 * The Select toggle, which reads Done while select mode is on. It grows in
 * and folds away with its width and opacity (at once under reduced motion)
 * as the list gains or loses its last invite. While it folds away it drops
 * the `data-invite-select-toggle` hook other controls focus, and hands any
 * focus it holds to the active tab.
 */
function SelectModeToggle({
  isSelectMode,
  onToggle,
}: {
  isSelectMode: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const duration = reducedMotion ? 0 : 0.22;

  useLayoutEffect(() => {
    if (isPresent) return;
    if (!buttonRef.current?.contains(document.activeElement)) return;
    document
      .querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
      ?.focus();
  }, [isPresent]);

  return (
    <m.span
      className={styles.filterBarAction}
      aria-hidden={isPresent ? undefined : true}
      style={{ pointerEvents: isPresent ? undefined : "none" }}
      // Clipped only while it moves, so the button's focus ring is never
      // cut off at rest (the same idea as the shared Collapse).
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
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        onClick={onToggle}
        data-invite-select-toggle={isPresent ? "" : undefined}
      >
        <span style={{ display: "inline-grid", gap: "inherit" }}>
          <SelectToggleFace
            isActive={!isSelectMode}
            icon={<FiCheckSquare aria-hidden size="1em" />}
            label={t("admin:adminInvites.select.startCta")}
          />
          <SelectToggleFace
            isActive={isSelectMode}
            icon={<FiCheck aria-hidden size="1em" />}
            label={t("admin:adminInvites.select.doneCta")}
          />
        </span>
      </Button>
    </m.span>
  );
}

/**
 * The row under the invite tabs: the "Sent by" filter on the left (only once
 * there is more than one sender to pick from), and on the right "Refresh all
 * N expired" on the Expired tab and the Select toggle, shown while the list
 * has invites to pick.
 */
export function AdminInviteFilterBar({
  inviterOptions,
  inviterSlug,
  inviterName,
  onInviterChange,
  isSelectMode,
  onToggleSelectMode,
  isSelectToggleShown,
  isRefreshAllShown,
  expiredTotal,
  onRowLeavingChange,
}: {
  inviterOptions: InviterOption[];
  inviterSlug: string | null;
  /** The filtered sender's name, or null while every sender shows. */
  inviterName: string | null;
  onInviterChange: (slug: string | null) => void;
  isSelectMode: boolean;
  onToggleSelectMode: () => void;
  /** False while the list has no invites to select. */
  isSelectToggleShown: boolean;
  isRefreshAllShown: boolean;
  /** The Expired list's server total, which follows the sender filter. */
  expiredTotal: number;
  /** Holds the grid up while acted-on cards play their exit. */
  onRowLeavingChange: (isLeaving: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.filterBar}>
      {inviterOptions.length > 1 && (
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel} id="invite-inviter-label">
            {t("admin:adminInvites.filterByInviter")}
          </span>
          <Select
            className={styles.filterSelect}
            labelledBy="invite-inviter-label"
            size="sm"
            clearable
            value={inviterSlug}
            placeholder={t("admin:adminInvites.allInviters")}
            options={inviterOptions}
            onChange={onInviterChange}
          />
        </div>
      )}
      <div className={styles.filterBarActions}>
        <AdminInviteRefreshAllExpired
          isShown={isRefreshAllShown}
          count={expiredTotal}
          inviterSlug={inviterSlug}
          inviterName={inviterName}
          onRowLeavingChange={onRowLeavingChange}
        />
        <AnimatePresence initial={false}>
          {isSelectToggleShown && (
            <SelectModeToggle
              key="select-toggle"
              isSelectMode={isSelectMode}
              onToggle={onToggleSelectMode}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
