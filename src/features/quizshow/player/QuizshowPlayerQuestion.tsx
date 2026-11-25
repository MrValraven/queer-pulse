import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button, Collapse, FormField } from "../../../shared/components/ui";
import { hapticTap } from "../../../shared/lib/haptics";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_LIMITS,
  type QuizshowAnswerPayload,
  type QuizshowCursor,
  type QuizshowLanguage,
  type QuizshowQuestionView,
  type QuizshowText,
} from "../../../shared/contracts/quizshow";
import { isPlayerState } from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowAnswerTile } from "../stage/QuizshowAnswerTile";
import { QuizshowCountdownBar } from "../stage/QuizshowCountdownBar";
import { QuizshowStagePicture } from "../stage/QuizshowStagePicture";
import { frozenRevealProgressOf } from "../stage/quizshowFrozenReveal";
import { useHeldSlowReveal } from "../stage/useHeldSlowReveal";
import { QuizshowStageText } from "../stage/QuizshowStageText";
import {
  optionLetter,
  pickQuizshowTextWithLanguage,
} from "../stage/quizshowText";
import {
  answerSwatchFor,
  trueFalseSwatchFor,
  type QuizshowSwatch,
} from "../quizshowSwatches";
import {
  QuizshowLockedPanel,
  QuizshowLockedStatus,
} from "./QuizshowLockedPanel";
import { QuizshowOrderAnswer } from "./QuizshowOrderAnswer";
import { answeredLineOf } from "./quizshowAnsweredLine";
import { useAnswerSender } from "./useQuizshowAnswerSender";
import { useIsAnswerHeld } from "./useIsAnswerHeld";
import { useQuizshowHeadingFocus } from "./useQuizshowHeadingFocus";
import styles from "./QuizshowPlayer.module.css";

function parseNumber(rawText: string): number | null {
  const normalised = rawText.trim().replace(",", ".");
  if (normalised === "") return null;
  const value = Number(normalised);
  const isUsable =
    Number.isFinite(value) && Math.abs(value) <= QUIZSHOW_LIMITS.numberAbsMax;
  return isUsable ? value : null;
}

interface TextAnswerProps {
  kind: "text" | "number";
  /** The closest-number unit (C6.1), shown beside the field when set. */
  unit: QuizshowText | null;
  language: QuizshowLanguage;
  lockedPayload: QuizshowAnswerPayload | null;
  isLocked: boolean;
  /** Paused or past the player's own deadline: the draft stays editable, sending waits. */
  isHeld: boolean;
  onSend: (payload: QuizshowAnswerPayload) => void;
}

function TextAnswer({
  kind,
  unit,
  language,
  lockedPayload,
  isLocked,
  isHeld,
  onSend,
}: TextAnswerProps) {
  const { t } = useTranslation();
  const unitId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const pickedUnit =
    unit === null ? null : pickQuizshowTextWithLanguage(unit, language);
  const unitText = pickedUnit?.text.trim() ?? "";
  const [draft, setDraft] = useState(() => {
    if (lockedPayload?.type === "type_answer") return lockedPayload.text;
    if (lockedPayload?.type === "closest_number") {
      return String(lockedPayload.value);
    }
    return "";
  });
  const parsedNumber = kind === "number" ? parseNumber(draft) : null;
  const isReady =
    kind === "number" ? parsedNumber !== null : draft.trim().length > 0;
  // Locking the answer lets go of the field, so its focus ring and the phone's
  // keyboard leave with it.
  useEffect(() => {
    if (isLocked) inputRef.current?.blur();
  }, [isLocked]);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (isLocked || isHeld || !isReady) return;
    if (kind === "number" && parsedNumber !== null) {
      onSend({ type: "closest_number", value: parsedNumber });
    } else {
      onSend({ type: "type_answer", text: draft.trim() });
    }
  };
  return (
    <form className={`${styles.form} ${styles.answerSheet}`} onSubmit={submit}>
      <div className={unitText === "" ? undefined : styles.unitRow}>
        <FormField
          className={unitText === "" ? undefined : styles.unitField}
          label={t(
            kind === "number"
              ? "quizshow:player.numberLabel"
              : "quizshow:player.typeLabel",
          )}
        >
          <input
            ref={inputRef}
            type="text"
            value={draft}
            maxLength={QUIZSHOW_LIMITS.typedAnswerMax}
            inputMode={kind === "number" ? "decimal" : "text"}
            enterKeyHint="send"
            autoComplete="off"
            aria-disabled={isLocked}
            aria-describedby={unitText === "" ? undefined : unitId}
            readOnly={isLocked}
            onChange={(event) => setDraft(event.target.value)}
          />
        </FormField>
        {unitText !== "" && (
          <span id={unitId} className={styles.unit} lang={pickedUnit?.language}>
            {unitText}
          </span>
        )}
      </div>
      <Collapse isOpen={!isLocked}>
        <Button
          type="submit"
          variant="stage"
          size="lg"
          className={styles.submitButton}
          aria-disabled={isHeld || !isReady}
        >
          {t("quizshow:player.submit")}
        </Button>
      </Collapse>
    </form>
  );
}

