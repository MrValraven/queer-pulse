/**
 * The dock's effect pads row (design 7, plan R15). On a phone it is one band
 * that scrolls sideways (52px, 72px in the pads variant; `touch-action:
 * pan-x`, so a sideways drag never scrolls the page, and a press that turns
 * into a scroll is cancelled by the press machine), with an end fade while
 * pads hide past its end edge. In the split layout it is a grid that fills
 * the column's free height, 3 or 2 columns, whichever gives pads closer to
 * a 0.8 height-to-width shape while every row keeps its floor. Strobe comes
 * first, then one pad per dock id in order, then All effects, which spans
 * the rest of the last grid row. Pads enter, leave and reorder with a short
 * fade, scale and glide. Sizes live in VjPads.module.css.
 */
import { AnimatePresence, m } from "motion/react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { FiGrid } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import {
  vjEffectSettingOf,
  type VjEffectId,
  type VjEffects,
} from "../../../../shared/contracts/vj";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { VjPadId } from "../rules/vjDockPads";
import { VjEffectPad, type VjPadSendHandler } from "./VjEffectPad";
import type { VjPadSettingSend } from "./VjPadTuner";
import { VjStrobePad } from "./VjStrobePad";
import { useVjShortLabel, VJ_ALL_EFFECTS_SHORT_KEY } from "./vjPadLabel";
import styles from "./VjPads.module.css";

/** The app's base duration (--dur-base) and ease (--ease). */
const VJ_PAD_TRANSITION = {
  duration: 0.25,
  ease: [0.22, 0.68, 0.16, 1] as const,
};
const VJ_PAD_INSTANT = { duration: 0 };
/** The split grid's columns before the first measure, and its fallback. */
const VJ_PAD_DEFAULT_COLUMNS = 3;
/** The column counts the split grid picks from, the default first. */
const VJ_PAD_COLUMN_CHOICES = [3, 2] as const;
/** The pad shape the split grid aims for: height over width. */
const VJ_PAD_TARGET_RATIO = 0.8;

/**
 * How many grid columns the All effects tile spans: the rest of the last row
 * after `padCount` pads, or a whole row when the pads fill theirs. It counts
 * the pads themselves, since a leaving pad stays in the DOM while it fades.
 */
function vjLibrarySpanOf(padCount: number, columns: number): number {
  return columns - (padCount % columns);
}

/** True when the pads fill their last row, so All effects gets a row of its own. */
function vjIsLibraryAloneOf(padCount: number, columns: number): boolean {
  return padCount % columns === 0;
}

/**
 * The split grid's rows when the All effects tile sits alone in the last
 * row: the pad rows share the free height and the tile's row takes its
 * content height (a compact bar). Undefined when the tile shares a row with
 * pads, so every row shares the height (VjPads.module.css).
 */
function vjSplitRowsOf(padCount: number, columns: number): string | undefined {
  if (!vjIsLibraryAloneOf(padCount, columns)) return undefined;
  const padRowCount = Math.ceil(padCount / columns);
  return `repeat(${padRowCount}, minmax(var(--vj-pad-height), 1fr)) auto`;
}

/** The split grid's box and the sizes its rows are built from, in px. */
interface VjPadGridMeasure {
  width: number;
  height: number;
  /** The variant's row floor (`--vj-pad-height`). */
  rowFloor: number;
  gap: number;
  /** The compact All effects bar (`--tap-min`). */
  barHeight: number;
}

/** The height each pad row gets in `measure` with `columns` columns. */
function vjPadRowHeightOf(
  padCount: number,
  columns: number,
  measure: VjPadGridMeasure,
): number {
  const padRowCount = Math.ceil(padCount / columns);
  if (vjIsLibraryAloneOf(padCount, columns)) {
    const padRowsHeight =
      measure.height - measure.barHeight - measure.gap * padRowCount;
    return padRowsHeight / padRowCount;
  }
  return (measure.height - measure.gap * (padRowCount - 1)) / padRowCount;
}

/**
 * The column count whose pads come closest to the target shape while every
 * row stays at or above the floor; the default when only it fits. While the
 * pads overflow the column, the grid measures as tall as its rows, so a
 * 2-column grid at its floor reads as wide slabs and goes back to 3.
 */
