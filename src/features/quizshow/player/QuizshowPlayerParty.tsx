import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { FiCheck } from "react-icons/fi";
import { Button, Collapse, FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_LIMITS,
  type QuizshowLanguage,
  type QuizshowPlayableRoundKind,
  type QuizshowQuestionView,
} from "../../../shared/contracts/quizshow";
import { quizshowErrorKeyOf } from "../api/quizshowErrors";
import { isPlayerState } from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowCountdownBar } from "../stage/QuizshowCountdownBar";
import { pickQuizshowText } from "../stage/quizshowText";
import styles from "./QuizshowPlayer.module.css";
import { partyHeadingOf } from "./quizshowPartyHeading";
import {
  QuizshowLockedPanel,
  QuizshowLockedStatus,
  QuizshowWaitDots,
} from "./QuizshowLockedPanel";
import { useAnswerSender } from "./useQuizshowAnswerSender";
import { useIsAnswerHeld } from "./useIsAnswerHeld";
import { useQuizshowHeadingFocus } from "./useQuizshowHeadingFocus";

const WRITE_LABEL_KEYS: Record<QuizshowPlayableRoundKind, string> = {
  quiz: "quizshow:player.writeCaptionLabel",
  lie_detector: "quizshow:player.writeLieDetectorLabel",
  caption_this: "quizshow:player.writeCaptionLabel",
  drag_name: "quizshow:player.writeDragNameLabel",
};

interface PartyProps {
  controller: QuizshowSessionController;
  question: QuizshowQuestionView;
  language: QuizshowLanguage;
}

interface PartyInputProps extends PartyProps {
  /** Paused or past the player's own deadline: buttons stay focusable and send nothing. */
  isHeld: boolean;
}

function Alert({ errorKey }: { errorKey: string | null }) {
  const { t } = useTranslation();
  return (
    <Collapse isOpen={errorKey !== null}>
      <p role="alert" className={styles.alert}>
        {errorKey === null ? "" : t(errorKey)}
      </p>
    </Collapse>
  );
}

function WriteForm({ controller, question, isHeld }: PartyInputProps) {
  const { t } = useTranslation();
  const { lockedPayload, errorKey, send } = useAnswerSender(
    controller,
    question.questionId,
  );
  const [draft, setDraft] = useState(() =>
    lockedPayload?.type === "prompt" ? lockedPayload.text : "",
  );
  const isLocked = lockedPayload !== null;
  const isReady = draft.trim().length > 0;
  const charactersLeft = QUIZSHOW_LIMITS.partyTextMax - draft.length;
  return (
    <form
      className={`${styles.form} ${styles.answerSheet}`}
      onSubmit={(event) => {
        event.preventDefault();
        if (isLocked || isHeld || !isReady) return;
        send({ type: "prompt", text: draft.trim() });
      }}
    >
      <FormField
        // The wheel branch is unreachable: wheel rows hold no questions.
        label={t(
          question.roundKind === "wheel"
            ? "quizshow:player.writeCaptionLabel"
            : WRITE_LABEL_KEYS[question.roundKind],
        )}
        labelAside={
          <span className={styles.counter}>
            {t("quizshow:player.charactersLeft", { count: charactersLeft })}
          </span>
        }
      >
        <textarea
          rows={3}
          value={draft}
          maxLength={QUIZSHOW_LIMITS.partyTextMax}
          readOnly={isLocked}
          aria-disabled={isLocked}
          onChange={(event) => setDraft(event.target.value)}
        />
      </FormField>
      <Button
        type="submit"
        variant="stage"
        size="lg"
        aria-disabled={isLocked || isHeld || !isReady}
      >
        {t("quizshow:player.writeSubmit")}
      </Button>
      <QuizshowLockedStatus
        text={isLocked ? t("quizshow:player.answerLocked") : null}
      />
      <Collapse isOpen={isLocked}>
        <QuizshowLockedPanel
          title={t("quizshow:player.answerLocked")}
          body={t("quizshow:player.waitingReview")}
        />
      </Collapse>
      <Alert errorKey={errorKey} />
    </form>
  );
}

