import {
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { FiPlay } from "react-icons/fi";
import { LuQuote } from "react-icons/lu";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { StudioSyncedLyricView } from "../../api/studio.adapters";
import { StudioMenu, type StudioMenuItem } from "../../kit/StudioMenu";
import {
  useStudioContextMenu,
  type StudioContextMenuPoint,
} from "../../kit/useStudioContextMenu";
import { studioLyricTarget } from "../../share/studioLinkTarget";
import { useStudioLyricShareHost } from "../../share/studioLyricShareHostContext";

/** The track whose lines can be shared (PRD-13). Left out (the timing
 *  tool's preview, a private preview, a transcript) the lines carry no
 *  share action. */
export interface StudioLyricShareSource {
  trackId: string;
  /** The track's title, for the share sheet and the picker. */
  title: string;
  /** "Play from this line": seek to the line's start and play on. */
  playFromLine: (lineStartMs: number) => void;
}

/** The handlers `useStudioLyricShare` adds to the list, to merge with the
 *  list's own (it already listens for a pointer down). */
export interface StudioLyricShareListHandlers {
  onContextMenu?: (event: ReactMouseEvent<HTMLElement>) => void;
  onPointerDown?: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp?: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel?: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove?: (event: ReactPointerEvent<HTMLElement>) => void;
}

interface LyricMenuAsk {
  lineIndex: number;
  point: StudioContextMenuPoint;
}

/** The text line under an event, or null for a gap or the list's padding. */
function textLineIndexAt(
  target: EventTarget,
  lines: readonly StudioSyncedLyricView[],
): number | null {
  if (!(target instanceof Element)) return null;
  const row = target.closest("[data-line-index]");
  if (!row) return null;
  const lineIndex = Number(row.getAttribute("data-line-index"));
  return lines[lineIndex]?.text ? lineIndex : null;
}

/**
 * Right-click and long-press on a lyric line open a small menu with "Share
 * lyric" and "Play from this line"; the round button on the focused (or
 * hovered) line opens the share sheet straight away. The sheet lives in the
 * nearest `StudioLyricShareHost`, so it outlasts a track change; without a
 * host the lines offer no share. The sheet sends the lyric link only (track,
 * line index, start), never the words.
 */
export function useStudioLyricShare({
  source,
  lines,
  listRef,
}: {
  source: StudioLyricShareSource | undefined;
  lines: readonly StudioSyncedLyricView[];
  listRef: RefObject<HTMLOListElement | null>;
}): {
  isShareable: boolean;
  /** The line whose sheet is open, so its opener stays mounted. */
  sharedLineIndex: number | null;
  listHandlers: StudioLyricShareListHandlers;
  shareLine: (lineIndex: number, returnFocusElement?: HTMLElement) => void;
  overlays: ReactNode;
} {
  const { t } = useTranslation();
  const host = useStudioLyricShareHost();
  const activeSource = host ? source : undefined;
  const [menuAsk, setMenuAsk] = useState<LyricMenuAsk | null>(null);
  const pressedLineRef = useRef<number | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const lineButtonOf = (lineIndex: number) =>
    listRef.current?.querySelector<HTMLElement>(
      `[data-line-index="${lineIndex}"] button`,
    ) ?? null;
  const contextMenu = useStudioContextMenu((point) => {
    const lineIndex = pressedLineRef.current;
    if (lineIndex === null) return;
    returnFocusRef.current = lineButtonOf(lineIndex);
    setMenuAsk({ lineIndex, point });
  });
  const shareLine = (lineIndex: number, returnFocusElement?: HTMLElement) => {
    const line = lines[lineIndex];
    if (!host || !activeSource || !line?.text) return;
    host.openLyricShare({
      target: studioLyricTarget(activeSource.trackId, lineIndex, line.ms),
      title: activeSource.title,
      returnFocusElement: returnFocusElement ?? lineButtonOf(lineIndex),
    });
  };
  const sharedTarget = host?.sharedTarget ?? null;
  const sharedLineIndex =
    activeSource && sharedTarget?.id === activeSource.trackId
      ? (sharedTarget.lineIndex ?? null)
      : null;
  const menuLineIndex = menuAsk?.lineIndex ?? null;
  const items: StudioMenuItem[] =
    menuLineIndex === null || !activeSource
      ? []
      : [
          {
            id: "share-lyric",
            label: t("studio:player.lyrics.shareLine"),
            icon: <LuQuote />,
            onSelect: () => shareLine(menuLineIndex),
          },
          {
            id: "play-from-line",
            label: t("studio:player.lyrics.playFromLine"),
            icon: <FiPlay />,
            onSelect: () => {
              const line = lines[menuLineIndex];
              if (line) activeSource.playFromLine(line.ms);
            },
          },
        ];
  // Only a press on a text line asks for the menu; a gap or the padding
  // keeps the list's own behaviour.
  const listHandlers: StudioLyricShareListHandlers = activeSource
    ? {
        onContextMenu: (event) => {
          pressedLineRef.current = textLineIndexAt(event.target, lines);
          if (pressedLineRef.current !== null) contextMenu.onContextMenu(event);
        },
        onPointerDown: (event) => {
          pressedLineRef.current = textLineIndexAt(event.target, lines);
          if (pressedLineRef.current !== null) contextMenu.onPointerDown(event);
        },
        onPointerUp: contextMenu.onPointerUp,
        onPointerCancel: contextMenu.onPointerCancel,
        onPointerMove: contextMenu.onPointerMove,
      }
    : {};
  const overlays = activeSource ? (
    <StudioMenu
      trigger={null}
      label={t("studio:player.lyrics.lineMenuLabel")}
      items={items}
      anchorPoint={menuAsk?.point ?? null}
      isOpen={menuAsk !== null}
      returnFocusRef={returnFocusRef}
      onOpenChange={(isNowOpen) => {
        if (!isNowOpen) setMenuAsk(null);
      }}
    />
  ) : null;
  return {
    isShareable: activeSource !== undefined,
    sharedLineIndex,
    listHandlers,
    shareLine,
    overlays,
  };
}
