import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { useOutsideDismiss } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUnreadCount } from "./api/useUnreadCount";
import { NotificationsListSkeleton } from "./NotificationsSkeleton";
import {
  measureAnchoredPanel,
  type AnchoredPanelPosition,
} from "./anchoredPanelPosition";
import styles from "./NotificationsPopover.module.css";

// The bell sits in the entry bundle (top bar, left rail), so the rows, their
// connection actions and the read-state writes only load on first open.
const NotificationsPopoverPanel = lazy(() =>
  import("./NotificationsPopoverPanel").then((module) => ({
    default: module.NotificationsPopoverPanel,
  })),
);

/** An open panel remembers the history entry it was opened on. */
interface OpenPanelState extends AnchoredPanelPosition {
  locationKey: string;
}

/**
 * The notifications bell, opening a popover of recent notifications in place.
 * The popover scrolls, and its footer button leads to the full page.
 *
 * Each host keeps its own look: it passes the trigger and badge classes and the
 * icon, so the bell still reads as part of the top bar, the plum rail or the
 * Messages inbox column.
 */
export function NotificationsBellMenu({
  unreadCount: unreadCountOverride,
  icon,
  triggerClassName,
  badgeClassName,
}: {
  /** Wins over the shared server count when a host already has one. */
  unreadCount?: number;
  icon: ReactNode;
  // CSS Module classes type as `string | undefined`.
  triggerClassName?: string;
  badgeClassName?: string;
}) {
  const { t } = useTranslation();
  const serverUnreadCount = useUnreadCount();
  const unreadCount = unreadCountOverride ?? serverUnreadCount;
  const { key: locationKey } = useLocation();
  const [panel, setPanel] = useState<OpenPanelState | null>(null);
  // Following any link or button inside the panel moves to a new history
  // entry, which closes it without an effect.
  const isOpen = panel !== null && panel.locationKey === locationKey;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const close = useCallback(() => setPanel(null), []);

  function toggle() {
    if (isOpen) {
      close();
      return;
    }
    if (triggerRef.current) {
      setPanel({ ...measureAnchoredPanel(triggerRef.current), locationKey });
    }
  }

  // The panel is portalled out of the trigger, so presses inside it count as
  // inside through `additionalInsideRef`.
  useOutsideDismiss(isOpen, triggerRef, close, {
    onEscape: () => {
      close();
      triggerRef.current?.focus();
    },
    additionalInsideRef: panelRef,
  });

  useEffect(() => {
    if (!isOpen) return;
    // Portalled to the end of <body>, the panel is out of tab order, so focus
    // moves into it on open.
    panelRef.current?.focus();
    const reposition = (event: Event) => {
      // Scrolling the list inside the panel moves nothing it is anchored to.
      if (
        event.target instanceof Node &&
        panelRef.current?.contains(event.target)
      ) {
        return;
      }
      const trigger = triggerRef.current;
      if (trigger) setPanel({ ...measureAnchoredPanel(trigger), locationKey });
    };
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [isOpen, locationKey]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        aria-label={t("nav:notifications")}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={toggle}
      >
        {icon}
        {unreadCount > 0 && (
          <span className={badgeClassName}>{unreadCount}</span>
        )}
      </button>
      {isOpen &&
        panel &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={styles.panel}
            style={{
              top: panel.top,
              bottom: panel.bottom,
              left: panel.left,
              right: panel.right,
              maxHeight: panel.maxHeight,
              transformOrigin: panel.transformOrigin,
            }}
          >
            <Suspense
              fallback={
                <div className={styles.scroll}>
                  <NotificationsListSkeleton count={4} />
                </div>
              }
            >
              <NotificationsPopoverPanel titleId={titleId} />
            </Suspense>
          </div>,
          document.body,
        )}
    </>
  );
}
