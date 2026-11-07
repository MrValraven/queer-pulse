import { useId, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiAlertCircle, FiLayers } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import {
  VJ_LIMITS,
  type VjClipDTO,
  type VjPackDTO,
  type VjSceneDTO,
} from "../../../../shared/contracts/vj";
import {
  Collapse,
  EmptyState,
  SkeletonLine,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useVjSceneMutations } from "../../api/useVjSceneMutations";
import { useVjScenes } from "../../api/useVjScenes";
import { useVjShowCacheWriter } from "../../api/useVjShowCache";
import { vjErrorKeyOf, vjErrorValuesOf, vjReasonOf } from "../../vjErrors";
import { VjReasonLine } from "../../VjReasonLine";
import { useVjListOrder } from "./useVjListOrder";
import { VjSceneRow } from "./VjSceneRow";
import styles from "./VjScenes.module.css";

const FADE_SECONDS = 0.2;
const SKELETON_ROW_COUNT = 3;
const SKELETON_ROW_HEIGHT = 56;

export interface VjScenePanelProps {
  packs: readonly VjPackDTO[];
  clipsById: ReadonlyMap<string, VjClipDTO>;
}

/** One body of the panel, faded in and out as the read settles. */
function VjSceneFade({ children }: { children: ReactNode }) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : FADE_SECONDS }}
    >
      {children}
    </m.div>
  );
}

/** The ordered scenes, the move announcement and a refused order's reason.
 *  Scenes are made on the remote, so the empty state points there. */
function VjSceneList({
  scenes,
  packs,
  clipsById,
}: VjScenePanelProps & { scenes: VjSceneDTO[] }) {
  const { t } = useTranslation();
  const { reorderScenes } = useVjSceneMutations();
  const cache = useVjShowCacheWriter();
  const {
    orderedItems,
    moveBy,
    draggingIndex,
    gripHandlers,
    listRef,
    error,
    status,
  } = useVjListOrder<VjSceneDTO>({
    items: scenes,
    idOf: (scene) => scene.id,
    save: async (sceneIds) => {
      try {
        await reorderScenes.mutateAsync({ sceneIds });
      } catch (cause) {
        // The list hook goes back to the cached order on a refusal; a
        // mismatch means another tab added or removed a scene, so read the
        // list again before the next move.
        if (vjReasonOf(cause) === "VJ_SCENE_REORDER_MISMATCH") {
          cache.invalidateScenes();
        }
        throw cause;
      }
    },
    statusOf: (scene, newIndex) =>
      t("vj:libraryScenes.movedStatus", {
        name: scene.name,
        position: newIndex + 1,
      }),
  });
  const total = orderedItems.length;

  return (
    <>
      <ol
        ref={listRef}
        className={styles.rows}
        aria-label={t("vj:libraryScenes.listLabel")}
      >
        <AnimatePresence initial={false}>
          {orderedItems.map((scene, sceneIndex) => (
            <VjSceneRow
              key={scene.id}
              scene={scene}
              packs={packs}
              clipsById={clipsById}
              position={sceneIndex}
              total={total}
              isDragging={draggingIndex === sceneIndex}
              gripProps={gripHandlers(sceneIndex)}
              onMove={(direction) => moveBy(sceneIndex, direction)}
            />
          ))}
        </AnimatePresence>
      </ol>
      <Collapse isOpen={scenes.length === 0}>
        <EmptyState
          compact
          icon={<FiLayers aria-hidden="true" fill="none" focusable="false" />}
          title={t("vj:libraryScenes.emptyTitle")}
          description={t("vj:libraryScenes.emptyBody")}
        />
      </Collapse>
      <p role="status" className="visuallyHidden">
        {status ?? ""}
      </p>
      <VjReasonLine error={error} />
    </>
  );
}

function VjSceneSkeleton() {
  return (
    <div className={styles.skeletonRows} aria-hidden="true">
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, rowIndex) => (
        <SkeletonLine key={rowIndex} height={SKELETON_ROW_HEIGHT} />
      ))}
    </div>
  );
}

/**
 * The library's Scenes panel: every saved scene in its order, with rename,
 * move to a pack, reorder (drag or up and down) and delete. Scenes are made
 * on the remote; the look itself is edited there too.
 */
export function VjScenePanel({ packs, clipsById }: VjScenePanelProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const scenesQuery = useVjScenes();
  const scenes = scenesQuery.data;
  const isRetrying = scenesQuery.isFetching;
  const bodyKey =
    scenes !== undefined ? "list" : scenesQuery.isError ? "error" : "loading";

  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <header className={styles.header}>
        <div className={styles.headingRow}>
          <h2 id={headingId} className={styles.heading}>
            {t("vj:libraryScenes.heading")}
          </h2>
          {scenes === undefined ? null : (
            <span className={styles.count}>
              {t("vj:libraryScenes.count", {
                count: scenes.length,
                max: VJ_LIMITS.scenesMax,
              })}
            </span>
          )}
        </div>
        <p className={styles.intro}>{t("vj:libraryScenes.intro")}</p>
      </header>
      <AnimatePresence mode="wait" initial={false}>
        {bodyKey === "list" && scenes !== undefined ? (
          <VjSceneFade key="list">
            <VjSceneList scenes={scenes} packs={packs} clipsById={clipsById} />
          </VjSceneFade>
        ) : bodyKey === "error" ? (
          <VjSceneFade key="error">
            <EmptyState
              compact
              icon={<FiAlertCircle aria-hidden="true" fill="none" />}
              title={t("vj:libraryScenes.loadErrorTitle")}
              description={
                <span role="alert">
                  {t(
                    vjErrorKeyOf(scenesQuery.error),
                    vjErrorValuesOf(scenesQuery.error),
                  )}
                </span>
              }
              action={{
                label: t("vj:libraryScenes.retry"),
                onClick: isRetrying
                  ? undefined
                  : () => void scenesQuery.refetch(),
                isBusy: isRetrying,
              }}
            />
          </VjSceneFade>
        ) : (
          <VjSceneFade key="loading">
            <VjSceneSkeleton />
          </VjSceneFade>
        )}
      </AnimatePresence>
    </section>
  );
}