function vjSplitColumnsOf(padCount: number, measure: VjPadGridMeasure): number {
  let bestColumns: number = VJ_PAD_DEFAULT_COLUMNS;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const columns of VJ_PAD_COLUMN_CHOICES) {
    const rowHeight = vjPadRowHeightOf(padCount, columns, measure);
    if (rowHeight < measure.rowFloor - 0.5) continue;
    const columnWidth = (measure.width - measure.gap * (columns - 1)) / columns;
    const distance = Math.abs(rowHeight / columnWidth - VJ_PAD_TARGET_RATIO);
    if (distance < bestDistance) {
      bestColumns = columns;
      bestDistance = distance;
    }
  }
  return bestColumns;
}

/** The split grid's measure from its box and computed style, or null before layout. */
function vjPadGridMeasureOf(row: HTMLElement): VjPadGridMeasure | null {
  const style = getComputedStyle(row);
  const measure = {
    width: row.clientWidth,
    height: row.clientHeight,
    rowFloor: parseFloat(style.getPropertyValue("--vj-pad-height")),
    gap: parseFloat(style.rowGap),
    barHeight: parseFloat(style.getPropertyValue("--tap-min")),
  };
  const isMeasured =
    measure.width > 0 &&
    measure.height > 0 &&
    Number.isFinite(measure.rowFloor) &&
    Number.isFinite(measure.gap) &&
    Number.isFinite(measure.barHeight);
  return isMeasured ? measure : null;
}

/**
 * The split grid's column count: 3 or 2, from the grid's own box. It
 * measures once as the grid attaches, before the first paint, so the grid
 * never shows a frame at the default count; the observer follows later
 * size changes. State changes only when the count does (React drops an
 * equal update). Without a measure (jsdom) the count stays 3.
 */
function useVjSplitColumns(
  rowRef: RefObject<HTMLDivElement | null>,
  isSplit: boolean,
  padCount: number,
): number {
  const [columns, setColumns] = useState<number>(VJ_PAD_DEFAULT_COLUMNS);
  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!isSplit || row === null) return undefined;
    const readColumns = () => {
      const measure = vjPadGridMeasureOf(row);
      if (measure !== null) setColumns(vjSplitColumnsOf(padCount, measure));
    };
    readColumns();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(readColumns);
    observer.observe(row);
    return () => observer.disconnect();
  }, [rowRef, isSplit, padCount]);
  return isSplit ? columns : VJ_PAD_DEFAULT_COLUMNS;
}

/**
 * True while the phone band hides pads past its end edge, which turns on
 * the end fade. It reads the scroll position on scroll and whenever the row
 * or a pad changes size (a new pad, a label in another language).
 */
function useVjHasMoreAtEnd(
  rowRef: RefObject<HTMLDivElement | null>,
  isPhone: boolean,
  padCount: number,
): boolean {
  const [hasMoreAtEnd, setHasMoreAtEnd] = useState(false);
  useEffect(() => {
    const row = rowRef.current;
    if (!isPhone || row === null || typeof ResizeObserver === "undefined") {
      return undefined;
    }
    const readScroll = () => {
      // scrollLeft runs negative in right-to-left text, so its size counts.
      const hiddenAtEnd =
        row.scrollWidth - row.clientWidth - Math.abs(row.scrollLeft);
      setHasMoreAtEnd(hiddenAtEnd > 1);
    };
    const observer = new ResizeObserver(readScroll);
    observer.observe(row);
    for (const slot of Array.from(row.children)) observer.observe(slot);
    row.addEventListener("scroll", readScroll, { passive: true });
    return () => {
      observer.disconnect();
      row.removeEventListener("scroll", readScroll);
    };
  }, [rowRef, isPhone, padCount]);
  return isPhone && hasMoreAtEnd;
}

export interface VjPadsRowProps {
  pads: readonly VjEffectId[];
  effects: VjEffects;
  isOnOf: (padId: VjPadId, serverIsOn: boolean) => boolean;
  isPendingOf: (padId: VjPadId) => boolean;
  isBlocked: boolean;
  layout: "phone" | "split";
  stateRevision: number | null;
  onPadSend: VjPadSendHandler;
  setEffectSetting: VjPadSettingSend;
  onOpenLibrary: () => void;
  /** Synced server epoch ms (`clock.serverNow`) for the strobe countdown; Date.now when left out. */
  serverNow?: () => number;
  /** The status line naming why the controls are blocked, for aria-describedby. */
  blockedReasonId?: string;
}

/** One pad's motion wrapper: the button inside keeps its pointer capture.
 *  It takes the ref AnimatePresence's pop layout measures a leaving pad by. */
