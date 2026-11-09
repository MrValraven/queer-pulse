import type {
  QuizshowCursor,
  QuizshowLanguage,
  QuizshowPlayableRoundKind,
  QuizshowRoundKind,
  QuizshowText,
  QuizshowWheelBonusView,
  QuizshowWheelPick,
  QuizshowWheelSlice,
  QuizshowWheelView,
} from "../../../shared/contracts/quizshow";
import { intlLocale } from "../../../shared/i18n/locale";
import type { TFunction } from "../../../shared/i18n/types";
import { displayRoundNumber, isQuizRoundKind } from "../quizshowWheel";
import { pickQuizshowText } from "./quizshowText";
import { playingWheelSliceOf } from "./quizshowWheelView";

/** A catalog key (with its `quizshow:` prefix) and the values to interpolate. */
export interface QuizshowCopy {
  key: string;
  values: Record<string, string | number>;
}

/** The translate function the live surfaces hold (`t` from useTranslation fits). */
export type QuizshowTranslate = TFunction;

/** The round rows a surface knows (`session.rounds`, or the studio's draft rows): only their kinds are read. */
export type QuizshowRoundKindRows = ReadonlyArray<{ kind: QuizshowRoundKind }>;

const PREFIX = "quizshow:";
/** At or above this many winners the award names a count instead of the names. */
const BONUS_COUNT_FROM = 4;

function copyOf(
  key: string,
  values: Record<string, string | number> = {},
): QuizshowCopy {
  return { key: `${PREFIX}${key}`, values };
}

/**
 * A slice's title as every live surface prints it: the title in the screen's
 * language, or "Round N" (rounds.untitled) while the row is still blank, so a
 * fresh round never shows an empty disc label, button or sentence.
 */
export function wheelTitleOf(
  title: QuizshowText,
  roundIndex: number,
  rounds: QuizshowRoundKindRows,
  language: QuizshowLanguage,
  translate: QuizshowTranslate,
): string {
  const picked = pickQuizshowText(title, language);
  if (picked.trim() !== "") return picked;
  return translate(`${PREFIX}rounds.untitled`, {
    number: displayRoundNumber(rounds, roundIndex),
  });
}

/** wheelTitleOf for a wheel slice. */
export function wheelSliceTitleOf(
  slice: Pick<QuizshowWheelSlice, "roundIndex" | "title">,
  rounds: QuizshowRoundKindRows,
  language: QuizshowLanguage,
  translate: QuizshowTranslate,
): string {
  return wheelTitleOf(
    slice.title,
    slice.roundIndex,
    rounds,
    language,
    translate,
  );
}

/** stage.wheel.kind.quiz for a quiz slice; stage.wheel.kind.party for every party kind. */
export function wheelSliceKindKey(kind: QuizshowPlayableRoundKind): string {
  return `${PREFIX}stage.wheel.kind.${isQuizRoundKind(kind) ? "quiz" : "party"}`;
}

/** Pick a round: metaQuizRound / metaPartyRound with { count: questionCount }. Pick a question: metaQuizQuestion / metaPartyQuestion. */
export function wheelSliceMetaCopy(
  slice: QuizshowWheelSlice,
  pick: QuizshowWheelPick,
): QuizshowCopy {
  const kindName = isQuizRoundKind(slice.kind) ? "Quiz" : "Party";
  if (pick === "question") return copyOf(`stage.wheel.meta${kindName}Question`);
  return copyOf(`stage.wheel.meta${kindName}Round`, {
    count: slice.questionCount,
  });
}

/** Where a slice's bonus goes: the round's winner or the question's winner. */
export function wheelBonusTargetKey(pick: QuizshowWheelPick): string {
  return `${PREFIX}stage.wheel.${
    pick === "question" ? "bonusToQuestionWinner" : "bonusToRoundWinner"
  }`;
}

/** Planned wheels read "spin N of M"; an unplanned wheel has one spin and reads "next round". */
export function wheelPillCopy(wheel: QuizshowWheelView): QuizshowCopy {
  if (wheel.wheelRoundIndex === null)
    return copyOf("stage.wheel.pillUnplanned");
  return copyOf("stage.wheel.pill", {
    number: wheel.spinNumber,
    total: wheel.spinTotal,
  });
}

/**
 * The award sentence: 1 winner, 2 or 3 tied winners, or 4 and more as a count.
 * The server only sends a bonus with winners; one with none falls back to the
 * slice's "+500 bonus" line so no sentence ever names an empty list.
 */
export function wheelBonusAwardCopy(
  bonus: QuizshowWheelBonusView,
  rounds: QuizshowRoundKindRows,
  language: QuizshowLanguage,
  translate: QuizshowTranslate,
): QuizshowCopy {
  const title = wheelTitleOf(
    bonus.sliceTitle,
    bonus.sliceRoundIndex,
    rounds,
    language,
    translate,
  );
  const winnerCount = bonus.winners.length;
  if (winnerCount === 0) {
    return copyOf("stage.wheel.sliceBonus", { points: bonus.points });
  }
  if (winnerCount >= BONUS_COUNT_FROM) {
    const isTeamAward = bonus.winners[0]?.kind === "team";
    return copyOf(
      isTeamAward
        ? "stage.wheel.bonusAwardTeams"
        : "stage.wheel.bonusAwardPlayers",
      { points: bonus.points, count: winnerCount, title },
    );
  }
  const names = new Intl.ListFormat(intlLocale(language), {
    type: "conjunction",
  }).format(bonus.winners.map((winner) => winner.name));
  return copyOf(
    winnerCount === 1 ? "stage.wheel.bonusAward" : "stage.wheel.bonusAwardTied",
    { points: bonus.points, names, title },
  );
}

/** The stage's round line: the category pill for a pick-a-question wheel question, else "Round N of M". */
export function stageRoundLineCopy(
  cursor: QuizshowCursor,
  wheel: QuizshowWheelView | null,
  rounds: QuizshowRoundKindRows,
  language: QuizshowLanguage,
  translate: QuizshowTranslate,
): QuizshowCopy {
  if (
    wheel !== null &&
    wheel.pick === "question" &&
    wheel.playingRoundIndex !== null &&
    wheel.playingRoundIndex === cursor.roundIndex
  ) {
    const playingSlice = playingWheelSliceOf(wheel);
    if (playingSlice !== null) {
      return copyOf("stage.wheel.questionPill", {
        category: wheelSliceTitleOf(playingSlice, rounds, language, translate),
        number: wheel.spinNumber,
        total: wheel.spinTotal,
      });
    }
  }
  return copyOf("stage.roundOf", {
    number: cursor.roundNumber,
    total: cursor.roundCount,
  });
}
