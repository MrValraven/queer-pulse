import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import {
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiCircle,
} from "react-icons/fi";
import { TbProgress } from "react-icons/tb";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useAnchoredPopover } from "../../../shared/components/ui/useAnchoredPopover";
import { useOutsideDismiss } from "../../../shared/hooks/useOutsideDismiss";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  CULTURAL_TASK_STATUSES,
  type CulturalTaskStatus,
} from "./api/culturalProduction.types";
import { CULTURAL_TASK_STATUS_KEY } from "./culturalProductionLabels.data";
import styles from "./TaskStatusMenu.module.css";

/** The house `--ease` curve, for the transitions motion drives. */
const MENU_EASE = [0.22, 0.68, 0.16, 1] as const;
const MENU_IN = { duration: 0.15, ease: MENU_EASE };
const MENU_OUT = { duration: 0.1, ease: MENU_EASE };
const FACE_SWAP = { duration: 0.12, ease: MENU_EASE };
const INSTANT = { duration: 0 };

const GLYPH_CLASS: Record<CulturalTaskStatus, string | undefined> = {
  todo: styles.glyphTodo,
  doing: styles.glyphDoing,
  done: styles.glyphDone,
};

/** The status mark beside each label: a hollow ring to do, a ring part way
 *  round while doing, a checked ring once done. Decorative, since the label
 *  next to it carries the meaning. */
function TaskStatusGlyph({ status }: { status: CulturalTaskStatus }) {
  const className = `${styles.glyph} ${GLYPH_CLASS[status] ?? ""}`;
  if (status === "done")
    return <FiCheckCircle className={className} aria-hidden />;
  if (status === "doing")
    return <TbProgress className={className} aria-hidden />;
  return <FiCircle className={className} aria-hidden />;
}

