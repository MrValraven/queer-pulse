import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "motion/react";
import { FiCheckSquare, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { MAIN_CONTENT_ID } from "../../../shared/components/layout/SkipToContentLink";
import { Button, IconButton, Tooltip } from "../../../shared/components/ui";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { mediaMax } from "../../../shared/theme/breakpoints";
import { STUDIO_EXIT, STUDIO_SPRING } from "../studioMotion";
import type { StudioRowSelection } from "./useStudioRowSelection";
import { useStudioSelectionBarKeys } from "./useStudioSelectionBarKeys";
import css from "./StudioSelectionBar.module.css";

export interface StudioSelectionAction {
  id: string;
  /** A direct verb and its object: "Add to queue", "Unlike songs". */
  label: string;
  /** A react-icons element, `aria-hidden`. */
  icon: ReactNode;
  /** Gets the picked ids in list order. Clear the selection here when the
   *  action is done with it. */
  onRun: (ids: string[]) => void;
  tone?: "default" | "danger";
}

interface StudioSelectionBarProps {
  selection: StudioRowSelection;
  actions: StudioSelectionAction[];
}

/** A mouse wheel turned over the actions strip scrolls it sideways, so a
 *  mouse reaches an action past its end (a trackpad already swipes). The
 *  page stays put while the strip still has room to travel. */
function scrollStripByWheel(event: WheelEvent) {
  const strip = event.currentTarget;
  if (!(strip instanceof HTMLElement)) return;
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
  const isRtl = getComputedStyle(strip).direction === "rtl";
  const step = isRtl ? -event.deltaY : event.deltaY;
  const before = strip.scrollLeft;
  strip.scrollLeft += step;
  if (strip.scrollLeft !== before) event.preventDefault();
}

type ScrollEdges = "start" | "end" | "both" | undefined;

const BAR_MAX_WIDTH = 980;

/** The widest the bar may grow over <main>: its max-width, or main less the
 *  bar's 16px side margins (StudioSelectionBar.module.css). */
function barRoomOverMain(): number {
  const main = document.getElementById(MAIN_CONTENT_ID);
  const mainWidth = main?.getBoundingClientRect().width ?? window.innerWidth;
  return Math.min(BAR_MAX_WIDTH, mainWidth - 32);
}

/** Which ends of the actions strip have more actions past them, so the strip
 *  fades there, and whether the actions show their icons only. They do when
 *  their names would not fit over <main> (a tablet beside the open rail);
 *  the names come back once main has grown by what they overflowed by, so
 *  the switch never flickers. Read on scroll and whenever the strip, its
 *  content or main resizes; RTL scrolls negative, so the distance is taken
 *  absolute. */
function useActionStrip(stripRef: RefObject<HTMLDivElement | null>) {
  const [edges, setEdges] = useState<ScrollEdges>(undefined);
  const [isCompact, setIsCompact] = useState(false);
  const compactAtRef = useRef<{ room: number; overflow: number } | null>(null);
  const measure = useCallback(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const travelled = Math.abs(strip.scrollLeft);
    const room = strip.scrollWidth - strip.clientWidth;
    const hasStart = travelled > 1;
    const hasEnd = room - travelled > 1;
    setEdges(
      hasStart && hasEnd
        ? "both"
        : hasStart
          ? "start"
          : hasEnd
            ? "end"
            : undefined,
    );
    const compactAt = compactAtRef.current;
    const barRoom = barRoomOverMain();
    if (!compactAt && room > 1) {
      compactAtRef.current = { room: barRoom, overflow: room };
      setIsCompact(true);
    } else if (compactAt && barRoom >= compactAt.room + compactAt.overflow) {
      compactAtRef.current = null;
      setIsCompact(false);
    }
  }, [stripRef]);
  // Before paint, so the first frame is already compact and never overflows.
  useLayoutEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    measure();
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    observer?.observe(strip);
    for (const child of Array.from(strip.children)) observer?.observe(child);
    const main = document.getElementById(MAIN_CONTENT_ID);
    if (main) observer?.observe(main);
    // Not passive, so a wheel the strip takes leaves the page where it is.
    strip.addEventListener("wheel", scrollStripByWheel, { passive: false });
    return () => {
      observer?.disconnect();
      strip.removeEventListener("wheel", scrollStripByWheel);
    };
  }, [stripRef, measure]);
  return { edges, measure, isCompact };
}

/** The bar is portalled to the body, so it centres itself on the page's
 *  <main> (clear of the Studio rail, open, folded or gone) by reading main's
 *  edges into two custom properties. Main resizes with the rail's
 *  animation, so the bar follows it. */
