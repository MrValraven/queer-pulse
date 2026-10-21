import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiArrowDown, FiMoreHorizontal } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { StudioSyncedLyricView } from "../../api/studio.adapters";
import { StudioLyricShareButton } from "./StudioLyricShareButton";
import {
  useStudioLyricShare,
  type StudioLyricShareSource,
} from "./useStudioLyricShare";
import { useLyricFollow } from "./useLyricFollow";
import { useLyricRoving } from "./useLyricRoving";
import styles from "./StudioSyncedLyrics.module.css";

/** Timed lyrics with the current line lit and centred (spec 7.5). Shared by
 *  Now playing, the track page and the timing tool's preview.
 *  `isInPageFlow` marks a list that scrolls with the page (the track page):
 *  its box is capped to the space between the topbar and the player bar,
 *  the line centres in the part of the box on screen, and "Back to current
 *  line" sticks above the player bar while the box runs past it.
 *  `share` (PRD-13) gives each line "Share lyric": a right-click or long
 *  press opens the line's menu, and a round button sits beside the focused
 *  or hovered line. It needs a `StudioLyricShareHost` above it. */
export function StudioSyncedLyrics({
  lines,
  activeIndex,
  onSeekLine,
  label,
  isInPageFlow = false,
  share,
}: {
  lines: readonly StudioSyncedLyricView[];
  activeIndex: number | null;
  onSeekLine: (ms: number) => void;
  label: string;
  isInPageFlow?: boolean;
  share?: StudioLyricShareSource;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const {
    listRef,
    isFollowing,
    resumeFollowing,
    resumeAndFocusActive,
    userScrollHandlers,
  } = useLyricFollow(activeIndex, { isInPageFlow });
  const { tabStopIndex, setRovingIndex } = useLyricRoving(
    listRef,
    lines,
    activeIndex,
  );
  const seekLine = (index: number) => {
    const line = lines[index];
    if (!line) return;
    onSeekLine(line.ms);
    resumeFollowing();
  };
  const lyricShare = useStudioLyricShare({ source: share, lines, listRef });
  const { isShareable } = lyricShare;
  // The share button sits on the focused line only (it never follows the
  // current line), and on the line a mouse hovers. The line whose sheet is
  // open keeps its button, so focus has somewhere to go back to.
  const [focusedLineIndex, setFocusedLineIndex] = useState<number | null>(null);
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  const shareLineIndex = lyricShare.sharedLineIndex ?? focusedLineIndex;
  return (
    <div
      className={styles.root}
      data-page-flow={isInPageFlow ? "" : undefined}
      data-shareable={isShareable ? "" : undefined}
    >
      <ol
        ref={listRef}
        className={styles.list}
        aria-label={label}
        data-player-keys="own-arrows"
        {...userScrollHandlers}
        {...lyricShare.listHandlers}
        onPointerDown={(event) => {
          userScrollHandlers.onPointerDown(event);
          lyricShare.listHandlers.onPointerDown?.(event);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setFocusedLineIndex(null);
        }}
      >
        {lines.map((line, index) =>
          line.text ? (
            <li
              key={`${line.ms}-${index}`}
              data-line-index={index}
              onFocus={
                isShareable ? () => setFocusedLineIndex(index) : undefined
              }
              onPointerEnter={
                isShareable
                  ? (event) => {
                      if (event.pointerType === "mouse")
                        setHoveredLineIndex(index);
                    }
                  : undefined
              }
              onPointerLeave={
                isShareable
                  ? () =>
                      setHoveredLineIndex((hovered) =>
                        hovered === index ? null : hovered,
                      )
                  : undefined
              }
            >
              <Button
                variant="quiet"
                className={styles.line}
                tabIndex={index === tabStopIndex ? 0 : -1}
                onFocus={() => setRovingIndex(index)}
                data-past={
                  activeIndex !== null && index < activeIndex ? "" : undefined
                }
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => seekLine(index)}
              >
                {line.text}
              </Button>
              {isShareable && (
                <StudioLyricShareButton
                  isShown={
                    index === shareLineIndex || index === hoveredLineIndex
                  }
                  isFocusable={index === shareLineIndex}
                  onShare={(button) => lyricShare.shareLine(index, button)}
                />
              )}
            </li>
          ) : (
            <li
              key={`${line.ms}-${index}`}
              data-line-index={index}
              className={styles.gap}
              aria-hidden="true"
            >
              <FiMoreHorizontal />
            </li>
          ),
        )}
      </ol>
      <AnimatePresence>
        {!isFollowing && activeIndex !== null && (
          <m.span
            key="back"
            className={styles.back}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: reducedMotion ? 0 : 0.18, ease: "easeOut" }}
          >
            <Button
              variant="quiet"
              size="sm"
              className={styles.backButton}
              onClick={resumeAndFocusActive}
            >
              <FiArrowDown aria-hidden />
              {t("studio:player.lyrics.backToCurrent")}
            </Button>
          </m.span>
        )}
      </AnimatePresence>
      {lyricShare.overlays}
    </div>
  );
}
