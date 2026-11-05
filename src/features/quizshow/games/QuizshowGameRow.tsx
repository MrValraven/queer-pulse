import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import { FiChevronRight } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import type { QuizshowGameSummary } from "../../../shared/contracts/quizshow";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { quizshowGamePath } from "../quizshowPaths";
import { QuizshowGameCover } from "./QuizshowGameCover";
import styles from "./QuizshowGames.module.css";

const EDITED_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};
const FADE_EASE = [0.22, 0.68, 0.16, 1] as const;

/** A tag that fades in and out as a refetch turns it on or off. Mount it inside `AnimatePresence`. */
export function FadingTag({
  className,
  children,
}: {
  /** Optional: CSS module classes type as `string | undefined`. */
  className?: string;
  children: ReactNode;
}) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <m.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.2, ease: FADE_EASE }}
    >
      {children}
    </m.span>
  );
}

/** One My games card: the whole card opens the game page, so nothing inside it is interactive. */
export function QuizshowGameRow({ game }: { game: QuizshowGameSummary }) {
  const { t } = useTranslation();
  const format = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const trimmedTitle = game.title.trim();
  const liveSession = game.liveSession;
  const isLobbyOpen = liveSession?.status === "lobby";
  return (
    <Link to={quizshowGamePath(game.id)} className={styles.card}>
      {/* The cover is a picture of the title slide; the text below carries the same facts. */}
      <div aria-hidden className={styles.coverFrame}>
        <QuizshowGameCover
          title={game.title}
          roundCount={game.roundCount}
          questionCount={game.questionCount}
          isAdultsOnly={false}
        />
      </div>
      <div className={styles.cardText}>
        {/* The cover is the visible title; this heading names the link and holds the full title. */}
        <h3 className={styles.visuallyHidden}>
          {trimmedTitle.length > 0 ? trimmedTitle : t("quizshow:game.untitled")}
        </h3>
        <div className={styles.cardHead}>
          <p className={styles.cardMeta}>
            {/* The cover shows the counts, so the text carries them for assistive tech. */}
            <span className={styles.visuallyHidden}>
              {t("quizshow:packs.rounds", { count: game.roundCount })}
              {", "}
              {t("quizshow:packs.questions", { count: game.questionCount })}
              {", "}
            </span>
            {t("quizshow:games.row.edited", {
              date: format.date(new Date(game.updatedAt), EDITED_DATE_FORMAT),
            })}
          </p>
          <FiChevronRight
            aria-hidden
            fill="none"
            className={styles.cardChevron}
          />
        </div>
        <span className={styles.tags}>
          <AnimatePresence initial={false}>
            {liveSession !== null && (
              <FadingTag
                key="live"
                className={`${styles.tag} ${styles.tagLive}`}
              >
                <span
                  aria-hidden
                  className={`${styles.liveDot} ${
                    reducedMotion ? "" : styles.liveDotPulse
                  }`}
                />
                {t(
                  isLobbyOpen
                    ? "quizshow:games.row.lobbyTag"
                    : "quizshow:games.row.liveTag",
                  { code: liveSession.joinCode },
                )}
              </FadingTag>
            )}
            {game.isAdultsOnly && (
              <FadingTag
                key="adults"
                className={`${styles.tag} ${styles.tagAdults}`}
              >
                {t("quizshow:games.row.adultsTag")}
              </FadingTag>
            )}
            {game.hasResults && (
              <FadingTag key="results" className={styles.tag}>
                {t("quizshow:games.row.resultsTag")}
              </FadingTag>
            )}
          </AnimatePresence>
        </span>
      </div>
    </Link>
  );
}
