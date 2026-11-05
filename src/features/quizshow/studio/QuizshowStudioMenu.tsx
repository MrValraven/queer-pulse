import {
  useEffect,
  useId,
  useMemo,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "motion/react";
import type { IconType } from "react-icons";
import { FiCheck, FiCheckSquare, FiSquare } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button } from "../../../shared/components/ui";
import { useOutsideDismiss } from "../../../shared/hooks";
import { useQuizshowStudioPortal } from "./quizshowStudioPortal";
import {
  useStudioMenuPosition,
  type QuizshowStudioMenuAnchor,
  type QuizshowStudioMenuPlacement,
} from "./useStudioMenuPosition";
import styles from "./QuizshowStudioMenu.module.css";

export type { QuizshowStudioMenuAnchor } from "./useStudioMenuPosition";

export type QuizshowStudioMenuEntry =
  | {
      key: string;
      kind?: "action";
      label: string;
      /** A second, quieter line under the label. */
      description?: string;
      icon?: IconType;
      onSelect: () => void;
      isDestructive?: boolean;
      isDisabled?: boolean;
      /** Shown under the label of a disabled item, and read as its description. */
      disabledReason?: string;
      /** A router path: the item is a link. */
      to?: string;
      /** A toggle (`checkbox`) or one of a set (`radio`), with its state. */
      check?: { role: "checkbox" | "radio"; isChecked: boolean };
    }
  | { key: string; kind: "separator" };

type QuizshowStudioMenuAction = Exclude<
  QuizshowStudioMenuEntry,
  { kind: "separator" }
>;

const ENTRANCE_EASE = [0.16, 1, 0.3, 1] as const;

/** A checkbox draws its box either way; a radio item draws a tick on the chosen one only. */
function checkIconOf(check: {
  role: "checkbox" | "radio";
  isChecked: boolean;
}): ReactNode {
  if (check.role === "checkbox") {
    return check.isChecked ? <FiCheckSquare /> : <FiSquare />;
  }
  return check.isChecked ? <FiCheck /> : null;
}

function itemRoleOf(entry: QuizshowStudioMenuAction) {
  if (!entry.check) return "menuitem";
  return entry.check.role === "radio" ? "menuitemradio" : "menuitemcheckbox";
}

function QuizshowStudioMenuItem({
  entry,
  onChoose,
}: {
  entry: QuizshowStudioMenuAction;
  onChoose: (entry: QuizshowStudioMenuAction) => void;
}) {
  const noteId = useId();
  const note = entry.isDisabled ? entry.disabledReason : entry.description;
  const Icon = entry.icon;
  const checkIcon = entry.check ? checkIconOf(entry.check) : null;
  const shared = {
    role: itemRoleOf(entry),
    tabIndex: -1,
    variant: "quiet",
    className: styles.item,
    "aria-checked": entry.check ? entry.check.isChecked : undefined,
    "aria-disabled": entry.isDisabled || undefined,
    "aria-describedby": note ? noteId : undefined,
    "data-destructive": entry.isDestructive || undefined,
  } as const;
  const content = (
    <>
      <span className={styles.icon} aria-hidden>
        {checkIcon ?? (Icon ? <Icon /> : null)}
      </span>
      <span className={styles.text}>
        <span className={styles.label}>{entry.label}</span>
        {note && (
          <span id={noteId} className={styles.note}>
            {note}
          </span>
        )}
      </span>
    </>
  );
  if (entry.to && !entry.isDisabled) {
    return (
      <Button {...shared} to={entry.to} onClick={() => onChoose(entry)}>
        {content}
      </Button>
    );
  }
  return (
    <Button
      {...shared}
      onClick={() => {
        if (!entry.isDisabled) onChoose(entry);
      }}
    >
      {content}
    </Button>
  );
}

/** Arrows, Home and End move between items (wrapping); the rest is the caller's. */
function nextItemIndex(key: string, current: number, count: number) {
  if (key === "ArrowDown") return (current + 1) % count;
  if (key === "ArrowUp") return (current - 1 + count) % count;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return null;
}

interface PanelProps {
  label: string;
  entries: readonly QuizshowStudioMenuEntry[];
  anchor: QuizshowStudioMenuAnchor;
  placement: QuizshowStudioMenuPlacement;
  onClose: (shouldReturnFocus: boolean) => void;
}

function QuizshowStudioMenuPanel({
  label,
  entries,
  anchor,
  placement,
  onClose,
}: PanelProps) {
  const { reducedMotion } = useMotionPrefs();
  const panelRef = useRef<HTMLDivElement>(null);
  const anchorRef = useMemo(() => ({ current: anchor.element }), [anchor]);
  const position = useStudioMenuPosition(panelRef, anchor, placement, () =>
    onClose(false),
  );
  useOutsideDismiss(true, panelRef, () => onClose(false), {
    additionalInsideRef: anchorRef,
  });
  const isPlaced = position !== null;
  useEffect(() => {
    if (!isPlaced) return;
    panelRef.current
      ?.querySelector<HTMLElement>('[role^="menuitem"]')
      ?.focus({ preventScroll: true });
  }, [isPlaced]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose(true);
      return;
    }
    // Focus goes back to the opener and the browser's own Tab carries on from there.
    if (event.key === "Tab") {
      onClose(true);
      return;
    }
    const items = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]') ??
        [],
    );
    const current = items.indexOf(document.activeElement as HTMLElement);
    const next = nextItemIndex(event.key, current, items.length);
    if (next === null || items.length === 0) return;
    event.preventDefault();
    items[next]?.focus();
  };

  const fade = { duration: reducedMotion ? 0.12 : 0.15, ease: ENTRANCE_EASE };
  return (
    <m.div
      ref={panelRef}
      role="menu"
      aria-label={label}
      className={styles.menu}
      data-placement={position?.isFlippedUp ? "up" : "down"}
      data-align={position?.isAlignedStart ? "start" : "end"}
      onKeyDown={handleKeyDown}
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        maxHeight: position?.maxHeight,
        visibility: position ? undefined : "hidden",
      }}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1, transition: fade }}
      exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.97, transition: fade }}
    >
      {entries.map((entry) =>
        entry.kind === "separator" ? (
          <div key={entry.key} role="separator" className={styles.separator} />
        ) : (
          <QuizshowStudioMenuItem
            key={entry.key}
            entry={entry}
            onChoose={(chosen) => {
              // Focus is back on the opener before the action runs, so a dialog it opens hands focus back there.
              onClose(!chosen.to);
              chosen.onSelect();
            }}
          />
        ),
      )}
    </m.div>
  );
}

/**
 * The studio's dark menu, for the More menu, the thumbnail and round menus and
 * the round kind picker. It portals into the studio's own root, so it keeps
 * the studio's dark tokens whatever the app theme, and sits fixed over the
 * rail's scrolling column without being clipped by it.
 */
export function QuizshowStudioMenu({
  label,
  entries,
  anchor,
  onClose,
  placement = "bottom-end",
}: {
  label: string;
  entries: readonly QuizshowStudioMenuEntry[];
  /** Open while set. */
  anchor: QuizshowStudioMenuAnchor | null;
  onClose: (shouldReturnFocus: boolean) => void;
  placement?: QuizshowStudioMenuPlacement;
}) {
  const target = useQuizshowStudioPortal();
  if (target === null) return null;
  return createPortal(
    <AnimatePresence>
      {anchor && (
        <QuizshowStudioMenuPanel
          key="studio-menu"
          label={label}
          entries={entries}
          anchor={anchor}
          placement={placement}
          onClose={onClose}
        />
      )}
    </AnimatePresence>,
    target,
  );
}
