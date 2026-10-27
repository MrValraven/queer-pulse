import { useCallback, useEffect, useState } from "react";
import { FiFileText } from "react-icons/fi";
import { useMotionPrefs } from "../../../../../app/providers/motionPrefs";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type { QuarterTurn } from "../model/pdfEditModel";
import styles from "./PdfThumbnail.module.css";
import { usePageThumbnail } from "./usePageThumbnail";
import { nextVisualRotation } from "./visualRotation";

interface ShownRotation {
  target: QuarterTurn;
  degrees: number;
}

/**
 * The angle on screen keeps counting past a full turn, so every edit animates
 * the short way round. It adjusts during render, the React pattern for state
 * that follows a prop, which keeps the value stable under StrictMode.
 */
function useShownDegrees(rotation: QuarterTurn): number {
  const [shown, setShown] = useState<ShownRotation>({
    target: rotation,
    degrees: rotation,
  });
  if (shown.target === rotation) return shown.degrees;
  const next = {
    target: rotation,
    degrees: nextVisualRotation(shown.degrees, rotation),
  };
  setShown(next);
  return next.degrees;
}

/**
 * A page turned a quarter swaps its width and height. The page is first
 * contained in the image area (w, h), so its turned footprint is (h, w) and it
 * fits the area when scaled by min(areaWidth / h, areaHeight / w). That keeps a
 * landscape page as large as the box allows. Until the image has loaded, the
 * box's own shorter-over-longer ratio stands in. The factor is measured from
 * the box and written as a custom property, so the turn stays a transform
 * animation and no React state changes while the box resizes.
 */
function quarterTurnScale(box: HTMLElement): number | null {
  const image = box.querySelector("img");
  const areaWidth = image?.clientWidth ?? 0;
  const areaHeight = image?.clientHeight ?? 0;
  const naturalWidth = image?.naturalWidth ?? 0;
  const naturalHeight = image?.naturalHeight ?? 0;
  if (
    areaWidth > 0 &&
    areaHeight > 0 &&
    naturalWidth > 0 &&
    naturalHeight > 0
  ) {
    const fit = Math.min(areaWidth / naturalWidth, areaHeight / naturalHeight);
    const pageWidth = naturalWidth * fit;
    const pageHeight = naturalHeight * fit;
    return Math.min(areaWidth / pageHeight, areaHeight / pageWidth);
  }
  const { width, height } = box.getBoundingClientRect();
  if (width <= 0 || height <= 0) return null;
  return Math.min(width / height, height / width);
}

function useQuarterTurnScale(
  box: HTMLElement | null,
  loadedUrl: string | null,
) {
  useEffect(() => {
    if (!box || typeof ResizeObserver === "undefined") return;
    const apply = () => {
      const scale = quarterTurnScale(box);
      if (scale !== null)
        box.style.setProperty("--quarter-turn-scale", String(scale));
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(box);
    return () => observer.disconnect();
  }, [box, loadedUrl]);
}

export function PdfThumbnail({
  fileId,
  sourceIndex,
  rotation,
}: {
  fileId: string;
  sourceIndex: number;
  rotation: QuarterTurn;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { containerRef, status, url } = usePageThumbnail(fileId, sourceIndex);
  const shownDegrees = useShownDegrees(rotation);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null);
  const [box, setBox] = useState<HTMLElement | null>(null);
  useQuarterTurnScale(box, loadedUrl);
  const attachBox = useCallback(
    (element: HTMLElement | null) => {
      containerRef(element);
      setBox(element);
    },
    [containerRef],
  );
  // An image the browser cannot decode reads as a failed render.
  const isImageBroken = url !== null && brokenUrl === url;
  const shownStatus = isImageBroken ? "failed" : status;
  const isLoaded = url !== null && loadedUrl === url;
  const isQuarterTurn = rotation % 180 !== 0;

  return (
    <span
      ref={attachBox}
      className={styles.thumbnail}
      data-status={shownStatus}
      data-quarter-turn={isQuarterTurn || undefined}
      data-reduced-motion={reducedMotion || undefined}
    >
      {url && !isImageBroken ? (
        <img
          className={styles.image}
          src={url}
          alt=""
          draggable={false}
          data-loaded={isLoaded || undefined}
          onLoad={() => setLoadedUrl(url)}
          onError={() => setBrokenUrl(url)}
          style={{ rotate: `${shownDegrees}deg` }}
        />
      ) : null}
      {shownStatus === "failed" ? (
        <span className={styles.failed}>
          <FiFileText aria-hidden="true" className={styles.failedIcon} />
          <span className={styles.failedText}>
            {t("admin:utilities.pdf.page.thumbnailFailed")}
          </span>
        </span>
      ) : null}
    </span>
  );
}
