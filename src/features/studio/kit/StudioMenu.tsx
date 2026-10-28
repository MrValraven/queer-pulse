import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button } from "../../../shared/components/ui/Button";
import { useOutsideDismiss } from "../../../shared/hooks/useOutsideDismiss";
import { STUDIO_EXIT, STUDIO_FADE, STUDIO_SPRING } from "../studioMotion";
import {
  isSamePosition,
  measureViewportInsets,
  placeStudioMenu,
  pointRect,
  type StudioMenuPlacement,
  type StudioMenuPointSource,
  type StudioMenuPosition,
} from "./studioMenuPlacement";
import { useStudioMenuKeys } from "./useStudioMenuKeys";
import styles from "./StudioMenu.module.css";

export type StudioMenuItem =
  | {
      id: string;
      label: string;
      icon?: ReactNode;
      onSelect: () => void;
      isDisabled?: boolean;
      /** Shown under the label and read as the item's description. */
      disabledReason?: string;
      tone?: "default" | "danger";
      /** A router path: the item renders as a link. */
      href?: string;
      /** With `href`: the link replaces the current history entry, for a
       *  menu inside a surface that owns an entry of its own (Now playing). */
      replace?: boolean;
    }
  | { id: string; type: "separator" };

type StudioMenuAction = Exclude<StudioMenuItem, { type: "separator" }>;

/** Viewport coordinates, and how they were asked for (useStudioContextMenu
 *  sets `source`; a finger menu opens above and beside the finger). */
type StudioMenuAnchorPoint = {
  x: number;
  y: number;
  source?: StudioMenuPointSource;
};

