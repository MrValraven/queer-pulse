import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type Ref,
  type RefObject,
} from "react";
import { useMediaQuery } from "../../../shared/hooks";
import { useStudioContextMenu } from "./useStudioContextMenu";
import type { StudioRowSelection } from "./useStudioRowSelection";
import {
  isFromOwnRow,
  useStudioTrackRowEvents,
} from "./useStudioTrackRowEvents";

type MenuPoint = { x: number; y: number };

/** Hands the row element to the caller's ref as well as the row's own. */
function forwardRowElement(
  rowRef: Ref<HTMLLIElement> | undefined,
  element: HTMLLIElement | null,
) {
  if (typeof rowRef === "function") rowRef(element);
  else if (rowRef) rowRef.current = element;
}

interface StudioTrackRowInteractionOptions {
  rowRef?: Ref<HTMLLIElement>;
  selection?: StudioRowSelection;
  selectionId: string;
  isSelecting: boolean;
  hasMenu: boolean;
  /** Null when the row cannot play. */
  onPlay: (() => void) | null;
  /** The `{ trackId }` JSON a drag carries; null when not a drag source. */
  dragPayload: string | null;
  dragUrl: string;
}

/** Everything a row does beyond rendering: the context menu (right-click,
 *  long-press, the Menu key), selection by click and long-press, roving
 *  keys, double-click and the drag source. Handlers ignore events that
 *  bubble up through React from a portalled child, such as the open menu. */
export function useStudioTrackRowInteractions({
  rowRef,
  selection,
  selectionId,
  isSelecting,
  hasMenu,
  onPlay,
  dragPayload,
  dragUrl,
}: StudioTrackRowInteractionOptions) {
  const rowElementRef = useRef<HTMLLIElement | null>(null);
  const setRowElement = useCallback(
    (element: HTMLLIElement | null) => {
      rowElementRef.current = element;
      forwardRowElement(rowRef, element);
    },
    [rowRef],
  );
  const lastPointerTypeRef = useRef("mouse");
  const [menuPoint, setMenuPoint] = useState<MenuPoint | null>(null);
  // The context menu mounts on its first open and stays, so its own exit
  // animation plays; 400 rows never each hold one before they need it.
  const [hasMenuMounted, setHasMenuMounted] = useState(false);
  const openMenu = (point: MenuPoint) => {
    setHasMenuMounted(true);
    setMenuPoint(point);
  };
  // A long press on a selectable list picks the row, as photo grids do;
  // right-click and the keyboard always open the menu.
  const openMenuAt = (point: MenuPoint) => {
    const isTouch = lastPointerTypeRef.current !== "mouse";
    if (selection && isTouch && !isSelecting) selection.start(selectionId);
    else if (hasMenu) openMenu(point);
  };
  const contextMenu = useStudioContextMenu(openMenuAt);
  const isDragAllowed = useMediaQuery("(hover: hover) and (pointer: fine)");

  const { isKeyboardMenuEcho } = useStudioTrackRowEvents(
    rowElementRef,
    {
      onPlay,
      onToggleSelect: selection
        ? (withShift) => selection.toggle(selectionId, withShift)
        : null,
      onSelectAll: selection ? selection.selectAll : null,
      isSelecting,
      onOpenMenuAt: hasMenu ? openMenu : null,
      dragPayload,
      dragUrl,
    },
    isDragAllowed,
  );

  const rowHandlers = {
    onContextMenu: (event: MouseEvent<HTMLLIElement>) => {
      if (!isFromOwnRow(event)) return;
      // The Menu key already opened it; this is the browser's echo.
      if (isKeyboardMenuEcho()) {
        event.preventDefault();
        return;
      }
      contextMenu.onContextMenu(event);
    },
    onPointerDown: (event: PointerEvent<HTMLLIElement>) => {
      if (!isFromOwnRow(event)) return;
      lastPointerTypeRef.current = event.pointerType;
      contextMenu.onPointerDown(event);
    },
    onPointerUp: (event: PointerEvent<HTMLLIElement>) => {
      if (isFromOwnRow(event)) contextMenu.onPointerUp(event);
    },
    onPointerCancel: (event: PointerEvent<HTMLLIElement>) => {
      if (isFromOwnRow(event)) contextMenu.onPointerCancel(event);
    },
    onPointerMove: (event: PointerEvent<HTMLLIElement>) => {
      if (isFromOwnRow(event)) contextMenu.onPointerMove(event);
    },
  };

  // Where focus lands when the context menu closes: the row's Tab stop as
  // it stands at that moment (the play button, the checkbox while
  // selecting, or the title on a hidden or blocked row).
  const focusTargetRef = useMemo<RefObject<HTMLElement | null>>(
    () => ({
      get current() {
        return (
          rowElementRef.current?.querySelector<HTMLElement>(
            "[data-studio-row-focus]",
          ) ?? null
        );
      },
    }),
    [],
  );

  return {
    setRowElement,
    focusTargetRef,
    rowHandlers,
    menuPoint,
    hasMenuMounted,
    closeMenu: () => setMenuPoint(null),
  };
}
