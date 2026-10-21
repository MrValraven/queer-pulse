import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import {
  FOCUSABLE_SELECTOR,
  POPUP_SELECTOR,
  ROW_ATTRIBUTE,
  ROW_FOCUS_ATTRIBUTE,
  sweepRowTabOrder,
  useStudioTrackListSweep,
} from "./studioTrackListSweep";

/** The drag type a track row carries; drop targets (rail playlists, the
 *  queue) read `{ trackId }` JSON from it. */
export const STUDIO_TRACK_DRAG_TYPE = "application/x-studio-track";

/** The title link, which a selecting row's click flips like its body. */
const ROW_TITLE_ATTRIBUTE = "data-studio-row-title";
const CONTROL_SELECTOR = "a[href], button, input, label, [role='menuitem']";
/** Controls that use Left and Right themselves. */
const OWN_ARROWS_SELECTOR =
  "input:not([type='checkbox']), textarea, select, [role='slider'], [contenteditable='true']";
/** How long after the Menu key or Shift+F10 the browser's own contextmenu
 *  event is taken as the same press. */
const KEYBOARD_MENU_ECHO_MS = 500;

export interface StudioTrackRowEventHandlers {
  /** Plays the row; null when it cannot play. */
  onPlay: (() => void) | null;
  /** Null when the row sits outside a selectable list. */
  onToggleSelect: ((withShift: boolean) => void) | null;
  onSelectAll: (() => void) | null;
  isSelecting: boolean;
  onOpenMenuAt: ((point: { x: number; y: number }) => void) | null;
  /** The JSON a drag carries; null when the row is not a drag source. */
  dragPayload: string | null;
  dragUrl: string | null;
}

/** An event from a portalled child (a row's open menu) bubbles through
 *  React's tree but is not the row's. */
export function isFromOwnRow(event: {
  currentTarget: EventTarget | null;
  target: EventTarget | null;
}): boolean {
  const row = event.currentTarget;
  return row instanceof Node && row.contains(event.target as Node);
}

function rowControls(rowElement: HTMLElement): HTMLElement[] {
  return Array.from(
    rowElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => !element.closest(POPUP_SELECTOR));
}

function focusNeighbourRow(rowElement: HTMLElement, key: string) {
  const list = rowElement.parentElement;
  if (!list) return;
  const liveRows = `:scope > [${ROW_ATTRIBUTE}]:not([data-exiting])`;
  const targets = Array.from(
    list.querySelectorAll<HTMLElement>(`${liveRows} [${ROW_FOCUS_ATTRIBUTE}]`),
  );
  const ownTarget = rowElement.querySelector<HTMLElement>(
    `[${ROW_FOCUS_ATTRIBUTE}]`,
  );
  const currentIndex = ownTarget ? targets.indexOf(ownTarget) : -1;
  const nextIndex =
    key === "Home"
      ? 0
      : key === "End"
        ? targets.length - 1
        : currentIndex + (key === "ArrowDown" ? 1 : -1);
  targets[Math.max(0, Math.min(targets.length - 1, nextIndex))]?.focus();
}

function focusSiblingControl(rowElement: HTMLElement, step: 1 | -1) {
  const controls = rowControls(rowElement);
  const active = document.activeElement as HTMLElement | null;
  const currentIndex = active ? controls.indexOf(active) : -1;
  if (currentIndex === -1) return;
  const nextIndex = Math.max(
    0,
    Math.min(controls.length - 1, currentIndex + step),
  );
  controls[nextIndex]?.focus();
}

function keyboardMenuPoint(rowElement: HTMLElement) {
  const anchor =
    rowElement.querySelector<HTMLElement>(`[${ROW_FOCUS_ATTRIBUTE}]`) ??
    rowElement;
  const rect = anchor.getBoundingClientRect();
  return { x: rect.left, y: rect.bottom };
}

/** Arrows rove; Enter and Space act natively on whatever holds focus. */
function handleRowKeyDown(
  event: KeyboardEvent,
  rowElement: HTMLElement,
  handlers: StudioTrackRowEventHandlers,
  markKeyboardMenu: () => void,
) {
  const target = event.target as HTMLElement;
  if (!rowElement.contains(target) || target.closest(POPUP_SELECTOR)) return;
  if (event.altKey) return;
  const hasCommand = event.metaKey || event.ctrlKey;
  const isMenuKey =
    event.key === "ContextMenu" || (event.shiftKey && event.key === "F10");
  if (isMenuKey && handlers.onOpenMenuAt) {
    event.preventDefault();
    markKeyboardMenu();
    handlers.onOpenMenuAt(keyboardMenuPoint(rowElement));
  } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
    if (hasCommand || target.closest(OWN_ARROWS_SELECTOR)) return;
    event.preventDefault();
    focusNeighbourRow(rowElement, event.key);
  } else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
    if (hasCommand || target.closest(OWN_ARROWS_SELECTOR)) return;
    event.preventDefault();
    focusSiblingControl(rowElement, event.key === "ArrowRight" ? 1 : -1);
  } else if (
    handlers.isSelecting &&
    handlers.onSelectAll &&
    hasCommand &&
    event.key.toLowerCase() === "a"
  ) {
    event.preventDefault();
    handlers.onSelectAll();
  }
}

