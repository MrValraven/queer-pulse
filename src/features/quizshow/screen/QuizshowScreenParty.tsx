import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { CollapseListItem } from "../../../shared/components/ui/CollapseListItem";
import { useMediaQuery } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_LIMITS,
  type QuizshowLanguage,
  type QuizshowQuestionView,
  type QuizshowScreenState,
  type QuizshowText,
  type QuizshowVoteOption,
} from "../../../shared/contracts/quizshow";
import { QuizshowDistribution } from "../stage/QuizshowDistribution";
import { QuizshowStagePicture } from "../stage/QuizshowStagePicture";
import { QuizshowStageText } from "../stage/QuizshowStageText";
import { pickQuizshowText, primaryLanguageOf } from "../stage/quizshowText";
import { stageRoundLineCopy } from "../stage/quizshowWheelCopy";
import {
  QuizshowScreenAnswered,
  QuizshowScreenHeader,
} from "./QuizshowScreenChrome";
import type { QuizshowScreenStageSize } from "./QuizshowScreenStage";
import { SCREEN_EASE } from "./quizshowScreenMotion";
import styles from "./QuizshowScreen.module.css";

/** The checking line's fold as the vote opens: quicker than the vote grid's open, so the two never overlap for long. */
const CHECKING_EXIT_TRANSITION = { duration: 0.1, ease: SCREEN_EASE } as const;

const COUNTER_KEYS = {
  write: "quizshow:stage.written",
  vote: "quizshow:stage.voted",
} as const;

/** The reveal shows the leading entries the screen height holds under the
 *  header, a three-line prompt card and the count: six (three rows of two)
 *  on a tall screen, four (two rows) on a short one (720p, the CSS's
 *  max-height: 50rem) or the remote's 1280x720 canvas. A tall screen that
 *  also carries the practice badge and a two-language prompt holds two rows
 *  as well (five entries would still take three). The rest fold into a
 *  "+N more" line. */
const REVEAL_ENTRIES_SHOWN_MAX = { tall: 6, tallCrowded: 4, short: 4 } as const;
const SHORT_SCREEN_QUERY = "(max-height: 50rem)";
/** Up to this many entries take the answer's full type size. */
const REVEAL_ENTRIES_FEW_MAX = 4;
/** Up to this many captions take the answer tiles' size, two to a row, set low. */
const VOTE_OPTIONS_FEW_MAX = 4;
/** Up to this many captions keep the larger vote type in four columns. */
const VOTE_OPTIONS_ROOMY_MAX = 12;
/** The picture's corner: the --qs-radius-tile token (--radius-16), as a
 *  number so Motion can scale-correct it while the slot glides. */
const PICTURE_RADIUS_PX = 16;
/** The prompt card and the picture glide together between their sizes. */
const PROMPT_LAYOUT_TRANSITION = {
  layout: { duration: 0.4, ease: SCREEN_EASE },
} as const;
/** Up to this many sit in six columns; more take eight, so 32 fit in four rows. */
const VOTE_OPTIONS_MANY_MAX = 24;

type VoteDensity = "few" | "roomy" | "many" | "packed";

function voteDensityFor(optionCount: number): VoteDensity {
  if (optionCount <= VOTE_OPTIONS_FEW_MAX) return "few";
  if (optionCount <= VOTE_OPTIONS_ROOMY_MAX) return "roomy";
  if (optionCount <= VOTE_OPTIONS_MANY_MAX) return "many";
  return "packed";
}
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

/**
 * The party picture: full size while players write, smaller once the
 * captions or the reveal sit below it. The slot carries the glide; the
 * picture inside names itself with the question's alt text (C6.29 item 25).
 * Party rounds store an instant picture, so it never runs the slow reveal.
 */
function PartyPicture({
  mediaUrl,
  alt,
  language,
  clockOffsetMs,
  isCompact,
}: {
  mediaUrl: string;
  alt: QuizshowText;
  language: QuizshowLanguage;
  clockOffsetMs: number;
  isCompact: boolean;
}) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <m.div
      className={styles.partyPictureSlot}
      data-size={isCompact ? "compact" : "full"}
      layout={reducedMotion ? false : true}
      transition={PROMPT_LAYOUT_TRANSITION}
      // On the slot as a style value, so Motion keeps the corners round while it scales.
      style={{ borderRadius: PICTURE_RADIUS_PX }}
    >
      <QuizshowStagePicture
        className={styles.partyPicture}
        mediaUrl={mediaUrl}
        alt={alt}
        language={language}
        slowReveal={null}
        clockOffsetMs={clockOffsetMs}
      />
    </m.div>
  );
}

/**
 * "4 of 12 written" while players write, "9 of 12 voted" while they vote.
 * The row is held through every party phase, so nothing above it moves. The
 * vote's count is a fresh row (keyed by its label): it starts at the vote's
 * own number and never rolls down from the write's.
 */
function PartyCounter({ session }: { session: QuizshowScreenState }) {
  const phase = session.cursor.phase;
  const counterKey = phase === "vote" ? COUNTER_KEYS.vote : COUNTER_KEYS.write;
  return (
    <QuizshowScreenAnswered
      key={counterKey}
      isReserved
      hasCount={
        (phase === "write" || phase === "vote") && session.answerCount !== null
      }
      labelKey={counterKey}
      count={session.answerCount?.count ?? 0}
      total={session.answerCount?.total ?? 0}
    />
  );
}

/**
 * The prompt and its picture on one glass card. Card, prompt and picture
 * glide together when the card steps down to its compact size, so the
 * picture never spills over what sits below. Without prompt text the card
 * holds the picture alone, centred.
 */
