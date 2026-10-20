import { useState, type FormEvent } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { Button, Collapse, FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_LIMITS,
  type QuizshowAnswerPayload,
  type QuizshowLanguage,
  type QuizshowQuestionView,
} from "../../../shared/contracts/quizshow";
import { isPlayerState } from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QuizshowAnswerTile } from "../stage/QuizshowAnswerTile";
import { QuizshowCountdownBar } from "../stage/QuizshowCountdownBar";
import { optionLetter, pickQuizshowText } from "../stage/quizshowText";
import {
  answerSwatchFor,
  trueFalseSwatchFor,
  type QuizshowSwatch,
} from "../quizshowSwatches";
import { QuizshowOrderAnswer } from "./QuizshowOrderAnswer";
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
  lockedPayload: QuizshowAnswerPayload | null;
  isLocked: boolean;
  /** Paused or past the player's own deadline: the draft stays editable, sending waits. */
  isHeld: boolean;
  onSend: (payload: QuizshowAnswerPayload) => void;
}

function TextAnswer({
  kind,
  lockedPayload,
  isLocked,
  isHeld,
  onSend,
}: TextAnswerProps) {
  const { t } = useTranslation();
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
    <form className={styles.form} onSubmit={submit}>
      <FormField
        label={t(
          kind === "number"
            ? "quizshow:player.numberLabel"
            : "quizshow:player.typeLabel",
        )}
      >
        <input
          type="text"
          value={draft}
          maxLength={QUIZSHOW_LIMITS.typedAnswerMax}
          inputMode={kind === "number" ? "decimal" : "text"}
          enterKeyHint="send"
          autoComplete="off"
          aria-disabled={isLocked}
          readOnly={isLocked}
          onChange={(event) => setDraft(event.target.value)}
        />
      </FormField>
      <Button
        type="submit"
        variant="primary"
        aria-disabled={isLocked || isHeld || !isReady}
      >
        {t("quizshow:player.submit")}
      </Button>
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
  const isLocked = lockedPayload !== null;
  const choices: Array<{
    key: string;
    swatch: QuizshowSwatch;
    text: string;
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
      : (question.options ?? []).map((option, optionIndex) => ({
          key: option.id,
          swatch: answerSwatchFor(optionIndex),
          text: pickQuizshowText(option.text, language),
          isChosen:
            lockedPayload?.type === "multiple_choice" &&
            lockedPayload.optionIndex === optionIndex,
          payload: { type: "multiple_choice", optionIndex },
        }));
  return (
    <ul className={styles.tiles}>
      {choices.map((choice, choiceIndex) => (
        <li key={choice.key}>
          <QuizshowAnswerTile
            colorKey={choice.swatch.colorKey}
            letter={optionLetter(choiceIndex)}
            text={choice.text}
            size="phone"
            state={tileState(choice.isChosen, isLocked)}
            isDisabled={isLocked || isHeld}
            onSelect={() => {
              if (isLocked || isHeld) return;
              onSend(choice.payload);
            }}
            ariaLabel={t("quizshow:stage.answerLabel", {
              letter: optionLetter(choiceIndex),
              shape: t(choice.swatch.labelKey),
              text: choice.text,
            })}
          />
        </li>
      ))}
    </ul>
  );
}

export function QuizshowPlayerQuestion({
  controller,
  question,
  language,
}: {
  controller: QuizshowSessionController;
  question: QuizshowQuestionView;
  language: QuizshowLanguage;
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

  return (
    <div className={styles.screenBody}>
      <h1 ref={headingRef} tabIndex={-1} className={styles.heading}>
        {pickQuizshowText(question.prompt, language)}
      </h1>
      {question.mediaUrl !== null && (
        <img className={styles.media} src={question.mediaUrl} alt="" />
      )}
      <QuizshowCountdownBar
        cursor={player?.cursor ?? null}
        clockOffsetMs={controller.clockOffsetMs}
        hasExtraTime={hasExtraTime}
        standardLimitMs={question.timeLimitSeconds * 1000}
        size="phone"
      />
      <Collapse isOpen={hasExtraTime}>
        <p className={styles.note}>{t("quizshow:player.extraTimeOn")}</p>
      </Collapse>
      {isLateJoiner ? (
        <p className={styles.note}>{t("quizshow:player.waitNextQuestion")}</p>
      ) : (
        <>
          {(question.type === "multiple_choice" ||
            question.type === "true_false") && (
            <TileChoices
              question={question}
              language={language}
              lockedPayload={lockedPayload}
              isHeld={isHeld}
              onSend={send}
            />
          )}
          {question.type === "type_answer" && (
            <TextAnswer
              kind="text"
              lockedPayload={lockedPayload}
              isLocked={isLocked}
              isHeld={isHeld}
              onSend={send}
            />
          )}
          {question.type === "closest_number" && (
            <TextAnswer
              kind="number"
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
          <Collapse isOpen={isLocked}>
            <div className={styles.locked}>
              <p className={styles.lockedTitle}>
                <FiCheckCircle aria-hidden />
                {t("quizshow:player.lockedIn")}
              </p>
              <p className={styles.lockedBody}>
                {t("quizshow:player.lockedInBody")}
              </p>
            </div>
          </Collapse>
          <Collapse isOpen={errorKey !== null}>
            <p role="alert" className={styles.alert}>
              {errorKey === null ? "" : t(errorKey)}
            </p>
          </Collapse>
        </>
      )}
    </div>
  );
}