function handleRowClick(
  event: MouseEvent,
  rowElement: HTMLElement,
  handlers: StudioTrackRowEventHandlers,
) {
  const target = event.target as HTMLElement;
  if (!rowElement.contains(target) || target.closest(POPUP_SELECTOR)) return;
  if (!handlers.onToggleSelect) return;
  const control = target.closest(CONTROL_SELECTOR);
  if (handlers.isSelecting) {
    // The checkbox and the row buttons answer for themselves; the title
    // and the quiet area flip the row.
    if (control && !control.hasAttribute(ROW_TITLE_ATTRIBUTE)) return;
    event.preventDefault();
    handlers.onToggleSelect(event.shiftKey);
    return;
  }
  // Outside selection mode, Shift, Cmd or Ctrl on the row's quiet area
  // starts it; on a link those keys keep their browser meaning.
  if (control) return;
  if (event.shiftKey || event.metaKey || event.ctrlKey) {
    event.preventDefault();
    handlers.onToggleSelect(event.shiftKey);
  }
}

function attachDragSource(
  rowElement: HTMLElement,
  handlersRef: RefObject<StudioTrackRowEventHandlers>,
) {
  const onDragStart = (event: DragEvent) => {
    const { dragPayload, dragUrl } = handlersRef.current;
    if (!dragPayload || !event.dataTransfer) return;
    event.dataTransfer.setData(STUDIO_TRACK_DRAG_TYPE, dragPayload);
    if (dragUrl) {
      event.dataTransfer.setData("text/uri-list", dragUrl);
      event.dataTransfer.setData("text/plain", dragUrl);
    }
    // Copy onto a rail playlist; a playlist's own reorder handle may move.
    event.dataTransfer.effectAllowed = "copyMove";
    event.dataTransfer.setDragImage(rowElement, 20, 20);
    rowElement.setAttribute("data-dragging", "true");
  };
  const onDragEnd = () => rowElement.removeAttribute("data-dragging");
  rowElement.addEventListener("dragstart", onDragStart);
  rowElement.addEventListener("dragend", onDragEnd);
  return () => {
    rowElement.removeEventListener("dragstart", onDragStart);
    rowElement.removeEventListener("dragend", onDragEnd);
  };
}

/** The row's native listeners: arrow-key roving, the keyboard menu, click
 *  to select, double-click to play and the drag source. Native, because the
 *  row is a list item and React's handlers on it would read as interactions
 *  on a non-interactive element. Returns `isKeyboardMenuEcho`, true for the
 *  browser's contextmenu event that trails the Menu key or Shift+F10. */
export function useStudioTrackRowEvents(
  rowRef: RefObject<HTMLElement | null>,
  handlers: StudioTrackRowEventHandlers,
  isDragAllowed: boolean,
) {
  const handlersRef = useRef(handlers);
  const keyboardMenuAtRef = useRef(0);
  useLayoutEffect(() => {
    handlersRef.current = handlers;
  });
  useStudioTrackListSweep(rowRef);

  useEffect(() => {
    const rowElement = rowRef.current;
    if (!rowElement) return;
    sweepRowTabOrder(rowElement);
    const markKeyboardMenu = () => {
      keyboardMenuAtRef.current = performance.now();
    };
    const onKeyDown = (event: KeyboardEvent) =>
      handleRowKeyDown(
        event,
        rowElement,
        handlersRef.current,
        markKeyboardMenu,
      );
    const onClick = (event: MouseEvent) =>
      handleRowClick(event, rowElement, handlersRef.current);
    const onDoubleClick = (event: MouseEvent) => {
      const current = handlersRef.current;
      const target = event.target as HTMLElement;
      if (current.isSelecting || !current.onPlay) return;
      if (!rowElement.contains(target)) return;
      if (target.closest(`${CONTROL_SELECTOR}, ${POPUP_SELECTOR}`)) return;
      current.onPlay();
    };
    const detachDrag = attachDragSource(rowElement, handlersRef);
    rowElement.addEventListener("keydown", onKeyDown);
    rowElement.addEventListener("click", onClick);
    rowElement.addEventListener("dblclick", onDoubleClick);
    return () => {
      detachDrag();
      rowElement.removeEventListener("keydown", onKeyDown);
      rowElement.removeEventListener("click", onClick);
      rowElement.removeEventListener("dblclick", onDoubleClick);
    };
  }, [rowRef]);

  // Touch drags would fight the scroll and the long press, so only a fine
  // pointer that hovers gets a draggable row.
  const isDraggable = handlers.dragPayload !== null && isDragAllowed;
  useEffect(() => {
    const rowElement = rowRef.current;
    if (rowElement) rowElement.draggable = isDraggable;
  }, [rowRef, isDraggable]);

  return {
    isKeyboardMenuEcho: () =>
      performance.now() - keyboardMenuAtRef.current < KEYBOARD_MENU_ECHO_MS,
  };
}
