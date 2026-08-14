import {
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type SyntheticEvent,
} from "react";
import { FiRefreshCw } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import { FilterChips } from "./ChipSelect";
import { type CropRect } from "./cropGeometry";
import { useImageReframerState, type FreeformChoiceKey } from "./useImageReframerState";
import styles from "./ImageReframer.module.css";

export interface ImageReframerProps {
  src: string;
  aspect: number | "free";
  aspectLabel: string;
  allowFreeform: boolean;
  minOutput: { width: number; height: number };
  value?: CropRect;
  onChange: (rect: CropRect) => void;
}

/**
 * Pan + zoom reframe control for one image. Renders an overflow-hidden frame
 * at the target crop aspect; the caller's image is positioned/scaled inside it
 * via `cropGeometry`'s pan/zoom math (all owned by `useImageReframerState`).
 * Drag (mouse/touch), wheel, and pinch all adjust the crop; the labeled zoom
 * slider is the primary keyboard control. `onChange` fires with a `CropRect`
 * (fractions of the source image) whenever the crop changes, already clamped
 * to `minOutput`.
 */
export default function ImageReframer({
  src,
  aspect,
  aspectLabel,
  allowFreeform,
  minOutput: { width: minOutputWidth, height: minOutputHeight },
  value,
  onChange,
}: ImageReframerProps) {
  const { t } = useTranslation();
  const {
    frameRef,
    zoom,
    setZoom,
    isDragging,
    freeformChoice,
    setFreeformChoice,
    aspectChoiceDefinitions,
    activeAspectNumber,
    imageStyle,
    handleImageLoad,
    handleReset,
    handleFramePointerDown,
    handleFramePointerMove,
    endFramePointer,
    handleFrameKeyDown,
    handleZoomKeyDown,
    zoomBounds,
  } = useImageReframerState({
    aspect,
    aspectLabel,
    allowFreeform,
    minOutputWidth,
    minOutputHeight,
    value,
    onChange,
  });

  function handleImageLoadEvent(event: SyntheticEvent<HTMLImageElement>) {
    handleImageLoad(event.currentTarget);
  }

  function handleFramePointerDownEvent(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    handleFramePointerDown(event.pointerId, event.clientX, event.clientY);
  }

  function handleFramePointerMoveEvent(event: ReactPointerEvent<HTMLDivElement>) {
    handleFramePointerMove(event.pointerId, event.clientX, event.clientY);
  }

  function endFramePointerEvent(event: ReactPointerEvent<HTMLDivElement>) {
    endFramePointer(event.pointerId);
  }

  function handleFrameKeyDownEvent(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (handleFrameKeyDown(event.key)) event.preventDefault();
  }

  function handleZoomKeyDownEvent(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (handleZoomKeyDown(event.key)) event.preventDefault();
  }

  return (
    <div className={styles.reframer}>
      {allowFreeform && (
        <FilterChips
          options={aspectChoiceDefinitions.map((definition) => ({
            value: definition.key,
            label: t(definition.labelKey),
          }))}
          value={freeformChoice}
          onChange={(next) => setFreeformChoice(next as FreeformChoiceKey)}
          label={t("shared:reframe.ratio.group")}
          className={styles.ratioRow}
        />
      )}
      <div className={styles.stage}>
        {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex --
            Composite pan/zoom surface: pointer/touch drag is the primary pan gesture (like
            PullToRefresh's gesture-only container), arrow-key nudge is a keyboard fallback layered
            on top. No ARIA widget role models continuous 2D pan, so this keeps the honest
            role="group" container label; the labeled zoom range input below is the
            standards-compliant primary keyboard control. */}
        <div
          ref={frameRef}
          className={[styles.frame, isDragging && styles.dragging].filter(Boolean).join(" ")}
          style={{ aspectRatio: String(activeAspectNumber || 1) }}
          role="group"
          aria-label={t("shared:reframe.frame")}
          tabIndex={0}
          onPointerDown={handleFramePointerDownEvent}
          onPointerMove={handleFramePointerMoveEvent}
          onPointerUp={endFramePointerEvent}
          onPointerCancel={endFramePointerEvent}
          onKeyDown={handleFrameKeyDownEvent}
        >
          <img
            alt={t("shared:reframe.alt")}
            src={src}
            className={styles.image}
            style={imageStyle}
            draggable={false}
            onLoad={handleImageLoadEvent}
          />
        </div>
        {/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
      </div>
      <div className={styles.controls}>
        <input
          type="range"
          className={styles.zoomRange}
          min={zoomBounds.min}
          max={zoomBounds.max}
          step={zoomBounds.step}
          value={zoom}
          aria-label={t("shared:reframe.zoom")}
          onChange={(event) => setZoom(Number(event.target.value))}
          onKeyDown={handleZoomKeyDownEvent}
        />
        <button
          type="button"
          className={styles.resetButton}
          onClick={handleReset}
          aria-label={t("shared:reframe.reset")}
        >
          <FiRefreshCw aria-hidden />
        </button>
      </div>
    </div>
  );
}
