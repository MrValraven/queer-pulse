import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDismiss } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { filmUrl, type MarketingVideo } from "./marketingVideos.data";
import { MarketingVideoRenderBar } from "./MarketingVideoRenderSteps";
import { detectRenderSupport } from "./render/captureApis";
import { filmIn, iframeLoaded } from "./render/filmWindow";
import {
  MARKER_HEIGHT,
  MAX_MARKER_INDEX,
  markerPattern,
} from "./render/frameMarker";
import { useFilmRender } from "./useFilmRender";
import { useStudioScale } from "./useStudioScale";
import styles from "./MarketingVideos.module.css";

// Every step code the render can paint is below MAX_MARKER_INDEX, so the
// strip's resting code can never be mistaken for a real step.
const RESTING_MARKER = markerPattern(MAX_MARKER_INDEX);

/**
 * Full-screen render surface. The film plays at 1920x1080 (scaled so one film
 * pixel lands on one device pixel where the window allows) with the frame-sync
 * marker strip under it; that box is what gets captured. The status bar sits
 * outside the box, so it never ends up in the video.
 */
export function MarketingVideoRenderStudio({
  video,
  onClose,
}: {
  video: MarketingVideo;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const dialogRef = useDismiss(onClose);
  const boxRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const cellRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [isFilmReady, setIsFilmReady] = useState(false);
  const support = useMemo(() => detectRenderSupport(), []);
  const { scale, isSoft } = useStudioScale();
  const render = useFilmRender(video);
  const title = t(`admin:marketingVideos.films.${video.id}.title`);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    let isCurrent = true;
    iframeLoaded(iframe)
      .then(() => filmIn(iframe))
      .then(() => {
        if (isCurrent) setIsFilmReady(true);
      })
      .catch(() => undefined);
    return () => {
      isCurrent = false;
    };
  }, []);

  // Leaving the studio leaves full screen too.
  useEffect(
    () => () => {
      if (document.fullscreenElement)
        void document.exitFullscreen().catch(() => undefined);
    },
    [],
  );

  const showMarker = (index: number) => {
    markerPattern(index).forEach((isLight, cell) => {
      const node = cellRefs.current[cell];
      if (node) {
        node.className =
          (isLight ? styles.markerLight : styles.markerDark) ?? "";
      }
    });
  };

  const handleStart = () => {
    const box = boxRef.current;
    const iframe = iframeRef.current;
    if (!box || !iframe) return;
    render.start({ box, iframe, showMarker });
  };

  const handleFullScreen = () => {
    void dialogRef.current?.requestFullscreen().catch(() => undefined);
  };

  return createPortal(
    <div
      ref={dialogRef}
      className={styles.studio}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className={styles.studioStage}>
        <div
          ref={boxRef}
          className={styles.captureBox}
          style={{
            width: 1920 * scale,
            height: (1080 + MARKER_HEIGHT) * scale,
          }}
        >
          <div
            className={styles.captureInner}
            style={{ transform: `scale(${scale})` }}
          >
            <iframe
              ref={iframeRef}
              className={styles.captureIframe}
              src={filmUrl(video.id)}
              title={t("admin:marketingVideos.studio.frameTitle", { title })}
              width={1920}
              height={1080}
              tabIndex={-1}
            />
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
      </div>
      <MarketingVideoRenderBar
        video={video}
        title={title}
        titleId={titleId}
        state={render.state}
        support={support}
        isSoft={isSoft}
        canStart={isFilmReady}
        onStart={handleStart}
        onStop={render.stop}
        onReset={render.reset}
        onFullScreen={handleFullScreen}
        onClose={onClose}
      />
    </div>,
    document.body,
  );
}