function VoteList({ controller, question, isHeld }: PartyInputProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const [chosenOptionId, setChosenOptionId] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const { session } = controller.state;
  if (!isPlayerState(session) || session.voteOptions === null) return null;
  const { voteOptions, myVote, cursor } = session;
  const votedOptionId =
    myVote?.questionId === question.questionId
      ? myVote.optionId
      : chosenOptionId;
  const vote = (optionId: string) => {
    setChosenOptionId(optionId);
    setErrorKey(null);
    void controller
      .send("vote:submit", {
        phaseId: cursor.phaseId,
        questionId: question.questionId,
        optionId,
      })
      .then((result) => {
        if (result.ok) return;
        setChosenOptionId(null);
        setErrorKey(
          quizshowErrorKeyOf(
            result.code === "transport_timeout" ? null : result.code,
          ),
        );
      });
  };
  return (
    <>
      <ul className={styles.voteList}>
        {voteOptions.options.map((option) => {
          const isOwn = option.optionId === voteOptions.ownOptionId;
          const isChosen = votedOptionId === option.optionId;
          const isBlocked = isOwn || votedOptionId !== null || isHeld;
          const stateClass = isChosen
            ? styles.voteButtonChosen
            : votedOptionId !== null || isOwn
              ? styles.voteButtonDimmed
              : "";
          return (
            <li key={option.optionId}>
              <button
                type="button"
                className={`${styles.voteButton} ${stateClass}`}
                aria-disabled={isBlocked}
                aria-pressed={isChosen}
                onClick={() => {
                  if (!isBlocked) vote(option.optionId);
                }}
              >
                <span className={styles.voteText}>{option.text}</span>
                {isOwn && (
                  <span className={styles.voteTag}>
                    {t("quizshow:player.ownAnswer")}
                  </span>
                )}
                <AnimatePresence initial={false}>
                  {isChosen && (
                    <m.span
                      className={`${styles.voteTag} ${styles.voteTagChosen}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reducedMotion ? 0 : 0.15 }}
                    >
                      <FiCheck aria-hidden="true" fill="none" />
                      {t("quizshow:player.voted")}
                    </m.span>
                  )}
                </AnimatePresence>
              </button>
            </li>
          );
        })}
      </ul>
      <Alert errorKey={errorKey} />
    </>
  );
}

/** Party rounds on the phone: write, wait while the hosts check, then vote. */
export function QuizshowPlayerParty({
  controller,
  question,
  language,
  isFixedCanvas = false,
}: PartyProps & {
  /** Additive. A fixed 390x844 canvas (the studio's phone preview); see QuizshowPlayerQuestion. */
  isFixedCanvas?: boolean;
}) {
  const { t } = useTranslation();
  const { session } = controller.state;
  const phase = session?.cursor.phase ?? null;
  const player = isPlayerState(session) ? session : null;
  const hasExtraTime = player?.me?.hasExtraTime ?? false;
  const isHeld = useIsAnswerHeld(
    player?.cursor ?? null,
    controller.clockOffsetMs,
    hasExtraTime,
  );
  const headingRef = useQuizshowHeadingFocus(session?.cursor.phaseId ?? "");
  const isLateJoiner = player?.isEligibleForQuestion === false;
  const prompt = pickQuizshowText(question.prompt, language).trim();
  let title = partyHeadingOf(question, language, t);
  if (phase === "vote") {
    title = t(
      question.roundKind === "lie_detector"
        ? "quizshow:player.voteLieDetectorTitle"
        : "quizshow:player.voteTitle",
    );
  }
  return (
    <div
      className={styles.screenBody}
      data-fixed-canvas={isFixedCanvas ? "true" : undefined}
    >
      <QuizshowCountdownBar
        cursor={
          phase === "write" || phase === "vote"
            ? (session?.cursor ?? null)
            : null
        }
        clockOffsetMs={controller.clockOffsetMs}
        hasExtraTime={hasExtraTime}
        // Players hold no round settings, so the vote uses the default limit, as the screen does.
        standardLimitMs={
          (phase === "vote"
            ? QUIZSHOW_LIMITS.voteSecondsDefault
            : question.timeLimitSeconds) * 1000
        }
        size="phone"
      />
      <div className={styles.promptArea}>
        <h1 ref={headingRef} tabIndex={-1} className={styles.heading}>
          {title}
        </h1>
        {phase === "vote" && prompt !== "" && (
          <p className={styles.note}>{prompt}</p>
        )}
        {question.mediaUrl !== null && (
          <img className={styles.media} src={question.mediaUrl} alt="" />
        )}
      </div>
      {(phase === "write" || phase === "vote") && isLateJoiner && (
        <p className={styles.note}>{t("quizshow:player.waitNextQuestion")}</p>
      )}
      <div className={styles.answers}>
        {phase === "write" && !isLateJoiner && (
          <WriteForm
            controller={controller}
            question={question}
            language={language}
            isHeld={isHeld}
          />
        )}
        {phase === "review" && (
          <p className={styles.readyPill}>
            {t("quizshow:stage.checking")}
            <QuizshowWaitDots />
          </p>
        )}
        {phase === "vote" && !isLateJoiner && (
          <VoteList
            controller={controller}
            question={question}
            language={language}
            isHeld={isHeld}
          />
        )}
      </div>
    </div>
  );
}