function tileState(
  isChosen: boolean,
  hasChoice: boolean,
): "idle" | "selected" | "dimmed" {
  if (isChosen) return "selected";
  return hasChoice ? "dimmed" : "idle";
}

interface TileChoicesProps {
  question: QuizshowQuestionView;
  language: QuizshowLanguage;
  lockedPayload: QuizshowAnswerPayload | null;
  isHeld: boolean;
  onSend: (payload: QuizshowAnswerPayload) => void;
}

function TileChoices({
  question,
  language,
  lockedPayload,
  isHeld,
  onSend,
}: TileChoicesProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isLocked = lockedPayload !== null;
  const isTappable = !isLocked && !isHeld;
  const choices: Array<{
    key: string;
    swatch: QuizshowSwatch;
    text: string;
    /** Set when the option text fell back to the other language. */
    textLanguage?: QuizshowLanguage;
    isChosen: boolean;
    payload: QuizshowAnswerPayload;
  }> =
    question.type === "true_false"
      ? [true, false].map((isTrue) => ({
          key: String(isTrue),
          swatch: trueFalseSwatchFor(isTrue),
          text: t(
            isTrue
              ? "quizshow:questions.trueFalse.true"
              : "quizshow:questions.trueFalse.false",
          ),
          isChosen:
            lockedPayload?.type === "true_false" &&
            lockedPayload.isTrue === isTrue,
          payload: { type: "true_false", isTrue },
        }))
      : (question.options ?? []).map((option, optionIndex) => {
          const picked = pickQuizshowTextWithLanguage(option.text, language);
          // A poll answers like a multiple choice, with its own payload type (C6.22).
          const payload: QuizshowAnswerPayload =
            question.type === "poll"
              ? { type: "poll", optionIndex }
              : { type: "multiple_choice", optionIndex };
          return {
            key: option.id,
            swatch: answerSwatchFor(optionIndex),
            text: picked.text,
            textLanguage:
              picked.language === language ? undefined : picked.language,
            isChosen:
              (lockedPayload?.type === "multiple_choice" ||
                lockedPayload?.type === "poll") &&
              lockedPayload.optionIndex === optionIndex,
            payload,
          };
        });
  return (
    <ul className={styles.tiles} data-count={choices.length}>
      {choices.map((choice, choiceIndex) => (
        // The press scale and the settle on lock ride on the slot, so the tile keeps its own states.
        <m.li
          key={choice.key}
          className={styles.tileSlot}
          lang={choice.textLanguage}
          whileTap={isTappable && !reducedMotion ? { scale: 0.96 } : undefined}
          animate={
            choice.isChosen && !reducedMotion
              ? { scale: [0.96, 1.03, 1] }
              : { scale: 1 }
          }
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          <QuizshowAnswerTile
            colorKey={choice.swatch.colorKey}
            letter={optionLetter(choiceIndex)}
            text={choice.text}
            size="phone"
            state={tileState(choice.isChosen, isLocked)}
            isDisabled={isLocked || isHeld}
            onSelect={() => {
              if (!isTappable) return;
              // The same short tap the rest of the app gives, inside the gesture so the phone allows it.
              if (!reducedMotion) hapticTap(12);
              onSend(choice.payload);
            }}
            ariaLabel={t("quizshow:stage.answerLabel", {
              letter: optionLetter(choiceIndex),
              shape: t(choice.swatch.labelKey),
              text: choice.text,
            })}
          />
        </m.li>
      ))}
    </ul>
  );
}

/** The question picture on the phone (read and open), alt from `mediaAlt`, with the slow
 *  reveal on the TV's window. Mounted only when the question has a picture. */
export function QuizshowQuestionPicture({
  question,
  mediaUrl,
  cursor,
  talkSeconds,
  language,
  clockOffsetMs,
}: {
  question: QuizshowQuestionView;
  mediaUrl: string;
  /** null (no session yet) shows the picture clear. */
  cursor: QuizshowCursor | null;
  /** The round card's talk seconds (0 in solo, C6.20). */
  talkSeconds: number;
  language: QuizshowLanguage;
  clockOffsetMs: number;
}) {
  const slowReveal = useHeldSlowReveal(question, cursor, talkSeconds * 1000);
  return (
    <QuizshowStagePicture
      className={styles.picture}
      mediaUrl={mediaUrl}
      alt={question.mediaAlt}
      language={language}
      slowReveal={slowReveal}
      clockOffsetMs={clockOffsetMs}
      frozenProgress={frozenRevealProgressOf(
        slowReveal,
        cursor,
        question.timeLimitSeconds * 1000,
      )}
    />
  );
}