function useBarOverMain(
  barRef: RefObject<HTMLDivElement | null>,
  isOpen: boolean,
) {
  useLayoutEffect(() => {
    const bar = barRef.current;
    const main = document.getElementById(MAIN_CONTENT_ID);
    if (!isOpen || !bar || !main) return;
    const place = () => {
      const rect = main.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      bar.style.setProperty("--bar-left", `${Math.max(0, rect.left)}px`);
      bar.style.setProperty(
        "--bar-right",
        `${Math.max(0, viewportWidth - rect.right)}px`,
      );
    };
    place();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    observer?.observe(main);
    window.addEventListener("resize", place);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", place);
    };
  }, [barRef, isOpen]);
}

function StudioSelectionBarPanel({
  selection,
  actions,
}: StudioSelectionBarProps) {
  const { t } = useTranslation();
  const count = selection.orderedSelectedIds.length;
  const isEmpty = count === 0;
  const stripRef = useRef<HTMLDivElement>(null);
  const { edges, measure, isCompact } = useActionStrip(stripRef);
  const isIconOnly = useMediaQuery(mediaMax("mobile")) || isCompact;
  return (
    <>
      <span className={css.count} role="status">
        {isEmpty ? (
          t("studio:selection.prompt")
        ) : (
          <>
            {/* Phones show the short count; the full one is still read. */}
            <span className={css.countFull}>
              {t("studio:selection.count", { count })}
            </span>
            <span className={css.countCompact} aria-hidden="true">
              {t("studio:selection.countCompact", { count })}
            </span>
          </>
        )}
        {/* Said with the first pick, then kept out of each count update. */}
        {count <= 1 && (
          <span className={css.srOnly}>
            {` ${t("studio:selection.keyboardHint")}`}
          </span>
        )}
      </span>
      {/* Icon-only at every width, so the list's own actions keep the room;
          the tooltip names it for a mouse, the label for everyone. */}
      <IconButton
        size="sm"
        className={css.action}
        aria-label={t("studio:selection.selectAll")}
        tooltip
        aria-disabled={selection.isAllSelected || undefined}
        onClick={() => {
          if (!selection.isAllSelected) selection.selectAll();
        }}
      >
        <FiCheckSquare aria-hidden />
      </IconButton>
      <div
        ref={stripRef}
        className={css.actions}
        data-scroll-edges={edges}
        data-compact={isIconOnly || undefined}
        onScroll={measure}
      >
        {actions.map((action) => (
          // Below --mobile, or when their names would not fit, the actions
          // show their icons only, and the tooltip (drawn outside the
          // scrolling strip) names each one.
          <Tooltip
            key={action.id}
            label={action.label}
            placement="floating-top"
            isDisabled={!isIconOnly}
          >
            <Button
              variant="quiet"
              size="sm"
              className={[css.action, action.tone === "danger" && css.danger]
                .filter(Boolean)
                .join(" ")}
              aria-disabled={isEmpty || undefined}
              onClick={() => {
                if (!isEmpty) action.onRun(selection.orderedSelectedIds);
              }}
            >
              {action.icon}
              <span className={css.actionLabel}>{action.label}</span>
            </Button>
          </Tooltip>
        ))}
      </div>
      <IconButton
        size="sm"
        className={css.clear}
        aria-label={t("studio:selection.clear")}
        onClick={selection.clear}
      >
        <FiX aria-hidden />
      </IconButton>
    </>
  );
}

/** The floating bar of a list in selection mode: how many rows are picked,
 *  Select all, the list's bulk actions and Clear selection. It springs up
 *  above the player bar (and the phone tab bar and the consent banner),
 *  portalled to the body so no scrolling container clips it. F6 or
 *  Alt+Down reaches it from the list, Escape clears the selection, and
 *  focus goes back to the last picked row when selection mode ends. */
export function StudioSelectionBar({
  selection,
  actions,
}: StudioSelectionBarProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const barRef = useRef<HTMLDivElement>(null);
  useStudioSelectionBarKeys(selection, barRef);
  useBarOverMain(barRef, selection.isSelecting);
  const hidden = reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 };
  return createPortal(
    <AnimatePresence>
      {selection.isSelecting && (
        <m.div
          key="selection-bar"
          ref={barRef}
          role="region"
          aria-label={t("studio:selection.regionLabel")}
          className={css.bar}
          initial={hidden}
          animate={{ opacity: 1, y: 0 }}
          exit={{ ...hidden, transition: STUDIO_EXIT }}
          transition={reducedMotion ? { duration: 0.12 } : STUDIO_SPRING}
        >
          <StudioSelectionBarPanel selection={selection} actions={actions} />
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
