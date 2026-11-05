import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { m } from "motion/react";
import { FiSmartphone } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowPlayerParty } from "../player/QuizshowPlayerParty";
import { QuizshowPlayerQuestion } from "../player/QuizshowPlayerQuestion";
import playerStyles from "../player/QuizshowPlayer.module.css";
import { QuizshowScreenStage } from "../screen/QuizshowScreenStage";
import { QuizshowBackdrop } from "../stage/QuizshowBackdrop";
import { StudioCanvasScaleContext } from "./quizshowStudioCanvasScale";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import {
  studioPlayerQuestionPropsFor,
  studioScreenClientStateOf,
  studioScreenStateFor,
} from "./quizshowStudioPreview";
import { QuizshowStudioTitleSlidePreview } from "./QuizshowStudioSlide";
import styles from "./QuizshowStudioCanvas.module.css";

/** The two canvases the studio draws on: the TV at 720p, and a phone held upright. */
const CANVAS_SIZES = {
  screen: { width: 1280, height: 720 },
  phone: { width: 390, height: 844 },
} as const;

export type QuizshowStudioFrameVariant = keyof typeof CANVAS_SIZES;

/**
 * The scale that fits the fixed-size canvas into the frame. CSS sizes the
 * frame (the largest box of the canvas's shape that the area holds); this
 * reads its width back, so the canvas follows every resize of the window,
 * the rail or the inspector. The callback ref re-measures when the frame mounts.
 *
 * `onScaleChange` hears the scale the TV-shaped slide would take in the same
 * area, whichever canvas is shown, so the phone view keeps the studio's
 * "big enough to type on" verdict current too.
 */
