import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { CollapseListItem } from "../../../shared/components/ui/CollapseListItem";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_LIMITS,
  type QuizshowQuestionView,
  type QuizshowScreenState,
  type QuizshowVoteOption,
} from "../../../shared/contracts/quizshow";
import { QuizshowCountdownBar } from "../stage/QuizshowCountdownBar";
import { QuizshowDistribution } from "../stage/QuizshowDistribution";
import { pickQuizshowText } from "../stage/quizshowText";
import type { QuizshowScreenStageSize } from "./QuizshowScreenStage";
import styles from "./QuizshowScreen.module.css";

const COUNTER_KEYS = {
  write: "quizshow:stage.written",
  vote: "quizshow:stage.voted",
} as const;

/** The reveal shows the eight leading entries; the rest fold into a "+N more" line. */
const REVEAL_ENTRIES_SHOWN_MAX = 8;
/** Up to this many captions keep the larger vote type in four columns. */
const VOTE_OPTIONS_ROOMY_MAX = 12;
/** Up to this many sit in six columns; more take eight, so 32 fit in four rows. */
const VOTE_OPTIONS_MANY_MAX = 24;

function voteDensityFor(optionCount: number): "roomy" | "many" | "packed" {
  if (optionCount <= VOTE_OPTIONS_ROOMY_MAX) return "roomy";
  if (optionCount <= VOTE_OPTIONS_MANY_MAX) return "many";
  return "packed";
}
const PICTURE_EASE = [0.22, 0.68, 0.16, 1] as const;
/** The dense grid's slots: four rows of eight fit 1080p and 720p. Past that,
 *  the first 31 options show in the order sent and the last slot holds "+N more". */
const VOTE_SLOTS_MAX = 32;

/** The vote cards. Every player still lists every option on their phone. */
function VoteGrid({ options }: { options: QuizshowVoteOption[] }) {
  const { t } = useTranslation();
  const shownOptions =
    options.length > VOTE_SLOTS_MAX
      ? options.slice(0, VOTE_SLOTS_MAX - 1)
      : options;
  const moreCount = options.length - shownOptions.length;
  return (
    <ol
      className={styles.voteGrid}
      data-density={voteDensityFor(options.length)}
    >
      <AnimatePresence initial={false}>
        {shownOptions.map((option, optionIndex) => (
          <CollapseListItem key={option.optionId}>
            <div className={styles.voteCard}>
              <span className={styles.voteNumber} aria-hidden="true">
                {optionIndex + 1}
              </span>
              <span className={styles.voteText}>{option.text}</span>
            </div>
          </CollapseListItem>
        ))}
        {moreCount > 0 && (
          <CollapseListItem key="more-options">
            <p className={styles.voteMore}>
              {t("quizshow:screen.morePlayers", { count: moreCount })}
            </p>
          </CollapseListItem>
        )}
      </AnimatePresence>
    </ol>
  );
}

/** The party picture: full size while players write, smaller once the captions or the reveal sit below it. */
function PartyPicture({
  mediaUrl,
  isCompact,
}: {
  mediaUrl: string;
  isCompact: boolean;
}) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <m.img
      className={styles.picture}
      src={mediaUrl}
      alt=""
      data-size={isCompact ? "compact" : "full"}
      layout={reducedMotion ? false : true}
      transition={{ layout: { duration: 0.4, ease: PICTURE_EASE } }}
    />
  );
}

function PartyCounter({ session }: { session: QuizshowScreenState }) {
  const phase = session.cursor.phase;
  const counterKey =
    phase === "write" || phase === "vote" ? COUNTER_KEYS[phase] : null;
  const count = session.answerCount?.count ?? 0;
  const total = session.answerCount?.total ?? 0;
  return (
    <Collapse isOpen={counterKey !== null && session.answerCount !== null}>
      <p className={styles.counter}>
        {counterKey !== null && (
          <Translation
            i18nKey={counterKey}
            values={{ count, total }}
            slots={{
              count: (
                <RollingNumber value={String(count)} numericValue={count} />
              ),
            }}
          />
        )}
      </p>
    </Collapse>
  );
}

interface QuizshowScreenPartyProps {
  session: QuizshowScreenState;
  question: QuizshowQuestionView;
  clockOffsetMs: number;
  size: QuizshowScreenStageSize;
}

/**
 * A party question in `write`, `review`, `vote` and `reveal`. Vote options
 * carry no author; names arrive with the reveal only.
 */
export function QuizshowScreenParty({
  session,
  question,
  clockOffsetMs,
  size,
}: QuizshowScreenPartyProps) {
  const { t } = useTranslation();
  const { cursor, screenLanguage: language } = session;
  const phase = cursor.phase;
  const prompt = pickQuizshowText(question.prompt, language);
  // Kept through the reveal, so the cards fold away with their text in place.
  const voteOptions =
    session.voteOptions?.questionId === question.questionId
      ? session.voteOptions.options
      : [];
  const reveal =
    phase === "reveal" && session.reveal?.questionId === question.questionId
      ? session.reveal
      : null;

  return (
    <div className={styles.question}>
      <p className={styles.eyebrow}>
        <span>{t(`quizshow:kind.${question.roundKind}.name`)}</span>
        <span>
          {t("quizshow:stage.roundOf", {
            number: question.roundIndex + 1,
            total: cursor.roundCount,
          })}
        </span>
      </p>
      {prompt !== "" && <h1 className={styles.prompt}>{prompt}</h1>}
      {question.mediaUrl !== null && (
        <PartyPicture
          mediaUrl={question.mediaUrl}
          isCompact={phase === "vote" || phase === "reveal"}
        />
      )}
      <Collapse isOpen={phase === "review"}>
        <p className={styles.checking}>
          {session.answerCount === null
            ? t("quizshow:stage.checking")
            : t("quizshow:stage.checkingCount", {
                count: session.answerCount.count,
              })}
        </p>
      </Collapse>
      <Collapse isOpen={phase === "vote" && voteOptions.length > 0}>
        <VoteGrid options={voteOptions} />
      </Collapse>
      <QuizshowCountdownBar
        cursor={cursor}
        clockOffsetMs={clockOffsetMs}
        hasExtraTime={false}
        standardLimitMs={
          (phase === "vote"
            ? QUIZSHOW_LIMITS.voteSecondsDefault
            : question.timeLimitSeconds) * 1000
        }
        size={size}
      />
      <PartyCounter session={session} />
      <Collapse isOpen={reveal !== null}>
        {reveal !== null && (
          <div className={styles.partyReveal}>
            <QuizshowDistribution
              reveal={reveal}
              question={question}
              language={language}
              size={size}
              maxEntries={REVEAL_ENTRIES_SHOWN_MAX}
            />
          </div>
        )}
      </Collapse>
    </div>
  );
}
