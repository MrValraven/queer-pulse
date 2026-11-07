import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { FiFilm } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import type { VjClipDTO, VjPackDTO } from "../../../shared/contracts/vj";
import { EmptyState, SkeletonCard } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useGridDragReorder } from "../../subprofiles/useGridDragReorder";
import { VjReasonLine } from "../VjReasonLine";
import { VjClipCard } from "./VjClipCard";
import { VjClipDialog } from "./VjClipDialog";
import { useVjClipOrder } from "./useVjClipOrder";
import styles from "./VjClips.module.css";

export interface VjClipGridProps {
  /** The pack on show, or null for All clips. */
  packId: string | null;
  packName: string | null;
  clips: VjClipDTO[];
  packs: VjPackDTO[];
  isLoading: boolean;
}

const EASE = [0.22, 0.68, 0.16, 1] as const;
const SKELETON_COUNT = 6;
const SKELETON_KEYS = Array.from(
  { length: SKELETON_COUNT },
  (_unused, skeletonIndex) => `skeleton-${skeletonIndex}`,
);

/** The clips of one pack in pack order, or every clip in All clips. Inside a
 *  pack the cards reorder by drag or by their earlier and later buttons; any
 *  card opens Edit clip, which closes itself once the clip leaves the list. */
export function VjClipGrid({
  packId,
  packName,
  clips,
  packs,
  isLoading,
}: VjClipGridProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const [editingClipId, setEditingClipId] = useState<string | null>(null);
  const editingClip =
    editingClipId === null
      ? undefined
      : clips.find((clip) => clip.id === editingClipId);
  if (editingClipId !== null && editingClip === undefined && !isLoading) {
    setEditingClipId(null);
  }

  const fade = reducedMotion ? { duration: 0 } : { duration: 0.25, ease: EASE };
  const bodyKey = isLoading ? "loading" : clips.length === 0 ? "empty" : "grid";
  const isPackView = packId !== null;

  return (
    <div className={styles.gridFrame}>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={bodyKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // The skeleton leaves at once, so the cards fade in with no blank
          // frame between.
          exit={{
            opacity: 0,
            transition: bodyKey === "loading" ? { duration: 0 } : fade,
          }}
          transition={fade}
        >
          {bodyKey === "loading" && (
            <div className={styles.grid} aria-busy="true">
              {SKELETON_KEYS.map((skeletonKey) => (
                <SkeletonCard key={skeletonKey} />
              ))}
            </div>
          )}
          {bodyKey === "empty" && (
            <EmptyState
              compact
              headingLevel={3}
              icon={<FiFilm aria-hidden="true" focusable="false" fill="none" />}
              title={t(
                isPackView
                  ? "vj:clips.empty.packTitle"
                  : "vj:clips.empty.libraryTitle",
              )}
              description={t(
                isPackView
                  ? "vj:clips.empty.packBody"
                  : "vj:clips.empty.libraryBody",
              )}
            />
          )}
          {bodyKey === "grid" && (
            <VjClipCards
              packId={packId}
              name={packName ?? t("vj:packs.allClips")}
              clips={clips}
              onEdit={setEditingClipId}
            />
          )}
        </m.div>
      </AnimatePresence>
      <AnimatePresence>
        {editingClip !== undefined && (
          <VjClipDialog
            key={editingClip.id}
            clip={editingClip}
            packs={packs}
            currentPackId={packId}
            onClose={() => setEditingClipId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface VjClipCardsProps {
  packId: string | null;
  name: string;
  clips: VjClipDTO[];
  onEdit: (clipId: string) => void;
}

/** The grid itself, with its order, drag, status line and reason line. */
function VjClipCards({ packId, name, clips, onEdit }: VjClipCardsProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const order = useVjClipOrder(packId, clips);
  const { containerRef, draggingIndex, gripHandlers } = useGridDragReorder(
    order.dragStep,
  );
  const isReorderable = packId !== null;

  // A drag saves once, when it ends.
  const wasDraggingRef = useRef(false);
  const commitDragRef = useRef(order.commitDrag);
  useEffect(() => {
    commitDragRef.current = order.commitDrag;
  });
  useEffect(() => {
    if (draggingIndex !== null) {
      wasDraggingRef.current = true;
      return;
    }
    if (!wasDraggingRef.current) return;
    wasDraggingRef.current = false;
    commitDragRef.current();
  }, [draggingIndex]);

  const layoutTransition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.25, ease: EASE };
  const total = order.orderedClips.length;

  return (
    <>
      <ul
        // The drag hook reads only `children` of its container, which a list
        // has as much as a div does.
        ref={(element) => {
          containerRef.current = element as unknown as HTMLDivElement | null;
        }}
        className={styles.grid}
        aria-label={t("vj:clips.gridLabel", { name })}
      >
        <AnimatePresence initial={false}>
          {order.orderedClips.map((clip, clipIndex) => (
            <m.li
              key={clip.id}
              layout="position"
              className={styles.cardItem}
              data-dragging={draggingIndex === clipIndex || undefined}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{
                ...layoutTransition,
                layout: layoutTransition,
              }}
            >
              <VjClipCard
                clip={clip}
                position={clipIndex}
                total={total}
                isReorderable={isReorderable}
                isDragging={draggingIndex === clipIndex}
                onEdit={() => onEdit(clip.id)}
                onMove={(direction) =>
                  order.move(clipIndex, clipIndex + direction)
                }
                gripProps={gripHandlers(clipIndex)}
              />
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
      <p role="status" className="visuallyHidden">
        {order.status ?? ""}
      </p>
      <VjReasonLine error={order.error} />
    </>
  );
}