/** Folds a label for first-letter typeahead, so "É" and "e" match. */
function foldForTypeahead(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * The open menu, portalled to the body so no row, animated list item or
 * clipping frame can paint over it or cut it off. Placed by
 * `useAnchoredPopover`, which keeps it beside the trigger on scroll and opens
 * it upward when there is no room below. Focus sits on the current status
 * once the menu is placed; arrows, Home, End and a first letter move it.
 */
function TaskStatusMenuPanel({
  anchorRef,
  menuRef,
  menuId,
  menuLabel,
  currentStatus,
  onPick,
  onClose,
}: {
  anchorRef: RefObject<HTMLButtonElement | null>;
  /** Owned by the trigger, so its outside press dismiss counts a press in
   *  this portalled subtree as inside. */
  menuRef: RefObject<HTMLDivElement | null>;
  menuId: string;
  menuLabel: string;
  currentStatus: CulturalTaskStatus;
  onPick: (status: CulturalTaskStatus) => void;
  onClose: (shouldRestoreFocus: boolean) => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const placement = useAnchoredPopover(anchorRef, menuRef, true);
  const isPlaced = placement !== null;
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const openedOnStatusRef = useRef(currentStatus);

  // A hidden panel cannot take focus, so focus waits for the first placement.
  useEffect(() => {
    if (!isPlaced) return;
    const openedOnIndex = CULTURAL_TASK_STATUSES.indexOf(
      openedOnStatusRef.current,
    );
    itemRefs.current[openedOnIndex]?.focus({ preventScroll: true });
  }, [isPlaced]);

  const focusItemAt = (index: number) => {
    const count = CULTURAL_TASK_STATUSES.length;
    itemRefs.current[(index + count) % count]?.focus({ preventScroll: true });
  };

  const focusByFirstLetter = (letter: string, fromIndex: number) => {
    const wanted = foldForTypeahead(letter);
    // The search starts just after the focused item and wraps, so pressing
    // the same letter again steps through every status that starts with it.
    const candidates = CULTURAL_TASK_STATUSES.map((status, index) => ({
      index,
      label: foldForTypeahead(t(CULTURAL_TASK_STATUS_KEY[status])),
    }));
    const searchOrder = [
      ...candidates.slice(fromIndex + 1),
      ...candidates.slice(0, fromIndex + 1),
    ];
    const match = searchOrder.find((candidate) =>
      candidate.label.startsWith(wanted),
    );
    if (match) focusItemAt(match.index);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const focusedIndex = itemRefs.current.findIndex(
      (item) => item !== null && item === document.activeElement,
    );
    const focusedStatus =
      focusedIndex >= 0 ? CULTURAL_TASK_STATUSES[focusedIndex] : undefined;
    const isPlainLetter =
      event.key.length === 1 &&
      event.key !== " " &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey;

    if (event.key === "Tab") {
      // Focus is back on the trigger before the browser acts on the key, so
      // this same press moves on to the control after (or before) it.
      onClose(true);
      return;
    }
    if (event.key === "ArrowDown") focusItemAt(focusedIndex + 1);
    else if (event.key === "ArrowUp") {
      focusItemAt(focusedIndex < 0 ? -1 : focusedIndex - 1);
    } else if (event.key === "Home") focusItemAt(0);
    else if (event.key === "End") focusItemAt(-1);
    else if (event.key === "Enter" || event.key === " ") {
      if (focusedStatus !== undefined) onPick(focusedStatus);
    } else if (event.key === "Escape") onClose(true);
    else if (isPlainLetter) focusByFirstLetter(event.key, focusedIndex);
    else return;
    // Kept from the page and any dialog underneath: Escape closes this menu
    // alone, and the keys that move or pick stay inside it.
    event.preventDefault();
    event.stopPropagation();
  };

  return createPortal(
    <m.div
      ref={menuRef}
      id={menuId}
      role="menu"
      tabIndex={-1}
      aria-label={menuLabel}
      aria-hidden={isPresent ? undefined : true}
      className={[
        styles.menu,
        placement?.isFlipped && styles.menuFlipped,
        !isPresent && styles.menuLeaving,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...placement?.style,
        visibility: isPlaced ? undefined : "hidden",
      }}
      initial={reducedMotion ? false : { opacity: 0, scale: 0.97 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: reducedMotion ? INSTANT : MENU_IN,
      }}
      exit={{ opacity: 0, transition: reducedMotion ? INSTANT : MENU_OUT }}
      onKeyDown={onKeyDown}
    >
      {CULTURAL_TASK_STATUSES.map((status, index) => {
        const isChecked = status === currentStatus;
        return (
          <button
            key={status}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            type="button"
            role="menuitemradio"
            aria-checked={isChecked}
            tabIndex={-1}
            className={styles.item}
            onClick={() => onPick(status)}
          >
            <TaskStatusGlyph status={status} />
            <span className={styles.itemLabel}>
              {t(CULTURAL_TASK_STATUS_KEY[status])}
            </span>
            <FiCheck
              className={`${styles.itemCheck} ${isChecked ? styles.itemCheckShown : ""}`}
              aria-hidden
            />
          </button>
        );
      })}
    </m.div>,
    document.body,
  );
}

/**
 * A task row's status as a compact pill that opens a menu of the three
 * statuses (the menu button pattern). The pill shows the status it is
 * given, so a caller can pass the one on its way while a write runs; picking
 * the status already shown closes the menu with no call. While `isBusy` the
 * pill dims and reads busy, keeps its focus and its width, and does not open.
 */
export function TaskStatusMenu({
  status,
  label,
  isDisabled,
  isBusy,
  isInvalid,
  describedById,
  onPick,
}: {
  status: CulturalTaskStatus;
  /** What the control is for, such as "Status of Book the venue". The
   *  trigger's accessible name adds the current status after it. */
  label: string;
  isDisabled: boolean;
  isBusy: boolean;
  isInvalid: boolean;
  describedById?: string;
  onPick: (status: CulturalTaskStatus) => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const canOpen = !isDisabled && !isBusy;
  const isMenuShown = isOpen && canOpen;
  const statusName = t(CULTURAL_TASK_STATUS_KEY[status]);

  const closeMenu = (shouldRestoreFocus: boolean) => {
    setIsOpen(false);
    if (shouldRestoreFocus) triggerRef.current?.focus({ preventScroll: true });
  };

  useOutsideDismiss(isMenuShown, triggerRef, () => setIsOpen(false), {
    additionalInsideRef: menuRef,
  });

  const pickStatus = (picked: CulturalTaskStatus) => {
    closeMenu(true);
    if (picked !== status) onPick(picked);
  };

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    if (canOpen) setIsOpen(true);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={[styles.trigger, isInvalid && styles.triggerInvalid]
          .filter(Boolean)
          .join(" ")}
        disabled={isDisabled}
        aria-haspopup="menu"
        aria-expanded={isMenuShown}
        aria-controls={isMenuShown ? menuId : undefined}
        aria-label={`${label}, ${statusName}`}
        aria-describedby={describedById}
        aria-busy={isBusy || undefined}
        data-open={isMenuShown || undefined}
        onClick={() => {
          if (!canOpen) return;
          setIsOpen((wasOpen) => !wasOpen);
        }}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={styles.face}>
          <AnimatePresence initial={false} mode="wait">
            <m.span
              key={status}
              className={styles.faceValue}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reducedMotion ? INSTANT : FACE_SWAP}
            >
              <TaskStatusGlyph status={status} />
              <span className={styles.faceLabel}>{statusName}</span>
            </m.span>
          </AnimatePresence>
        </span>
        <FiChevronDown
          className={`${styles.chevron} ${isMenuShown ? styles.chevronOpen : ""}`}
          aria-hidden
        />
      </button>
      <AnimatePresence>
        {isMenuShown ? (
          <TaskStatusMenuPanel
            key="menu"
            anchorRef={triggerRef}
            menuRef={menuRef}
            menuId={menuId}
            menuLabel={label}
            currentStatus={status}
            onPick={pickStatus}
            onClose={closeMenu}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
