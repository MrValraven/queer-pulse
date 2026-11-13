import { useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  FiAlertCircle,
  FiAperture,
  FiChevronDown,
  FiFilm,
  FiLayers,
  FiX,
} from "react-icons/fi";
import type {
  VjClipDTO,
  VjSceneDTO,
  VjStepDuration,
} from "../../../../shared/contracts/vj";
import { Button, Collapse, IconButton } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { VjOrderRow } from "./VjOrderRow";
import { VjStepDurationPicker } from "./VjStepDurationPicker";
import { vjStepDurationTextOf, type VjSetlistSlot } from "./vjSetlistSlots";
import { vjSceneSummaryOf } from "./vjSceneSummary";
import styles from "./VjSetlists.module.css";

const THUMB_SIZE = 32;

export interface VjSetlistItemRowProps {
  slot: VjSetlistSlot;
  /** The scene a scene step plays; undefined once it left the library, and
   *  on a clip step. */
  scene: VjSceneDTO | undefined;
  /** The clip a clip step plays; undefined once it left the library, and on
   *  a scene step. */
  clip: VjClipDTO | undefined;
  /** The name the row and its buttons speak: the scene name or clip title. */
  stepName: string;
  setlistName: string;
  clipsById: ReadonlyMap<string, VjClipDTO>;
  /** The sequence default, which a step on its default length plays. */
  defaultDuration: VjStepDuration;
  /** The row's index in the sequence, from 0. */
  position: number;
  total: number;
  isDragging: boolean;
  gripProps: { onPointerDown: (event: ReactPointerEvent) => void };
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  /** A new length for this step, or null for the sequence default. */
  onDurationChange: (duration: VjStepDuration | null) => void;
}

function ThumbImage({ url }: { url: string }) {
  return (
    <img
      src={url}
      width={THUMB_SIZE}
      height={THUMB_SIZE}
      alt=""
      loading="lazy"
      decoding="async"
    />
  );
}

/** The step's thumbnail: the clip's own, the scene's source clip, or a quiet
 *  mark for what the scene plays. A step whose target left reads as gone. */
function ItemThumb({
  slot,
  scene,
  clip,
  clipsById,
}: Pick<VjSetlistItemRowProps, "slot" | "scene" | "clip" | "clipsById">) {
  if (slot.kind === "clip") {
    return (
      <span className={styles.thumb} aria-hidden="true">
        {clip === undefined ? (
          <FiAlertCircle fill="none" focusable="false" />
        ) : (
          <ThumbImage url={clip.thumbnailUrl} />
        )}
      </span>
    );
  }
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
        <ThumbImage url={thumbnailUrl} />
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
 * One step of a sequence: its number, kind, thumbnail and name, its length
 * and a remove button. The length button folds the length picker open under
 * the step's name, inside the row. Coral on the length button means the step
 * has its own length; an open picker shows through the turned chevron and a
 * tint. A step whose scene or clip left the library reads as gone until
 * the next read of the sequences drops it.
 */
export function VjSetlistItemRow({
  slot,
  scene,
  clip,
  stepName,
  setlistName,
  clipsById,
  defaultDuration,
  position,
  total,
  isDragging,
  gripProps,
  onMove,
  onRemove,
  onDurationChange,
}: VjSetlistItemRowProps) {
  const { t } = useTranslation();
  const [isLengthOpen, setIsLengthOpen] = useState(false);
  const isGone =
    slot.kind === "clip" ? clip === undefined : scene === undefined;
  const lengthText =
    slot.duration === null
      ? t("vj:setlistItems.lengthDefault", {
          length: vjStepDurationTextOf(defaultDuration, t),
        })
      : vjStepDurationTextOf(slot.duration, t);
  const lengthLabel = t("vj:setlistItems.lengthLabel", { step: stepName });

  return (
    <VjOrderRow
      position={position}
      total={total}
      isDragging={isDragging}
      gripProps={gripProps}
      moveUpLabel={t("vj:setlistItems.moveUp", { step: stepName })}
      moveDownLabel={t("vj:setlistItems.moveDown", { step: stepName })}
      onMove={onMove}
    >
      <span className={styles.itemNumber} aria-hidden="true">
        {position + 1}
      </span>
      <ItemThumb slot={slot} scene={scene} clip={clip} clipsById={clipsById} />
      <div className={styles.itemBody}>
        <span className={styles.itemText}>
          <span
            className={styles.itemName}
            data-gone={isGone ? "true" : undefined}
          >
            {stepName}
          </span>
          <span className={styles.itemKind}>
            {slot.kind === "clip"
              ? t("vj:setlistItems.kindClip")
              : t("vj:setlistItems.kindScene")}
          </span>
        </span>
        <Button
          variant="quiet"
          size="sm"
          className={styles.itemLengthToggle}
          aria-expanded={isLengthOpen}
          data-custom={slot.duration === null ? undefined : "true"}
          onClick={() => setIsLengthOpen((wasOpen) => !wasOpen)}
        >
          <span className="visuallyHidden">{lengthLabel}: </span>
          {lengthText}
          <FiChevronDown
            className={styles.itemLengthChevron}
            aria-hidden="true"
            fill="none"
            focusable="false"
          />
        </Button>
        {/* The picker folds open under the name, above the row's divider,
            so it reads as part of this step. */}
        <Collapse isOpen={isLengthOpen} className={styles.itemLength}>
          <VjStepDurationPicker
            className={styles.itemLengthPicker}
            label={lengthLabel}
            value={slot.duration}
            defaultDuration={defaultDuration}
            onChange={onDurationChange}
          />
        </Collapse>
      </div>
      <IconButton
        className={styles.itemRemove}
        aria-label={t("vj:setlistItems.remove", {
          step: stepName,
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