function VjPadSlot({
  isReducedMotion,
  isLibrarySlot = false,
  librarySpan,
  children,
  ref,
}: {
  isReducedMotion: boolean;
  /** The All effects slot, which spans the rest of the last grid row. */
  isLibrarySlot?: boolean;
  /** The split grid columns the All effects slot spans (`vjLibrarySpanOf`). */
  librarySpan?: number;
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}) {
  const transition = isReducedMotion ? VJ_PAD_INSTANT : VJ_PAD_TRANSITION;
  return (
    <m.div
      ref={ref}
      layout="position"
      className={
        isLibrarySlot ? `${styles.slot} ${styles.allSlot}` : styles.slot
      }
      style={
        librarySpan === undefined
          ? undefined
          : { gridColumn: `span ${librarySpan}` }
      }
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={transition}
    >
      {children}
    </m.div>
  );
}

function VjAllEffectsPad({
  isLabelFull,
  onOpenLibrary,
}: {
  /** A tile two or more grid columns wide shows the full name on its face. */
  isLabelFull: boolean;
  onOpenLibrary: () => void;
}) {
  const { t } = useTranslation();
  const label = t("vj:pads.allEffects");
  // A narrow face shows one short word with the icon; the full name stays the button's name.
  const shortLabel = useVjShortLabel(VJ_ALL_EFFECTS_SHORT_KEY, label);
  return (
    <button
      type="button"
      className={styles.allPad}
      data-vj-pad-all=""
      aria-haspopup="dialog"
      aria-label={label}
      onClick={onOpenLibrary}
    >
      <FiGrid aria-hidden fill="none" className={styles.allIcon} />
      <span className={styles.allName} aria-hidden>
        {isLabelFull ? label : shortLabel}
      </span>
    </button>
  );
}

export function VjPadsRow({
  pads,
  effects,
  isOnOf,
  isPendingOf,
  isBlocked,
  layout,
  stateRevision,
  onPadSend,
  setEffectSetting,
  onOpenLibrary,
  serverNow = Date.now,
  blockedReasonId,
}: VjPadsRowProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const blockedDescription = isBlocked ? blockedReasonId : undefined;
  const rowRef = useRef<HTMLDivElement>(null);
  const isSplit = layout === "split";
  // The strobe pad plus the docked pads come before the All effects tile.
  const padCount = pads.length + 1;
  const columns = useVjSplitColumns(rowRef, isSplit, padCount);
  const hasMoreAtEnd = useVjHasMoreAtEnd(rowRef, !isSplit, padCount);
  const librarySpan = isSplit ? vjLibrarySpanOf(padCount, columns) : undefined;
  const splitStyle = isSplit
    ? {
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridTemplateRows: vjSplitRowsOf(padCount, columns),
      }
    : undefined;
  return (
    <m.div
      ref={rowRef}
      layoutScroll
      role="group"
      aria-label={t("vj:pads.label")}
      className={styles.row}
      data-vj-pads-row=""
      data-layout={layout}
      data-columns={isSplit ? columns : undefined}
      data-has-more-end={hasMoreAtEnd}
      style={splitStyle}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <VjPadSlot key="strobe" isReducedMotion={reducedMotion}>
          <VjStrobePad
            effects={effects}
            isOn={isOnOf("strobe", effects.isStrobing)}
            isPending={isPendingOf("strobe")}
            isBlocked={isBlocked}
            onPadSend={onPadSend}
            serverNow={serverNow}
            describedBy={blockedDescription}
          />
        </VjPadSlot>
        {pads.map((effectId) => {
          const setting = vjEffectSettingOf(effects, effectId);
          return (
            <VjPadSlot key={effectId} isReducedMotion={reducedMotion}>
              <VjEffectPad
                effectId={effectId}
                setting={setting}
                isOn={isOnOf(effectId, setting.isOn)}
                isPending={isPendingOf(effectId)}
                isBlocked={isBlocked}
                stateRevision={stateRevision}
                onPadSend={onPadSend}
                setEffectSetting={setEffectSetting}
                describedBy={blockedDescription}
              />
            </VjPadSlot>
          );
        })}
        <VjPadSlot
          key="allEffects"
          isReducedMotion={reducedMotion}
          isLibrarySlot
          librarySpan={librarySpan}
        >
          <VjAllEffectsPad
            isLabelFull={librarySpan !== undefined && librarySpan >= 2}
            onOpenLibrary={onOpenLibrary}
          />
        </VjPadSlot>
      </AnimatePresence>
    </m.div>
  );
}
