import type { PointerEvent as ReactPointerEvent } from "react";
import {
  FiAlertCircle,
  FiAperture,
  FiFilm,
  FiLayers,
  FiX,
} from "react-icons/fi";
import type { VjClipDTO, VjSceneDTO } from "../../../../shared/contracts/vj";
import { IconButton } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { VjOrderRow } from "./VjOrderRow";
import type { VjSetlistSlot } from "./vjSetlistSlots";
import { vjSceneSummaryOf } from "./vjSceneSummary";
import styles from "./VjSetlists.module.css";

const THUMB_SIZE = 32;

export interface VjSetlistItemRowProps {
  slot: VjSetlistSlot;
  /** The scene this spot plays; undefined once the scene left the library. */
  scene: VjSceneDTO | undefined;
  setlistName: string;
  clipsById: ReadonlyMap<string, VjClipDTO>;
  /** The row's index in the set list, from 0. */
  position: number;
  total: number;
  isDragging: boolean;
  gripProps: { onPointerDown: (event: ReactPointerEvent) => void };
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

/** The scene's source clip thumbnail, or a quiet mark for what it plays. */
function ItemThumb({
  scene,
  clipsById,
}: {
  scene: VjSceneDTO | undefined;
  clipsById: ReadonlyMap<string, VjClipDTO>;
}) {
  if (scene === undefined) {
    return (
      <span className={styles.thumb} aria-hidden="true">
        <FiAlertCircle fill="none" focusable="false" />
      </span>
    );
  }
  const { source } = vjSceneSummaryOf(scene.look, clipsById);
  const thumbnailUrl = source.kind === "clip" ? source.thumbnailUrl : null;
  return (
    <span className={styles.thumb} aria-hidden="true">
      {thumbnailUrl !== null ? (
        <img
          src={thumbnailUrl}
          width={THUMB_SIZE}
          height={THUMB_SIZE}
          alt=""
          loading="lazy"
          decoding="async"
        />
      ) : source.kind === "generator" ? (
        <FiAperture fill="none" focusable="false" />
      ) : source.kind === "keepsLive" ? (
        <FiLayers fill="none" focusable="false" />
      ) : (
        <FiFilm fill="none" focusable="false" />
      )}
    </span>
  );
}

/**
 * One spot in a set list: its number, the scene's thumbnail and name, and a
 * remove button. A scene that left the library reads as deleted until the
 * next read of the set lists drops the spot.
 */
export function VjSetlistItemRow({
  slot,
  scene,
  setlistName,
  clipsById,
  position,
  total,
  isDragging,
  gripProps,
  onMove,
  onRemove,
}: VjSetlistItemRowProps) {
  const { t } = useTranslation();
  const sceneName = scene?.name ?? t("vj:setlistItems.sceneGone");

  return (
    <VjOrderRow
      position={position}
      total={total}
      isDragging={isDragging}
      gripProps={gripProps}
      moveUpLabel={t("vj:setlistItems.moveUp", { scene: sceneName })}
      moveDownLabel={t("vj:setlistItems.moveDown", { scene: sceneName })}
      onMove={onMove}
    >
      <span className={styles.itemNumber} aria-hidden="true">
        {position + 1}
      </span>
      <ItemThumb scene={scene} clipsById={clipsById} />
      <span
        className={styles.itemName}
        data-gone={scene === undefined ? "true" : undefined}
        data-slot={slot.key}
      >
        {sceneName}
      </span>
      <IconButton
        className={styles.itemRemove}
        aria-label={t("vj:setlistItems.remove", {
          scene: sceneName,
          setlist: setlistName,
        })}
        tooltip={t("vj:setlistItems.removeTooltip")}
        onClick={onRemove}
      >
        <FiX aria-hidden="true" fill="none" focusable="false" />
      </IconButton>
    </VjOrderRow>
  );
}