function useFrameScale(
  canvasWidth: number,
  onScaleChange: ((scale: number) => void) | undefined,
) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0);
  const scaleRef = useRef(0);
  const onScaleChangeRef = useRef(onScaleChange);
  useLayoutEffect(() => {
    onScaleChangeRef.current = onScaleChange;
  });
  useLayoutEffect(() => {
    if (frame === null) return undefined;
    const measure = () => {
      const nextScale = frame.clientWidth / canvasWidth;
      scaleRef.current = nextScale;
      setScale(nextScale);
      const area = frame.parentElement;
      if (area === null) return;
      const slideScale = Math.min(
        area.clientWidth / CANVAS_SIZES.screen.width,
        area.clientHeight / CANVAS_SIZES.screen.height,
      );
      if (slideScale > 0) onScaleChangeRef.current?.(slideScale);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [frame, canvasWidth]);
  // A stable reader for pieces that measure the pointer (a drag on the slide).
  const readScale = useCallback(() => scaleRef.current || 1, []);
  return { frameRef: setFrame, scale, readScale };
}

interface QuizshowStudioPreviewFrameProps {
  variant: QuizshowStudioFrameVariant;
  /**
   * A preview nobody works in: the phone's views move focus to their heading
   * on mount, so an inert frame keeps focus in the rail. It is hidden from
   * assistive tech too; `label` then names what it shows.
   */
  isInert?: boolean;
  /** The frame's name, read out in place of an inert preview's content. */
  label: string;
  /** Hears the canvas's scale as it is measured (the studio gates typing on it). */
  onScaleChange?: (scale: number) => void;
  children: ReactNode;
}

/**
 * A fixed-size canvas (1280x720 for the TV, 390x844 for a phone) scaled with
 * `transform: scale()` into the largest frame of its shape that fits, over
 * the velvet backdrop the frame renders itself. Inside it, `vw`, `vh` and
 * viewport media queries still read the real window, so the stage pieces are
 * drawn with `isFixedCanvas` and the slide sizes itself in canvas pixels.
 */
export function QuizshowStudioPreviewFrame({
  variant,
  isInert = false,
  label,
  onScaleChange,
  children,
}: QuizshowStudioPreviewFrameProps) {
  const size = CANVAS_SIZES[variant];
  const { frameRef, scale, readScale } = useFrameScale(
    size.width,
    onScaleChange,
  );
  return (
    <div className={styles.area} data-variant={variant}>
      <div
        ref={frameRef}
        className={styles.frame}
        data-variant={variant}
        role={isInert ? "img" : "group"}
        aria-label={label}
      >
        {/* A motion element carries the scale, so motion's layout glides
            inside the canvas (a reordered row) are measured against it. */}
        <m.div
          className={styles.canvas}
          style={{
            width: size.width,
            height: size.height,
            scale,
            originX: 0,
            originY: 0,
          }}
          // The stage reads its dark tokens whatever the app theme.
          data-theme="dark"
          inert={isInert}
          aria-hidden={isInert || undefined}
        >
          <QuizshowBackdrop variant={variant === "phone" ? "phone" : "stage"} />
          <StudioCanvasScaleContext.Provider value={readScale}>
            <div className={styles.canvasContent}>{children}</div>
          </StudioCanvasScaleContext.Provider>
        </m.div>
      </div>
    </div>
  );
}

/** The moment of a question the Big screen preview shows. */
export type QuizshowStudioScreenMoment = "open" | "reveal";

/**
 * The real big screen renderer, fed the selected slide by the draft-to-view
 * adapter: the quiz as its typeset title slide (the lobby has no place in a
 * preview of a title), a round header as its intro card, and a question while players
 * answer or at the reveal. Nothing runs: no deadline, every count zero.
 */
export function QuizshowStudioScreenPreview({
  moment,
  onScaleChange,
}: {
  moment: QuizshowStudioScreenMoment;
  onScaleChange?: (scale: number) => void;
}) {
  const { t } = useTranslation();
  const { controller, selection, viewLanguage } = useQuizshowStudio();
  const { draft, pickedPreviewUrls } = controller;
  const clientState = useMemo(
    () =>
      studioScreenClientStateOf(
        studioScreenStateFor(draft, selection, {
          language: viewLanguage,
          phase: moment,
          pickedPreviewUrls,
        }),
      ),
    [draft, selection, viewLanguage, moment, pickedPreviewUrls],
  );
  return (
    <QuizshowStudioPreviewFrame
      variant="screen"
      label={t("quizshow:studio.canvas.screenFrame")}
      onScaleChange={onScaleChange}
    >
      {selection.kind === "quiz" ? (
        <QuizshowStudioTitleSlidePreview />
      ) : (
        <QuizshowScreenStage
          state={clientState}
          clockOffsetMs={0}
          size="screen"
          isJoinHidden
          isFixedCanvas
        />
      )}
    </QuizshowStudioPreviewFrame>
  );
}

/**
 * The player's answering view of the selected question in a phone frame. The
 * frame is inert: the phone's views move focus to their heading on mount, and
 * a tap answers nothing. A quiz or round selection has nothing to answer.
 */
export function QuizshowStudioPhonePreview({
  onScaleChange,
}: {
  onScaleChange?: (scale: number) => void;
}) {
  const { t } = useTranslation();
  const { controller, selection, viewLanguage } = useQuizshowStudio();
  const { draft, pickedPreviewUrls } = controller;
  const playerProps = useMemo(
    () =>
      studioPlayerQuestionPropsFor(draft, selection, {
        language: viewLanguage,
        phase: "open",
        pickedPreviewUrls,
      }),
    [draft, selection, viewLanguage, pickedPreviewUrls],
  );
  const isParty =
    playerProps !== null && playerProps.question.roundKind !== "quiz";
  return (
    <QuizshowStudioPreviewFrame
      variant="phone"
      label={t("quizshow:studio.canvas.phoneFrame")}
      isInert
      onScaleChange={onScaleChange}
    >
      <div className={styles.phoneBody}>
        {playerProps === null && (
          <p className={styles.phoneEmpty}>
            <FiSmartphone aria-hidden="true" focusable="false" />
            {t("quizshow:studio.canvas.phoneEmpty")}
          </p>
        )}
        {playerProps !== null && (
          <div className={playerStyles.stage}>
            {isParty ? (
              <QuizshowPlayerParty {...playerProps} isFixedCanvas />
            ) : (
              <QuizshowPlayerQuestion {...playerProps} isFixedCanvas />
            )}
          </div>
        )}
      </div>
    </QuizshowStudioPreviewFrame>
  );
}