function PartyPromptCard({
  session,
  question,
  clockOffsetMs,
  isCompact,
}: {
  session: QuizshowScreenState;
  question: QuizshowQuestionView;
  clockOffsetMs: number;
  isCompact: boolean;
}) {
  const { reducedMotion } = useMotionPrefs();
  const leadLanguage = primaryLanguageOf(session.screenLanguage);
  const hasPrompt = pickQuizshowText(question.prompt, leadLanguage) !== "";
  if (!hasPrompt && question.mediaUrl === null) return null;
  const isLayoutAnimated = !reducedMotion;
  return (
    <m.div
      className={styles.promptCard}
      data-compact={isCompact ? "true" : "false"}
      data-has-prompt={hasPrompt ? "true" : "false"}
      layout={isLayoutAnimated}
      transition={PROMPT_LAYOUT_TRANSITION}
    >
      {hasPrompt && (
        <m.h1
          className={styles.partyPrompt}
          layout={isLayoutAnimated}
          transition={PROMPT_LAYOUT_TRANSITION}
        >
          <QuizshowStageText
            text={question.prompt}
            language={session.screenLanguage}
          />
        </m.h1>
      )}
      {question.mediaUrl !== null && (
        <PartyPicture
          mediaUrl={question.mediaUrl}
          alt={question.mediaAlt}
          language={leadLanguage}
          clockOffsetMs={clockOffsetMs}
          isCompact={isCompact}
        />
      )}
    </m.div>
  );
}

interface QuizshowScreenPartyProps {
  session: QuizshowScreenState;
  question: QuizshowQuestionView;
  clockOffsetMs: number;
  size: QuizshowScreenStageSize;
  /** A fixed 1280x720 canvas holds the short screen's number of reveal entries. */
  isFixedCanvas?: boolean;
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
  isFixedCanvas = false,
}: QuizshowScreenPartyProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isShortScreen = useMediaQuery(SHORT_SCREEN_QUERY);
  const isCrowdedTall = session.isPractice && session.screenLanguage === "both";
  let revealEntriesMax: number = isCrowdedTall
    ? REVEAL_ENTRIES_SHOWN_MAX.tallCrowded
    : REVEAL_ENTRIES_SHOWN_MAX.tall;
  if (isShortScreen || isFixedCanvas)
    revealEntriesMax = REVEAL_ENTRIES_SHOWN_MAX.short;
  const { cursor } = session;
  const phase = cursor.phase;
  const leadLanguage = primaryLanguageOf(session.screenLanguage);
  // "Round N of M", or the category pill on a pick-a-question wheel question; the kind follows either.
  const roundLine = stageRoundLineCopy(
    cursor,
    session.wheel,
    session.rounds,
    leadLanguage,
    t,
  );
  // The picture and prompt step back once the captions or the reveal sit below them.
  const isCompact = phase === "vote" || phase === "reveal";
  // Kept through the reveal, so the cards fold away with their text in place.
  const voteOptions =
    session.voteOptions?.questionId === question.questionId
      ? session.voteOptions.options
      : [];
  const reveal =
    phase === "reveal" && session.reveal?.questionId === question.questionId
      ? session.reveal
      : null;
  const isFewReveal =
    reveal !== null &&
    reveal.distribution.kind === "votes" &&
    reveal.distribution.entries.length <= REVEAL_ENTRIES_FEW_MAX;
  // A few options sit low, where the multiple-choice tiles sit, and the
  // reveal lands in the same place.
  const isVoteFew = voteDensityFor(voteOptions.length) === "few";

  return (
    <div className={styles.question}>
      <QuizshowScreenHeader
        meta={[
          {
            id: "round",
            text: t(roundLine.key, roundLine.values),
          },
          {
            id: "kind",
            text: t(`quizshow:kind.${question.roundKind}.name`),
          },
        ]}
        cursor={cursor}
        clockOffsetMs={clockOffsetMs}
        standardLimitMs={
          (phase === "vote"
            ? QUIZSHOW_LIMITS.voteSecondsDefault
            : question.timeLimitSeconds) * 1000
        }
        size={size}
      />
      {/* The prompt and its picture share one glass card. */}
      {/* Write, review and reveal centre the card in the free height; the vote grid needs it all, so the vote starts at the top. */}
      <div
        className={styles.partyMain}
        data-centred={phase === "vote" ? "false" : "true"}
      >
        <PartyPromptCard
          session={session}
          question={question}
          clockOffsetMs={clockOffsetMs}
          isCompact={isCompact}
        />
        {/* The line fades out fast as the vote opens, so it is gone before the card and the grid move under it. */}
        <Collapse
          isOpen={phase === "review"}
          exitTransition={CHECKING_EXIT_TRANSITION}
        >
          <p className={styles.checking}>
            <span
              className={`${styles.checkingPulse} ${reducedMotion ? styles.checkingPulseStill : ""}`}
              aria-hidden="true"
            />
            {session.answerCount === null
              ? t("quizshow:stage.checking")
              : t("quizshow:stage.checkingCount", {
                  count: session.answerCount.count,
                })}
          </p>
        </Collapse>
        <Collapse
          isOpen={phase === "vote" && voteOptions.length > 0}
          className={isVoteFew ? styles.partyLow : undefined}
        >
          <VoteGrid options={voteOptions} />
        </Collapse>
        <Collapse
          isOpen={reveal !== null}
          className={isFewReveal ? styles.partyLow : undefined}
        >
          {reveal !== null && (
            <div
              className={styles.partyReveal}
              data-few={isFewReveal ? "true" : undefined}
            >
              <QuizshowDistribution
                reveal={reveal}
                question={question}
                language={session.screenLanguage}
                size={size}
                maxEntries={revealEntriesMax}
              />
            </div>
          )}
        </Collapse>
      </div>
      <PartyCounter session={session} />
    </div>
  );
}