export function QuizshowPlayerQuestion({
  controller,
  question,
  language,
  isFixedCanvas = false,
}: {
  controller: QuizshowSessionController;
  question: QuizshowQuestionView;
  language: QuizshowLanguage;
  /**
   * Additive. Drawn on a fixed 390x844 canvas scaled into a frame (the
   * studio's phone preview): the view takes that phone's sizes, whatever the
   * window. A real phone leaves it off.
   */
  isFixedCanvas?: boolean;
}) {
  const { t } = useTranslation();
  const headingRef = useQuizshowHeadingFocus(question.questionId);
  const { lockedPayload, errorKey, send } = useAnswerSender(
    controller,
    question.questionId,
  );
  const { session } = controller.state;
  const player = isPlayerState(session) ? session : null;
  const isLocked = lockedPayload !== null;
  const isLateJoiner = player !== null && !player.isEligibleForQuestion;
  const hasExtraTime = player?.me?.hasExtraTime ?? false;
  const isHeld = useIsAnswerHeld(
    player?.cursor ?? null,
    controller.clockOffsetMs,
    hasExtraTime,
  );
  const isTileQuestion =
    question.type === "multiple_choice" ||
    question.type === "true_false" ||
    question.type === "poll";

  return (
    <div
      className={styles.screenBody}
      data-fixed-canvas={isFixedCanvas ? "true" : undefined}
    >
      <QuizshowCountdownBar
        cursor={player?.cursor ?? null}
        clockOffsetMs={controller.clockOffsetMs}
        hasExtraTime={hasExtraTime}
        standardLimitMs={question.timeLimitSeconds * 1000}
        size="phone"
      />
      {/* The prompt sits in the middle of the free space above the answers. */}
      <div className={styles.promptArea}>
        <h1 ref={headingRef} tabIndex={-1} className={styles.heading}>
          <QuizshowStageText text={question.prompt} language={language} />
        </h1>
        {question.mediaUrl !== null && (
          <QuizshowQuestionPicture
            question={question}
            mediaUrl={question.mediaUrl}
            cursor={player?.cursor ?? null}
            talkSeconds={player?.round?.talkSeconds ?? 0}
            language={language}
            clockOffsetMs={controller.clockOffsetMs}
          />
        )}
        <Collapse isOpen={hasExtraTime}>
          <p className={styles.note}>{t("quizshow:player.extraTimeOn")}</p>
        </Collapse>
      </div>
      {isLateJoiner ? (
        <p className={styles.note}>{t("quizshow:player.waitNextQuestion")}</p>
      ) : (
        <div className={styles.answers}>
          <QuizshowLockedStatus
            text={isLocked ? t("quizshow:player.answerLocked") : null}
          />
          <Collapse isOpen={isLocked}>
            <QuizshowLockedPanel
              title={t("quizshow:player.answerLocked")}
              body={t("quizshow:player.lockedInBody")}
              answeredLine={answeredLineOf(player, question.questionId, t)}
            />
          </Collapse>
          <Collapse isOpen={errorKey !== null}>
            <p role="alert" className={styles.alert}>
              {errorKey === null ? "" : t(errorKey)}
            </p>
          </Collapse>
          {isTileQuestion && (
            <TileChoices
              question={question}
              language={language}
              lockedPayload={lockedPayload}
              isHeld={isHeld}
              onSend={send}
            />
          )}
          {(question.type === "type_answer" ||
            question.type === "closest_number") && (
            <TextAnswer
              key={question.type}
              kind={question.type === "closest_number" ? "number" : "text"}
              unit={
                question.type === "closest_number" ? question.numberUnit : null
              }
              language={language}
              lockedPayload={lockedPayload}
              isLocked={isLocked}
              isHeld={isHeld}
              onSend={send}
            />
          )}
          {question.type === "order" && (
            <QuizshowOrderAnswer
              options={question.options ?? []}
              language={language}
              isLocked={isLocked}
              isHeld={isHeld}
              lockedOrderIds={
                lockedPayload?.type === "order"
                  ? lockedPayload.orderedIds
                  : undefined
              }
              onSubmit={(orderedIds) => send({ type: "order", orderedIds })}
            />
          )}
        </div>
      )}
    </div>
  );
}