export interface StudioMenuProps {
  /** The opener, usually an `IconButton`. Null for a context menu, which
   *  opens at `anchorPoint`. */
  trigger: ReactElement | null;
  /** The menu's accessible name. */
  label: string;
  items: StudioMenuItem[];
  /** Viewport coordinates for a context menu. */
  anchorPoint?: StudioMenuAnchorPoint | null;
  /** Controlled open state. Left out, the trigger toggles it; a menu with no
   *  trigger is open while `anchorPoint` is set. */
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  placement?: StudioMenuPlacement;
  /** Where focus goes when the menu closes, and so where a dialog opened
   *  from an item hands it back. A context menu passes its row; left out,
   *  it is the trigger, or whatever had focus when the menu opened. */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

interface TriggerProps {
  ref?: Ref<HTMLElement>;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  "aria-haspopup"?: "menu";
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
}

const isSeparator = (
  item: StudioMenuItem,
): item is { id: string; type: "separator" } => "type" in item;

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

function StudioMenuEntry({
  item,
  onChoose,
}: {
  item: StudioMenuAction;
  onChoose: (item: StudioMenuAction, isLink: boolean) => void;
}) {
  const reasonId = useId();
  const reason = item.isDisabled ? item.disabledReason : undefined;
  const className = [styles.item, item.tone === "danger" && styles.itemDanger]
    .filter(Boolean)
    .join(" ");
  const content = (
    <>
      {item.icon && (
        <span className={styles.icon} aria-hidden="true">
          {item.icon}
        </span>
      )}
      <span className={styles.text}>
        <span className={styles.label}>{item.label}</span>
        {/* The reason is the item's description (aria-describedby), kept
            out of its name so the item is still called by its label. */}
        {reason && (
          <span id={reasonId} className={styles.reason} aria-hidden="true">
            {reason}
          </span>
        )}
      </span>
    </>
  );
  const shared = {
    role: "menuitem",
    tabIndex: -1,
    variant: "quiet",
    className,
    "aria-disabled": item.isDisabled || undefined,
    "aria-describedby": reason ? reasonId : undefined,
    "data-label": item.label,
  } as const;
  if (item.href && !item.isDisabled)
    return (
      <Button
        {...shared}
        to={item.href}
        replace={item.replace}
        onClick={() => onChoose(item, true)}
      >
        {content}
      </Button>
    );
  return (
    <Button
      {...shared}
      onClick={() => {
        if (!item.isDisabled) onChoose(item, false);
      }}
    >
      {content}
    </Button>
  );
}

interface PanelProps {
  id: string;
  label: string;
  items: StudioMenuItem[];
  placement: StudioMenuPlacement;
  anchorPoint: StudioMenuAnchorPoint | null;
  triggerRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
  returnFocusRef?: RefObject<HTMLElement | null>;
  restoreFocusRef: RefObject<HTMLElement | null>;
  focusEdgeRef: RefObject<"first" | "last">;
  /** Opened by a press (mouse, pen or finger): the first item takes focus
   *  without its ring, until a key is pressed inside the menu. */
  isPointerOpened: boolean;
  onClose: (shouldReturnFocus: boolean) => void;
}

/** A scroll that moved the context menu's row away from its point: the
 *  page itself, or a container holding the row. A shelf, the lyrics or a
 *  chat scrolling somewhere else leaves the menu open. */
function isScrollOfAnchor(target: EventTarget | null, anchor: Element | null) {
  if (
    target === document ||
    target === document.scrollingElement ||
    target === document.documentElement ||
    target === document.body
  )
    return true;
  return (
    target instanceof Element && anchor !== null && target.contains(anchor)
  );
}

/** Whether the trigger still shows at its centre: a top bar sliding over it
 *  or a scroll out of the viewport hides it. The panel itself counts as
 *  showing it, since a clamped panel on a small screen may sit over its
 *  trigger. Without elementFromPoint (jsdom) it always shows. */
function isTriggerVisible(trigger: HTMLElement, panel: HTMLElement) {
  if (typeof document.elementFromPoint !== "function") return true;
  const triggerBounds = trigger.getBoundingClientRect();
  const hitNode = document.elementFromPoint(
    triggerBounds.left + triggerBounds.width / 2,
    triggerBounds.top + triggerBounds.height / 2,
  );
  if (!hitNode) return false;
  return trigger.contains(hitNode) || panel.contains(hitNode);
}

/** Places the panel against its trigger or point, then follows a resize and
 *  a change in its own size. A trigger menu follows a scroll until its
 *  trigger is covered or scrolled away, then closes; a context menu closes
 *  on a scroll that carries its row away. */
function useMenuPosition(
  panelRef: RefObject<HTMLDivElement | null>,
  triggerRef: RefObject<HTMLElement | null>,
  anchorPoint: StudioMenuAnchorPoint | null,
  placement: StudioMenuPlacement,
  onScrollAway: () => void,
  returnFocusRef?: RefObject<HTMLElement | null>,
): StudioMenuPosition | null {
  const [position, setPosition] = useState<StudioMenuPosition | null>(null);
  const onScrollAwayRef = useRef(onScrollAway);
  useEffect(() => {
    onScrollAwayRef.current = onScrollAway;
  });
  const pointX = anchorPoint?.x ?? null;
  const pointY = anchorPoint?.y ?? null;
  const pointSource = anchorPoint ? (anchorPoint.source ?? "mouse") : null;
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const point =
      pointX !== null && pointY !== null ? { x: pointX, y: pointY } : null;
    const isPoint = point !== null;
    const isRtl = getComputedStyle(panel).direction === "rtl";
    let insets = measureViewportInsets();
    // The row a context menu belongs to: the caller's focus target, else
    // what lies under the point (the panel is still hidden, so it is not
    // hit).
    const pointAnchor = point
      ? (returnFocusRef?.current ??
        document.elementFromPoint?.(point.x, point.y) ??
        null)
      : null;
    const place = () => {
      const anchor = point
        ? pointRect(point)
        : triggerRef.current?.getBoundingClientRect();
      if (!anchor) return;
      // The natural height, whatever max-height the last pass set; offset
      // sizes ignore the entrance scale.
      const borders = panel.offsetHeight - panel.clientHeight;
      const next = placeStudioMenu({
        anchor,
        menuWidth: panel.offsetWidth,
        menuHeight: panel.scrollHeight + borders,
        placement,
        pointSource: isPoint ? (pointSource ?? "mouse") : null,
        isRtl,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        insets,
      });
      setPosition((previous) =>
        isSamePosition(previous, next) ? previous : next,
      );
    };
    const onResize = () => {
      insets = measureViewportInsets();
      place();
    };
    // Capture: the trigger may sit in a scrolling column. The panel's own
    // scroll (a long menu on a short screen) is neither.
    const onScroll = (event: Event) => {
      if (event.target instanceof Node && panel.contains(event.target)) return;
      if (!isPoint) {
        const trigger = triggerRef.current;
        if (trigger && !isTriggerVisible(trigger, panel))
          onScrollAwayRef.current();
        else place();
      } else if (isScrollOfAnchor(event.target, pointAnchor))
        onScrollAwayRef.current();
    };
    place();
    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    resizeObserver?.observe(panel);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [
    panelRef,
    triggerRef,
    returnFocusRef,
    pointX,
    pointY,
    pointSource,
    placement,
  ]);
  return position;
}

