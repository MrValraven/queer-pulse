import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "motion/react";
import { FiCheckSquare, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button, IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
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

type ScrollEdges = "start" | "end" | "both" | undefined;

/** Which ends of the actions strip have more actions past them, so the strip
 *  fades there. Read on scroll and whenever the strip or its content
 *  resizes; RTL scrolls negative, so the distance is taken absolute. */
function useScrollEdges(stripRef: RefObject<HTMLDivElement | null>) {
  const [edges, setEdges] = useState<ScrollEdges>(undefined);
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
  }, [stripRef]);
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    measure();
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    observer?.observe(strip);
    for (const child of Array.from(strip.children)) observer?.observe(child);
    return () => observer?.disconnect();
  }, [stripRef, measure]);
  return { edges, measure };
}

function StudioSelectionBarPanel({
  selection,
  actions,
}: StudioSelectionBarProps) {
  const { t } = useTranslation();
  const count = selection.orderedSelectedIds.length;
  const isEmpty = count === 0;
  const stripRef = useRef<HTMLDivElement>(null);
  const { edges, measure } = useScrollEdges(stripRef);
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
      <Button
        variant="quiet"
        size="sm"
        className={css.action}
        aria-disabled={selection.isAllSelected || undefined}
        onClick={() => {
          if (!selection.isAllSelected) selection.selectAll();
        }}
      >
        <FiCheckSquare aria-hidden className={css.selectAllIcon} />
        <span className={css.actionLabel}>
          {t("studio:selection.selectAll")}
        </span>
      </Button>
      <div
        ref={stripRef}
        className={css.actions}
        data-scroll-edges={edges}
        onScroll={measure}
      >
        {actions.map((action) => (
          <Button
            key={action.id}
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
