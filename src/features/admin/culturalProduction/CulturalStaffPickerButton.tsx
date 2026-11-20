import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { FiUserPlus } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button } from "../../../shared/components/ui";
import { useAnchoredPopover } from "../../../shared/components/ui/useAnchoredPopover";
import { useDismissCalendarOnEscape } from "../../../shared/components/ui/useDismissCalendarOnEscape";
import { useMediaQuery } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { mediaMax } from "../../../shared/theme/breakpoints";
import { AdminModal } from "../ui";
import type { CulturalStaffSummaryDTO } from "./api/culturalProduction.types";
import { CulturalStaffPicker } from "./CulturalStaffPicker";
import styles from "./CulturalStaffPicker.module.css";

/** Below 640px the picker opens as a sheet. */
const PHONE_QUERY = mediaMax("md");
const MOTION_SECONDS = 0.2;
const MOTION_EASE = [0.22, 0.68, 0.16, 1] as const;
const HIDDEN_BELOW_STATE = { opacity: 0, y: -4 };
const HIDDEN_ABOVE_STATE = { opacity: 0, y: 4 };
const SHOWN_STATE = { opacity: 1, y: 0 };
const SHOWN_FROM_BELOW_STATE = { opacity: 1, y: [4, 0] };
const TABBABLE_SELECTOR =
  'input, button, select, textarea, a[href], [tabindex]:not([tabindex="-1"])';

/** The panel's elements that Tab can reach, folding pieces left out. */
function tabbablesIn(panel: HTMLElement | null): HTMLElement[] {
  if (panel === null) return [];
  return Array.from(
    panel.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR),
  ).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.tabIndex !== -1 &&
      element.closest("[inert]") === null,
  );
}

/**
 * A floating dialog under its anchor, portalled to the body above a host
 * dialog or drawer. Once placed it focuses the search field. Escape (ahead
 * of a host dialog, which stays open) or Tab past either end closes it and
 * asks for focus back on the anchor; a press outside closes it and leaves
 * focus where it went. Mounted under `AnimatePresence initial={false}`.
 */
function CulturalStaffPopover({
  anchorRef,
  label,
  onClose,
  children,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  label: string;
  onClose: (shouldRestoreFocus: boolean) => void;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const placement = useAnchoredPopover(anchorRef, panelRef, true);
  const isPlaced = placement !== null;
  const isFlipped = placement?.isFlipped ?? false;
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const savedOnClose = useRef(onClose);
  useEffect(() => {
    savedOnClose.current = onClose;
  });
  useDismissCalendarOnEscape(isPresent, anchorRef, () =>
    savedOnClose.current(true),
  );

  useEffect(() => {
    if (!isPlaced || !isPresent) return;
    panelRef.current?.querySelector<HTMLInputElement>("input")?.focus();
  }, [isPlaced, isPresent]);

  useEffect(() => {
    if (!isPresent) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        panelRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      ) {
        return;
      }
      savedOnClose.current(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [anchorRef, isPresent]);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const tabbables = tabbablesIn(panelRef.current);
    const edge = event.shiftKey ? tabbables[0] : tabbables.at(-1);
    if (tabbables.length > 0 && document.activeElement !== edge) return;
    event.preventDefault();
    savedOnClose.current(true);
  };

  return createPortal(
    <m.div
      ref={panelRef}
      role="dialog"
      aria-label={label}
      className={styles.popover}
      data-placed={isPlaced || undefined}
      style={placement?.style}
      initial={HIDDEN_BELOW_STATE}
      animate={
        !isPlaced
          ? HIDDEN_BELOW_STATE
          : isFlipped
            ? SHOWN_FROM_BELOW_STATE
            : SHOWN_STATE
      }
      exit={isFlipped ? HIDDEN_ABOVE_STATE : HIDDEN_BELOW_STATE}
      transition={{
        duration: reducedMotion ? 0 : MOTION_SECONDS,
        ease: MOTION_EASE,
      }}
      onKeyDown={onKeyDown}
    >
      {children}
    </m.div>,
    document.body,
  );
}

/**
 * The Assign staff button and the staff picker it opens: an anchored panel
 * under the button on wider screens, an `AdminModal` sheet under 640px
 * (the nested tier, so it stacks above a host dialog or drawer). The picker
 * stays open while people are checked and unchecked, and closing it returns
 * focus to the button. `onToggle`'s `isSelected` says
 * whether the person was selected before the press.
 */
export function CulturalStaffPickerButton({
  label,
  selectedPeople,
  onToggle,
  isBusy = false,
  error = null,
}: {
  label: string;
  selectedPeople: CulturalStaffSummaryDTO[];
  onToggle: (person: CulturalStaffSummaryDTO, isSelected: boolean) => void;
  isBusy?: boolean;
  error?: unknown;
}) {
  const { t } = useTranslation();
  const isPhone = useMediaQuery(PHONE_QUERY);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  function closePicker(shouldRestoreFocus: boolean) {
    setIsOpen(false);
    if (shouldRestoreFocus) triggerRef.current?.focus();
  }

  const picker = (
    <CulturalStaffPicker
      selectedPeople={selectedPeople}
      onToggle={onToggle}
      isBusy={isBusy}
      error={error}
    />
  );

  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="sm"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <FiUserPlus aria-hidden />
        {label}
      </Button>
      <AnimatePresence initial={false}>
        {isOpen &&
          (isPhone ? (
            // AdminModal sits on the nested tier, so the sheet stacks above
            // the AdminModal or AdminDrawer that holds the button.
            <AdminModal
              key="sheet"
              title={label}
              onClose={() => setIsOpen(false)}
              footer={
                <Button variant="ghost" onClick={() => setIsOpen(false)}>
                  {t("admin:culturalProduction.common.close")}
                </Button>
              }
            >
              <div className={styles.sheetBody}>{picker}</div>
            </AdminModal>
          ) : (
            <CulturalStaffPopover
              key="popover"
              anchorRef={triggerRef}
              label={label}
              onClose={closePicker}
            >
              {picker}
            </CulturalStaffPopover>
          ))}
      </AnimatePresence>
    </>
  );
}