function StudioMenuPanel({
  id,
  label,
  items,
  placement,
  anchorPoint,
  triggerRef,
  panelRef,
  returnFocusRef,
  restoreFocusRef,
  focusEdgeRef,
  isPointerOpened,
  onClose,
}: PanelProps) {
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const [hasUsedKeys, setHasUsedKeys] = useState(false);
  const position = useMenuPosition(
    panelRef,
    triggerRef,
    anchorPoint,
    placement,
    () => onClose(false),
    returnFocusRef,
  );
  useStudioMenuKeys(panelRef, {
    onEscape: () => onClose(true),
    onTab: () => onClose(true),
    onFocusLeave: (next) => {
      if (next !== triggerRef.current) onClose(false);
    },
  });
  // Focus goes back on close to the caller's target, else the trigger, else
  // whatever had focus when a context menu opened. Then the first (or, opened with
  // ArrowUp, the last) item takes focus. It waits for the first placement:
  // the panel is visibility hidden until then, and a hidden item takes no
  // focus.
  const isPlaced = position !== null;
  useEffect(() => {
    if (!isPresent || !isPlaced) return;
    const active = document.activeElement;
    restoreFocusRef.current =
      returnFocusRef?.current ??
      triggerRef.current ??
      (active instanceof HTMLElement && active !== document.body
        ? active
        : null);
    const menuItems =
      panelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
    const target =
      focusEdgeRef.current === "last"
        ? menuItems?.[menuItems.length - 1]
        : menuItems?.[0];
    target?.focus({ preventScroll: true });
  }, [
    isPresent,
    isPlaced,
    panelRef,
    triggerRef,
    returnFocusRef,
    restoreFocusRef,
    focusEdgeRef,
  ]);

  const fade = reducedMotion ? { duration: 0.12 } : STUDIO_FADE;
  return (
    <m.div
      ref={panelRef}
      id={id}
      role="menu"
      aria-label={label}
      className={styles.menu}
      data-align={position?.isAlignedStart ? "start" : undefined}
      data-placement={position?.isFlippedUp ? "up" : undefined}
      data-opened-by={isPointerOpened && !hasUsedKeys ? "pointer" : undefined}
      // Any key inside the menu brings the focus ring back, so an arrow
      // press after a tap shows where focus is.
      onKeyDown={() => setHasUsedKeys(true)}
      style={{
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        maxHeight: position?.maxHeight,
        transformOrigin: position?.transformOrigin,
        visibility: position ? undefined : "hidden",
        pointerEvents: isPresent ? undefined : "none",
      }}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: reducedMotion ? fade : { ...STUDIO_SPRING, opacity: fade },
      }}
      exit={{
        opacity: 0,
        scale: reducedMotion ? 1 : 0.96,
        transition: reducedMotion ? fade : STUDIO_EXIT,
      }}
    >
      {items.map((item) =>
        isSeparator(item) ? (
          <div key={item.id} role="separator" className={styles.separator} />
        ) : (
          <StudioMenuEntry
            key={item.id}
            item={item}
            onChoose={(chosen, isLink) => {
              // Focus is back on the opener before the action runs, so a
              // dialog the action opens hands focus back to it on close.
              onClose(!isLink);
              chosen.onSelect();
            }}
          />
        ),
      )}
    </m.div>
  );
}

