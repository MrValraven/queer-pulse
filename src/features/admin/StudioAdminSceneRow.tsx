import { m } from "motion/react";
import {
  FiArchive,
  FiArrowDown,
  FiArrowUp,
  FiEdit3,
  FiList,
  FiMenu,
  FiRotateCcw,
} from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { tintForId } from "../studio/api/studio.adapters";
import type { AdminStudioSceneDTO } from "./api/studioDiscoveryAdmin.api";
import { useStudioAdminReorderRow } from "./useStudioAdminReorderRow";
import css from "./StudioAdminScenes.module.css";

/** The id a dragged scene carries, kept apart from anything else dropped. */
const SCENE_DRAG_TYPE = "application/x-studio-admin-scene";

/** One scene: cover, name, city, address, counts, and its actions. Active
 *  scenes also move (drag handle, Move up, Move down). */
export function StudioAdminSceneRow({
  scene,
  index,
  count,
  isBusy,
  onMove,
  onDropAt,
  onEdit,
  onManage,
  onSetArchived,
}: {
  scene: AdminStudioSceneDTO;
  index: number;
  count: number;
  isBusy: boolean;
  onMove: (targetIndex: number) => void;
  onDropAt: (draggedSceneId: string) => void;
  onEdit: () => void;
  onManage: () => void;
  onSetArchived: (isArchived: boolean) => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isActive = scene.status === "active";
  // Destructured so the compiler sees the two refs apart from the plain
  // values and handlers read during render.
  const {
    moveUpRef,
    moveDownRef,
    moveUp,
    moveDown,
    isFirst,
    isLast,
    handleProps,
    dropProps,
  } = useStudioAdminReorderRow({
    dragType: SCENE_DRAG_TYPE,
    itemId: scene.id,
    index,
    count,
    isBusy,
    isMovable: isActive,
    onMove,
    onDropAt,
  });

  return (
    <m.li
      layout="position"
      className={css.sceneRow}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.2 }}
      {...dropProps}
    >
      <span
        className={css.dragHandle}
        aria-hidden
        title={t("admin:studioAdmin.dragAria", { name: scene.name })}
        {...handleProps}
      >
        {isActive && <FiMenu />}
      </span>
      <span className={css.thumb}>
        <ImageSlot
          src={scene.coverUrl ?? undefined}
          tint={tintForId(scene.id)}
          width={56}
          height={42}
          radius={8}
          placeholder=""
        />
      </span>
      <div className={css.sceneMain}>
        <span className={css.sceneName}>{scene.name}</span>
        <span className={css.sceneMeta}>
          {scene.city} · /{scene.slug}
        </span>
        <span className={css.sceneMeta}>
          {t("admin:studioAdmin.scenes.releaseCount", {
            count: scene.releaseCount,
          })}
          {" · "}
          {t("admin:studioAdmin.scenes.pinnedCount", {
            count: scene.pinnedEventCount,
          })}
        </span>
      </div>
      <div className={css.sceneActions}>
        {isActive && (
          <>
            <Button
              ref={moveUpRef}
              variant="ghost"
              size="sm"
              aria-label={t("admin:studioAdmin.moveUpAria", {
                name: scene.name,
              })}
              aria-disabled={isBusy || isFirst || undefined}
              onClick={moveUp}
            >
              <FiArrowUp aria-hidden /> {t("admin:studioAdmin.moveUpCta")}
            </Button>
            <Button
              ref={moveDownRef}
              variant="ghost"
              size="sm"
              aria-label={t("admin:studioAdmin.moveDownAria", {
                name: scene.name,
              })}
              aria-disabled={isBusy || isLast || undefined}
              onClick={moveDown}
            >
              <FiArrowDown aria-hidden /> {t("admin:studioAdmin.moveDownCta")}
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          aria-label={t("admin:studioAdmin.scenes.editAria", {
            name: scene.name,
          })}
          onClick={onEdit}
        >
          <FiEdit3 aria-hidden /> {t("admin:studioAdmin.scenes.editCta")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t("admin:studioAdmin.scenes.manageAria", {
            name: scene.name,
          })}
          onClick={onManage}
        >
          <FiList aria-hidden /> {t("admin:studioAdmin.scenes.manageCta")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t(
            isActive
              ? "admin:studioAdmin.scenes.archiveAria"
              : "admin:studioAdmin.scenes.restoreAria",
            { name: scene.name },
          )}
          aria-disabled={isBusy || undefined}
          data-scene-archive
          onClick={() => {
            if (!isBusy) onSetArchived(isActive);
          }}
        >
          {isActive ? <FiArchive aria-hidden /> : <FiRotateCcw aria-hidden />}{" "}
          {t(
            isActive
              ? "admin:studioAdmin.scenes.archiveCta"
              : "admin:studioAdmin.scenes.restoreCta",
          )}
        </Button>
      </div>
    </m.li>
  );
}
