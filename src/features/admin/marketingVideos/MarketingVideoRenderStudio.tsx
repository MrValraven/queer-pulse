import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { useDismiss } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { filmSizeStyle } from "./filmSizeStyle";
import {
  FILM_FORMATS,
  filmUrl,
  type FilmFormatId,
  type MarketingVideo,
} from "./marketingVideos.data";
import { MarketingVideoCaptureBox } from "./MarketingVideoCaptureBox";
import { MarketingVideoRenderBar } from "./MarketingVideoRenderSteps";
import { detectRenderSupport } from "./render/captureApis";
import { parseCssRgb, type Rgb } from "./render/colorCalibration";
import {
  assertFilmFormat,
  filmIn,
  FilmFormatError,
  iframeLoaded,
} from "./render/filmWindow";
import { markerPattern } from "./render/frameMarker";
import { useFilmRender, type RenderState } from "./useFilmRender";
import { BAR_WIDTH, useStudioScale } from "./useStudioScale";
import styles from "./MarketingVideos.module.css";

/**
 * Full-screen render surface. The film plays at its native size (1920x1080,
 * or 1080x1350 for the 4:5 post), scaled so one film pixel lands on one
 * device pixel where the window allows, with the frame-sync marker strip
 * under it; that box is what gets captured. The status bar sits outside the
 * box (below a wide film, beside a tall one unless the window is narrow), so
 * it never ends up in the video. A film that lacks the requested shape opens
 * on the failure message, with Start never offered.
 */
export function MarketingVideoRenderStudio({
  video,
  format,
  onClose,
}: {
  video: MarketingVideo;
  format: FilmFormatId;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const dialogRef = useDismiss(onClose);
  const boxRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const cellRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const calibrationRef = useRef<HTMLDivElement>(null);
  const patchRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [isFilmReady, setIsFilmReady] = useState(false);
  const [isFormatMissing, setIsFormatMissing] = useState(false);
  const support = useMemo(() => detectRenderSupport(), []);
  const size = FILM_FORMATS[format];
  const { scale, isSoft, isBarBeside } = useStudioScale(size);
  const render = useFilmRender(video, format);
  const title = t(`admin:marketingVideos.films.${video.id}.title`);
  const barState: RenderState = isFormatMissing
    ? { status: "failed", reason: "format" }
    : render.state;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    let isCurrent = true;
    iframeLoaded(iframe)
      .then(() => filmIn(iframe))
      .then((film) => {
        // The film must offer the shape before Start does; renderFilm checks
        // again after the share picker. The 16:9 shape is every film's default.
        assertFilmFormat(
          film,
          { id: format, ...size },
          { isMissingAllowed: format === "landscape" },
        );
        if (isCurrent) setIsFilmReady(true);
      })
      .catch((error: unknown) => {
        if (isCurrent && error instanceof FilmFormatError) {
          setIsFormatMissing(true);
        }
      });
    return () => {
      isCurrent = false;
    };
  }, [format, size]);

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
    render.start({
      box,
      iframe,
      showMarker,
      showCalibration: (isShown) => {
        if (calibrationRef.current) calibrationRef.current.hidden = !isShown;
      },
      calibrationColours: () =>
        patchRefs.current.map(
          (node): Rgb =>
            (node && parseCssRgb(getComputedStyle(node).backgroundColor)) ?? [
              0, 0, 0,
            ],
        ),
    });
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
      data-bar-beside={isBarBeside || undefined}
      style={
        {
          ...filmSizeStyle(size),
          "--studio-bar-width": `${BAR_WIDTH}px`,
        } as CSSProperties
      }
    >
      <div className={styles.studioStage}>
        <MarketingVideoCaptureBox
          size={size}
          scale={scale}
          src={filmUrl(video.id, { format })}
          frameTitle={t("admin:marketingVideos.studio.frameTitle", { title })}
          boxRef={boxRef}
          iframeRef={iframeRef}
          calibrationRef={calibrationRef}
          patchRefs={patchRefs}
          cellRefs={cellRefs}
        />
      </div>
      <MarketingVideoRenderBar
        video={video}
        format={format}
        title={title}
        titleId={titleId}
        state={barState}
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
