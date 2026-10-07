import type { RefObject } from "react";
import type { FilmSize } from "./marketingVideos.data";
import {
  calibrationPatchSize,
  calibrationPatches,
} from "./render/colorCalibration";
import {
  MARKER_HEIGHT,
  MAX_MARKER_INDEX,
  markerPattern,
} from "./render/frameMarker";
import styles from "./MarketingVideos.module.css";

// Every step code the render can paint is below MAX_MARKER_INDEX, so the
// strip's resting code can never be mistaken for a real step.
const RESTING_MARKER = markerPattern(MAX_MARKER_INDEX);

// Saturated brand colours: a wrong colour matrix shifts these the most.
const PATCH_CLASSES = [styles.patchCoral, styles.patchJade, styles.patchViolet];

interface CaptureBoxProps {
  size: FilmSize;
  scale: number;
  src: string;
  /** Names the frame for assistive tech (iframes need a title). */
  frameTitle: string;
  boxRef: RefObject<HTMLDivElement | null>;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  calibrationRef: RefObject<HTMLDivElement | null>;
  patchRefs: RefObject<(HTMLSpanElement | null)[]>;
  cellRefs: RefObject<(HTMLSpanElement | null)[]>;
}

/**
 * What the render captures: the film at its native size, scaled into the
 * box, with the colour calibration patches over it (hidden until needed) and
 * the frame-sync marker strip under it.
 */
export function MarketingVideoCaptureBox({
  size,
  scale,
  src,
  frameTitle,
  boxRef,
  iframeRef,
  calibrationRef,
  patchRefs,
  cellRefs,
}: CaptureBoxProps) {
  const patchSize = calibrationPatchSize(size);
  return (
    <div
      ref={boxRef}
      className={styles.captureBox}
      style={{
        width: size.width * scale,
        height: (size.height + MARKER_HEIGHT) * scale,
      }}
    >
      <div
        className={styles.captureInner}
        style={{ transform: `scale(${scale})` }}
      >
        <iframe
          ref={iframeRef}
          className={styles.captureIframe}
          src={src}
          title={frameTitle}
          width={size.width}
          height={size.height}
          tabIndex={-1}
        />
        <div
          ref={calibrationRef}
          className={styles.calibration}
          hidden
          aria-hidden
        >
          {calibrationPatches(size).map(({ x, y }, patch) => (
            <span
              key={`${x}-${y}`}
              ref={(node) => {
                patchRefs.current[patch] = node;
              }}
              className={PATCH_CLASSES[patch]}
              style={{
                left: x - patchSize / 2,
                top: y - patchSize / 2,
                width: patchSize,
                height: patchSize,
              }}
            />
          ))}
        </div>
        <div className={styles.marker} aria-hidden>
          {RESTING_MARKER.map((isLight, cell) => (
            <span
              key={cell}
              ref={(node) => {
                cellRefs.current[cell] = node;
              }}
              className={isLight ? styles.markerLight : styles.markerDark}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
