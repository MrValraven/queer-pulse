import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiFlag } from "react-icons/fi";
import { Collapse } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowLanguage,
  QuizshowPartyRevealEntry,
  QuizshowPlayerState,
} from "../../../shared/contracts/quizshow";
import { ReportListingModal } from "../../economy/ReportListingModal";
import { orderRevealEntries } from "../stage/quizshowRevealOrder";
import styles from "./QuizshowPlayer.module.css";
import { partyHeadingOf } from "./quizshowPartyHeading";
import { entrantTotalOf } from "./quizshowRevealOutcome";
import { useQuizshowHeadingFocus } from "./useQuizshowHeadingFocus";

/** A party reveal on the phone: every entry with author, votes, truth and favourite,
 *  the truth first and then the most voted, and Report on other players' entries.
 *  An entry is the player's own when it matches the vote's own option or the own
 *  answer id from the reveal (that one survives a reconnect). */
export function QuizshowPartyReveal({
  state,
  language,
}: {
  state: QuizshowPlayerState;
  language: QuizshowLanguage;
}) {
  const { t } = useTranslation();
  const [reportedEntry, setReportedEntry] =
    useState<QuizshowPartyRevealEntry | null>(null);
  const { reveal, question, voteOptions, myReveal } = state;
  const format = useFormat();
  const headingRef = useQuizshowHeadingFocus(state.cursor.phaseId);
  if (reveal === null || reveal.distribution.kind !== "votes") return null;
  const { entries, favouriteOptionId } = reveal.distribution;
  const ownOptionId = voteOptions?.ownOptionId ?? null;
  const ownAnswerId =
    myReveal !== null && myReveal.questionId === reveal.questionId
      ? myReveal.ownAnswerId
      : null;
  return (
    <div className={styles.screenBody}>
      {question !== null && (
        <h1 ref={headingRef} tabIndex={-1} className={styles.heading}>
          {partyHeadingOf(question, language, t)}
        </h1>
      )}
      {question !== null && question.mediaUrl !== null && (
        <img className={styles.media} src={question.mediaUrl} alt="" />
      )}
      <ul className={styles.entries}>
        {orderRevealEntries(entries).map((entry) => {
          const isOwn =
            (ownOptionId !== null && entry.optionId === ownOptionId) ||
            (ownAnswerId !== null && entry.answerId === ownAnswerId);
          const canReport = entry.answerId !== null && !isOwn;
          return (
            <li key={entry.optionId} className={styles.entry}>
              <p className={styles.entryText}>{entry.text}</p>
              <div className={styles.entryMeta}>
                {entry.isTruth && (
                  <span className={styles.entryTag}>
                    {t("quizshow:stage.theTruth")}
                  </span>
                )}
                {entry.authorName !== null && (
                  <span>
                    {t("quizshow:stage.writtenBy", { name: entry.authorName })}
                  </span>
                )}
                <span>
                  {t("quizshow:stage.votes", { count: entry.voteCount })}
                </span>
                {entry.optionId === favouriteOptionId && (
                  <span className={styles.entryTag}>
                    {t("quizshow:stage.favourite")}
                  </span>
                )}
                {canReport && (
                  <button
                    type="button"
                    className={styles.reportButton}
                    aria-label={t("quizshow:player.reportAria", {
                      text: entry.text,
                    })}
                    onClick={() => setReportedEntry(entry)}
                  >
                    <FiFlag aria-hidden />
                    {t("quizshow:player.report")}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <Collapse isOpen={myReveal !== null}>
        {myReveal !== null && (
          <ul className={styles.facts}>
            <li className={`${styles.fact} ${styles.factStrong}`}>
              {t("quizshow:player.pointsEarned", {
                points: format.number(myReveal.pointsAwarded),
              })}
            </li>
            <li className={styles.fact}>
              {t(
                state.playMode === "teams"
                  ? "quizshow:player.teamPlace"
                  : "quizshow:player.place",
                { place: myReveal.rank, total: entrantTotalOf(state) },
              )}
            </li>
          </ul>
        )}
      </Collapse>
      <AnimatePresence>
        {reportedEntry !== null && reportedEntry.answerId !== null && (
          <ReportListingModal
            key={reportedEntry.answerId}
            subjectType="quizshow_answer"
            subjectId={reportedEntry.answerId}
            subjectName={reportedEntry.text}
            onClose={() => setReportedEntry(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