/** Studio's one menu: a trigger menu (pass `trigger`) or a context menu
 *  (pass `anchorPoint`, trigger null). It portals to the body, springs open
 *  from the corner nearest its anchor and keeps inside the viewport above
 *  the player bar and the tab bar. Arrows, Home, End and type-ahead move
 *  focus; Escape, Tab, a press outside and focus leaving close it, and
 *  Escape hands focus back. */
export function StudioMenu({
  trigger,
  label,
  items,
  anchorPoint = null,
  isOpen,
  onOpenChange,
  placement = "bottom-end",
  returnFocusRef,
}: StudioMenuProps) {
  const menuId = useId();
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  const isControlled = isOpen !== undefined;
  const isMenuOpen =
    isOpen ?? (trigger === null ? anchorPoint !== null : isOpenInternal);
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const focusEdgeRef = useRef<"first" | "last">("first");
  const [isTriggerPressOpen, setIsTriggerPressOpen] = useState(false);
  // A press opens without the first item's focus ring; Enter, Space, an
  // arrow on the trigger or the keyboard's context-menu key keep it.
  const isPointerOpened = trigger
    ? isTriggerPressOpen
    : anchorPoint !== null && anchorPoint.source !== "keyboard";

  const setMenuOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setIsOpenInternal(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );
  // Escape, focus leaving and an outside press can all land on one close:
  // only the first one counts.
  const isMenuOpenRef = useRef(isMenuOpen);
  useEffect(() => {
    isMenuOpenRef.current = isMenuOpen;
  }, [isMenuOpen]);
  const close = useCallback(
    (shouldReturnFocus: boolean) => {
      if (!isMenuOpenRef.current) return;
      isMenuOpenRef.current = false;
      setMenuOpen(false);
      const target = restoreFocusRef.current;
      if (shouldReturnFocus && target?.isConnected)
        target.focus({ preventScroll: true });
    },
    [setMenuOpen],
  );
  useOutsideDismiss(isMenuOpen, panelRef, () => close(false), {
    additionalInsideRef: triggerRef,
  });
  // The trigger's own ref (a caller that holds one) still gets the node.
  const ownRef = (trigger?.props as TriggerProps | undefined)?.ref;
  const setTriggerNode = useCallback(
    (node: HTMLElement | null) => {
      triggerRef.current = node;
      assignRef(ownRef, node);
    },
    [ownRef],
  );

  let triggerElement: ReactNode = null;
  if (trigger) {
    const typedTrigger = trigger as ReactElement<TriggerProps>;
    const { onClick, onKeyDown } = typedTrigger.props;
    // eslint-disable-next-line react-hooks/refs -- the handlers read the refs only when the trigger is pressed, never during render
    triggerElement = cloneElement(typedTrigger, {
      ref: setTriggerNode,
      "aria-haspopup": "menu",
      "aria-expanded": isMenuOpen,
      "aria-controls": isMenuOpen ? menuId : undefined,
      onClick: (event: MouseEvent<HTMLElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        focusEdgeRef.current = "first";
        if (isMenuOpen) close(true);
        else {
          // A click from Enter or Space carries no press count.
          setIsTriggerPressOpen(event.detail > 0);
          setMenuOpen(true);
        }
      },
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        onKeyDown?.(event);
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        event.preventDefault();
        focusEdgeRef.current = event.key === "ArrowUp" ? "last" : "first";
        setIsTriggerPressOpen(false);
        setMenuOpen(true);
      },
    });
  }

  return (
    <>
      {triggerElement}
      {createPortal(
        <AnimatePresence>
          {isMenuOpen && (
            <StudioMenuPanel
              key="menu"
              id={menuId}
              label={label}
              items={items}
              placement={placement}
              anchorPoint={anchorPoint}
              triggerRef={triggerRef}
              panelRef={panelRef}
              returnFocusRef={returnFocusRef}
              restoreFocusRef={restoreFocusRef}
              focusEdgeRef={focusEdgeRef}
              isPointerOpened={isPointerOpened}
              onClose={close}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
