import {
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { API_BASE_URL } from "../../../shared/api/config";
import { Button, Modal } from "../../../shared/components/ui";
import type { QuizshowQuiz } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { quizFromInput } from "../api/quizshowDemoStore";
import { useQuizshowDemoEngine } from "../engine/useQuizshowDemoEngine";
import {
  applyQuizshowFrame,
  createQuizshowClientState,
} from "../realtime/quizshowClientStore";
import { QuizshowScreenStage } from "../screen/QuizshowScreenStage";
import {
  draftToInput,
  type QuizshowDraft,
  type QuizshowDraftQuestion,
} from "./quizshowDraft";
import styles from "./QuizshowDryRun.module.css";

const DRY_RUN_ID = "dry-run";
/** A URL an `<img>` can already load, local `blob:` previews included. */
const LOADABLE_URL_PATTERN = /^(?:https?:|blob:|data:|\/)/;

interface QuizshowDryRunProps {
  draft: QuizshowDraft;
  /** The draft's own previews of pictures picked in this edit, by picture key. */
  pickedPreviewUrls?: ReadonlyMap<string, string>;
  onClose: () => void;
}

/**
 * The question's picture as something an `<img>` can load. The draft keeps
 * the URL the server resolved for a saved picture; a picture picked in this
 * edit is a bare `event-cover` key, which the API serves at `/files/<key>`
 * (the same rule as the event cover preview in EditDetailsPreview). In demo a
 * fresh pick's key is already a `blob:` URL. The draft's own copy of a
 * picture picked in this edit comes first: the picture field revokes its own
 * `blob:` URL once the question closes, so that key may no longer load.
 */
function pictureUrlOf(
  draftQuestion: QuizshowDraftQuestion | undefined,
  pickedPreviewUrls: ReadonlyMap<string, string>,
) {
  const key = draftQuestion?.question.mediaRef?.trim() ?? "";
  if (!draftQuestion || !key) return null;
  const pickedPreviewUrl = draftQuestion.question.mediaRef
    ? pickedPreviewUrls.get(draftQuestion.question.mediaRef)
    : undefined;
  if (pickedPreviewUrl !== undefined) return pickedPreviewUrl;
  if (draftQuestion.mediaUrl !== null) return draftQuestion.mediaUrl;
  if (LOADABLE_URL_PATTERN.test(key) || !API_BASE_URL) return key;
  return `${API_BASE_URL}/files/${key}`;
}

/** The draft as a playable quiz, its pictures pointing at loadable URLs. */
function dryRunQuizOf(
  draft: QuizshowDraft,
  pickedPreviewUrls: ReadonlyMap<string, string>,
): QuizshowQuiz {
  const quiz = quizFromInput(draftToInput(draft, null), {
    idPrefix: DRY_RUN_ID,
    updatedAt: new Date().toISOString(),
    sourceTemplateId: null,
  });
  return {
    ...quiz,
    rounds: quiz.rounds.map((round, roundIndex) => ({
      ...round,
      questions: round.questions.map((question, questionIndex) => ({
        ...question,
        mediaUrl: pictureUrlOf(
          draft.rounds[roundIndex]?.questions[questionIndex],
          pickedPreviewUrls,
        ),
      })),
    })),
  };
}

/** The scale that fits the viewport-tall canvas into the frame, kept current as either resizes. */
function useCanvasScale() {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (frame === null || canvas === null) return undefined;
    const measure = () => {
      const canvasHeight = canvas.offsetHeight;
      if (canvasHeight > 0) setScale(frame.clientHeight / canvasHeight);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);
  return { frameRef, canvasRef, scale };
}

const NO_PICKED_PREVIEWS: ReadonlyMap<string, string> = new Map();

/**
 * The builder's try-out: the draft as it stood when opened, played on the big
 * screen stage by the twelve simulated players. It runs the demo engine in
 * every mode (the try-out is always local), so it sends no request and opens
 * no socket, and nothing it plays is saved. Nobody can join it, so the lobby
 * shows no join code or QR.
 */
export function QuizshowDryRun({
  draft,
  pickedPreviewUrls = NO_PICKED_PREVIEWS,
  onClose,
}: QuizshowDryRunProps) {
  const { t } = useTranslation();
  const [quiz] = useState(() => dryRunQuizOf(draft, pickedPreviewUrls));
  const demoEngine = useQuizshowDemoEngine(
    {
      role: "screen",
      eventSlug: DRY_RUN_ID,
      eventTitle: draft.title,
      isAutoHost: true,
      hasSelfPlayer: false,
      playMode: "solo",
      suggestedScreenName: "",
      shouldLoop: false,
      quiz,
    },
    true,
  );
  const [state, dispatch] = useReducer(
    applyQuizshowFrame,
    "screen",
    createQuizshowClientState,
  );
  const { frameRef, canvasRef, scale } = useCanvasScale();

  useEffect(() => {
    if (demoEngine === null) return undefined;
    dispatch({
      event: "session:state",
      payload: demoEngine.sessionStateFor("screen"),
    });
    return demoEngine.subscribe(dispatch);
  }, [demoEngine]);

  return (
    <Modal
      full
      title={t("quizshow:dryRun.title")}
      sub={t("quizshow:dryRun.sub")}
      onClose={onClose}
      bodyClassName={styles.body}
      footer={
        <Button variant="ghost" type="button" onClick={onClose}>
          {t("quizshow:dryRun.close")}
        </Button>
      }
    >
      {/* The big screen defaults to its dark theme, so the try-out does too. */}
      <div ref={frameRef} className={styles.frame} data-theme="dark">
        <div
          ref={canvasRef}
          className={styles.canvas}
          style={{ transform: `scale(${scale})` }}
        >
          <QuizshowScreenStage
            state={state}
            clockOffsetMs={0}
            size="screen"
            isJoinHidden
          />
        </div>
      </div>
    </Modal>
  );
}
