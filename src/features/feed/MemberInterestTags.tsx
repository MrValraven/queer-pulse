import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./MemberInterestTags.module.css";
import { useInterestTagsFold } from "./useInterestTagsFold";

/** How many folded chips get their own step in the fade-in cascade. Past
 *  this they all share the last step, so a long list does not trail. */
const FOLD_STAGGER_MAX_STEPS = 6;

interface InterestChip {
  label: string;
  isShared: boolean;
}

/** The interests the viewer also lists come first, then the rest in the
 *  member's own order. Matching ignores case and keeps the member's spelling,
 *  and a repeat (in any casing) shows once. */
function orderInterests(
  interests: string[],
  sharedInterests: string[] = [],
): InterestChip[] {
  const sharedKeys = new Set(
    sharedInterests.map((interest) => interest.trim().toLowerCase()),
  );
  const seenKeys = new Set<string>();
  const sharedChips: InterestChip[] = [];
  const otherChips: InterestChip[] = [];
  interests.forEach((interest) => {
    const label = interest.trim();
    const key = label.toLowerCase();
    if (!label || seenKeys.has(key)) return;
    seenKeys.add(key);
    const isShared = sharedKeys.has(key);
    (isShared ? sharedChips : otherChips).push({ label, isShared });
  });
  return [...sharedChips, ...otherChips];
}

/** Sub-pixel slack, so a row that fits exactly is not folded by rounding. */
const FIT_TOLERANCE_PX = 0.5;

/** How many chips fit on one line. When they all fit, all of them; otherwise
 *  as many as fit beside the "+N" chip. Never fewer than one: a single chip
 *  too long for the column shrinks and ellipsises instead of vanishing. */
function countChipsThatFit(
  chipWidths: number[],
  moreChipWidth: number,
  gap: number,
  availableWidth: number,
): number {
  const allChipsWidth =
    chipWidths.reduce((sum, width) => sum + width, 0) +
    gap * Math.max(0, chipWidths.length - 1);
  if (allChipsWidth <= availableWidth + FIT_TOLERANCE_PX) {
    return chipWidths.length;
  }
  let usedWidth = moreChipWidth;
  let fitCount = 0;
  for (const width of chipWidths) {
    if (usedWidth + gap + width > availableWidth + FIT_TOLERANCE_PX) break;
    usedWidth += gap + width;
    fitCount += 1;
  }
  return Math.max(1, fitCount);
}

/**
 * Measures how many chips fit on one line, without ever measuring the row it
 * renders (see the comment on `MemberInterestTags` for why that cannot loop).
 * `measureKey` changes when the chip list does, which re-measures.
 * `isPaused` holds the last answer while a fold runs, so a resize mid-fold
 * cannot move the line between shown and folded chips under the animation;
 * the fold's end re-measures.
 */
