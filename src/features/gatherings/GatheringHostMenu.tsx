import {
  Fragment,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  FiEdit2,
  FiMoreHorizontal,
  FiSettings,
  FiSlash,
  FiTrash2,
} from "react-icons/fi";
import { IconButton, Tooltip } from "../../shared/components/ui";
import { useAnchoredPopover } from "../../shared/components/ui/useAnchoredPopover";
import { useOutsideDismiss } from "../../shared/hooks/useOutsideDismiss";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { manageGatheringPath } from "./data";
import styles from "./GatheringHostMenu.module.css";

const MENU_ITEM_SELECTOR = '[role="menuitem"]';

interface HostMenuItem {
  key: string;
  icon: ReactNode;
  label: string;
  onSelect: () => void;
  isDisabled?: boolean;
  isDanger?: boolean;
  isHidden?: boolean;
  hasSeparatorBefore?: boolean;
}

/** The roving half of the APG menu contract: ArrowUp/Down wrap around the
 *  items, Home and End jump to either end. False for any other key. */
function moveMenuFocus(menu: HTMLElement | null, key: string): boolean {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(key)) return false;
  const items = Array.from(
    menu?.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR) ?? [],
  );
  const currentIndex = items.indexOf(document.activeElement as HTMLElement);
  const lastIndex = items.length - 1;
  const nextIndexByKey: Record<string, number> = {
    ArrowDown:
      currentIndex < 0 || currentIndex >= lastIndex ? 0 : currentIndex + 1,
    ArrowUp: currentIndex <= 0 ? lastIndex : currentIndex - 1,
    Home: 0,
    End: lastIndex,
  };
  items[nextIndexByKey[key] ?? 0]?.focus();
  return true;
}

/**
 * The host's tools for their own gathering, folded into one "more" button in
 * the page header. Presentational: what each action MEANS (the mutations, the
 * confirms, the this-vs-future question) stays in `GatheringHostBar`.
 *
 * Same APG menu-button contract as `ProfileSettingsMenu`. Every item hands
 * focus back to the trigger before it fires, so a dialog it opens restores
 * focus to the button on close. The panel is portalled and placed by
 * `useAnchoredPopover`: the header sits inside `FadeIn`, whose stacking
 * context would trap an absolute panel under the sticky sidebar beside it.
 */
export function GatheringHostMenu({
  slug,
  title,
  isCancelled,
  isCancelPending,
  isDeletePending,
  onEdit,
  onCancel,
  onDelete,
}: {
  slug: string;
  /** The gathering's title, for the trigger's accessible name. */
  title: string;
  /** The gathering has already been called off. */
  isCancelled: boolean;
  isCancelPending: boolean;
  isDeletePending: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const labelId = useId();
  const placement = useAnchoredPopover(triggerRef, panelRef, isOpen);
  const isPlaced = placement !== null;

  // The panel is `visibility: hidden` for the one commit before its first
  // measurement, and a hidden element refuses focus, so the first item takes
  // focus once the panel is placed.
  useEffect(() => {
    if (!isOpen || !isPlaced) return;
    panelRef.current?.querySelector<HTMLElement>(MENU_ITEM_SELECTOR)?.focus();
  }, [isOpen, isPlaced]);

  useOutsideDismiss(isOpen, triggerRef, () => setIsOpen(false), {
    additionalInsideRef: panelRef,
  });

  const closeToTrigger = () => {
    triggerRef.current?.focus();
    setIsOpen(false);
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") event.preventDefault();
    // Tab leaves the menu from the trigger, so it carries on in page order
    // instead of from the end of `<body>` where the portalled panel lives.
    if (event.key === "Escape" || event.key === "Tab") closeToTrigger();
    else if (moveMenuFocus(panelRef.current, event.key)) event.preventDefault();
  };

  // Manage is the way through to attendees, announcements and the day-of
  // dashboard. A gathering already called off has nothing left to cancel.
  // The line sits between the everyday tools and the two ways of ending it.
  const items: HostMenuItem[] = [
    {
      key: "edit",
      icon: <FiEdit2 />,
      label: t("gatherings:hostBar.editCta"),
      onSelect: onEdit,
    },
    {
      key: "manage",
      icon: <FiSettings />,
      label: t("gatherings:hostBar.manageCta"),
      onSelect: () => void navigate(manageGatheringPath(slug)),
    },
    {
      key: "cancel",
      icon: <FiSlash />,
      label: t("gatherings:hostBar.cancelCta"),
      onSelect: onCancel,
      isDisabled: isCancelPending,
      isHidden: isCancelled,
      hasSeparatorBefore: true,
    },
    {
      key: "delete",
      icon: <FiTrash2 />,
      label: t("gatherings:hostBar.deleteCta"),
      onSelect: onDelete,
      isDisabled: isDeletePending,
      isDanger: true,
      hasSeparatorBefore: isCancelled,
    },
  ];

  return (
    <>
      <Tooltip label={t("gatherings:hostBar.menuTooltip")}>
        <IconButton
          ref={triggerRef}
          aria-label={t("gatherings:hostBar.menuAria", { title })}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-controls={isOpen ? menuId : undefined}
          onClick={() => setIsOpen((current) => !current)}
        >
          <FiMoreHorizontal aria-hidden />
        </IconButton>
      </Tooltip>
      {isOpen &&
        createPortal(
          <div
            ref={panelRef}
            className={
              placement === null
                ? styles.panelUnplaced
                : placement.isFlipped
                  ? styles.panelFlipped
                  : styles.panel
            }
            style={placement?.style}
          >
            {/* Outside the menu element, which may only own items and
                separators; it names the menu through aria-labelledby. */}
            <div id={labelId} className={styles.label}>
              {t("gatherings:hostBar.label")}
            </div>
            <div
              id={menuId}
              role="menu"
              tabIndex={-1}
              aria-labelledby={labelId}
              onKeyDown={onMenuKeyDown}
            >
              {items
                .filter((item) => !item.isHidden)
                .map((item) => (
                  <Fragment key={item.key}>
                    {item.hasSeparatorBefore && (
                      <div role="separator" className={styles.separator} />
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      tabIndex={-1}
                      aria-disabled={item.isDisabled || undefined}
                      className={
                        item.isDanger ? styles.itemDanger : styles.item
                      }
                      onClick={() => {
                        if (item.isDisabled) return;
                        closeToTrigger();
                        item.onSelect();
                      }}
                    >
                      <span className={styles.itemIcon} aria-hidden>
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  </Fragment>
                ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