function useChipsThatFit(
  chipCount: number,
  measureKey: string,
  isPaused: boolean,
) {
  const widthProbeRef = useRef<HTMLDivElement>(null);
  const measureRowRef = useRef<HTMLDivElement>(null);
  const [fitCount, setFitCount] = useState(chipCount);

  useLayoutEffect(() => {
    const widthProbe = widthProbeRef.current;
    const measureRow = measureRowRef.current;
    if (!widthProbe || !measureRow || isPaused) return;
    const measure = () => {
      const availableWidth = widthProbe.getBoundingClientRect().width;
      // Zero before layout (jsdom, a card not rendered yet): keep the last
      // answer and wait for the observer's next entry.
      if (availableWidth <= 0) return;
      const measuredItems = Array.from(measureRow.children);
      const moreChip = measuredItems.pop();
      const gap = parseFloat(getComputedStyle(measureRow).columnGap) || 0;
      setFitCount(
        countChipsThatFit(
          measuredItems.map((item) => item.getBoundingClientRect().width),
          moreChip?.getBoundingClientRect().width ?? 0,
          gap,
          availableWidth,
        ),
      );
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(widthProbe);
    observer.observe(measureRow);
    return () => observer.disconnect();
  }, [measureKey, isPaused]);

  return {
    widthProbeRef,
    measureRowRef,
    fitCount: Math.min(fitCount, chipCount),
  };
}

/**
 * A member's interests on one calm line. Interests the viewer shares lead,
 * tinted jade, with "in common" spoken for screen readers. The rest stay
 * quiet. Whatever does not fit folds into a "+N" chip that opens the full,
 * wrapped list in place and then reads "Show less".
 *
 * The fit is measured on two elements the visible row never changes:
 * - a zero-height width probe in normal flow, whose width comes from the card
 *   column alone (the masonry hook observes its own probe for the same
 *   reason), and
 * - a clipped, invisible copy of every chip plus a sample "+N", laid out at
 *   their natural widths, which only resizes when the chips or the font do.
 * Rendering fewer or more chips touches neither, so a new count can never
 * feed the observer another entry, and an unchanged count is a no-op state
 * update React skips.
 *
 * Opening and closing fold the row's height like the bio above it does (see
 * `useInterestTagsFold`), with the folded chips fading in and out; the
 * measurement holds still while a fold runs.
 */
export function MemberInterestTags({
  interests,
  sharedInterests,
}: {
  interests: string[];
  sharedInterests?: string[];
}) {
  const { t } = useTranslation();
  const rowId = useId();
  const { rowRef, isExpanded, foldPhase, toggle } = useInterestTagsFold();
  const isFolding = foldPhase !== "idle";
  const chips = orderInterests(interests, sharedInterests);
  const measureKey = chips
    .map((chip) => `${chip.isShared ? "+" : "-"}${chip.label}`)
    .join("\n");
  const { widthProbeRef, measureRowRef, fitCount } = useChipsThatFit(
    chips.length,
    measureKey,
    isFolding,
  );

  if (chips.length === 0) return null;
  const hiddenCount = chips.length - fitCount;
  const hasOverflow = hiddenCount > 0;
  // A closing fold keeps the full, wrapped list until it settles, so the row
  // only returns to its one-line "+N" layout once the height is back to one
  // line and nothing moves mid-fold.
  const isShowingAll = !hasOverflow || isExpanded || isFolding;
  const visibleChips = isShowingAll ? chips : chips.slice(0, fitCount);

  const renderChip = (
    chip: InterestChip,
    isMeasureCopy: boolean,
    chipIndex = 0,
  ) => {
    // The chips the fold reveals and hides: they fade in one after another
    // (capped, so a long list does not trail) and out together.
    const isFoldedChip = !isMeasureCopy && hasOverflow && chipIndex >= fitCount;
    const foldStep = Math.min(chipIndex - fitCount, FOLD_STAGGER_MAX_STEPS);
    return (
      <span
        key={chip.label}
        className={[
          styles.chip,
          chip.isShared && styles.shared,
          isFoldedChip && styles.folded,
        ]
          .filter(Boolean)
          .join(" ")}
        style={
          isFoldedChip
            ? ({ "--interest-tags-fold-step": foldStep } as CSSProperties)
            : undefined
        }
        title={isMeasureCopy ? undefined : chip.label}
      >
        {chip.label}
        {chip.isShared && !isMeasureCopy && (
          <span className="visuallyHidden">
            {" "}
            {t("feed:memberCard.tags.inCommon")}
          </span>
        )}
      </span>
    );
  };

  return (
    <div className={styles.tags}>
      <div ref={widthProbeRef} className={styles.widthProbe} />
      <div
        id={rowId}
        ref={rowRef}
        className={[styles.row, isShowingAll && hasOverflow && styles.wrapped]
          .filter(Boolean)
          .join(" ")}
        data-folding={isFolding ? foldPhase : undefined}
        // Keeps the feed's masonry columns still while the row folds.
        data-masonry-hold={isFolding ? "" : undefined}
      >
        {visibleChips.map((chip, chipIndex) =>
          renderChip(chip, false, chipIndex),
        )}
        {hasOverflow && (
          <button
            key="toggle"
            type="button"
            className={styles.more}
            aria-expanded={isExpanded}
            aria-controls={rowId}
            aria-label={
              isExpanded
                ? undefined
                : t("feed:memberCard.tags.moreAria", { count: hiddenCount })
            }
            onClick={toggle}
          >
            {isExpanded
              ? t("feed:memberCard.tags.less")
              : t("feed:memberCard.tags.more", { count: hiddenCount })}
          </button>
        )}
      </div>
      <div className={styles.measureClip} aria-hidden="true">
        <div ref={measureRowRef} className={styles.measureRow}>
          {chips.map((chip) => renderChip(chip, true))}
          <span className={styles.more}>
            {t("feed:memberCard.tags.more", { count: chips.length })}
          </span>
        </div>
      </div>
    </div>
  );
}
