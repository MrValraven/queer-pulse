import { Link } from "react-router-dom";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { QuizBadgeWinDTO } from "../../shared/contracts/quizWinBadges";
import { gatheringPath } from "../gatherings/gatheringPaths";
import styles from "./QuizBadges.module.css";

interface QuizBadgeWinListProps {
  wins: QuizBadgeWinDTO[];
}

/** One line per game win, in the order given: the event and game number, and
 *  the day it was won. A win from a masked or removed event reads as a
 *  QueerPulse quiz night, and links only while its event page exists. */
export function QuizBadgeWinList({ wins }: QuizBadgeWinListProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <ol className={styles.winList}>
      {wins.map((win) => {
        const eventName = win.eventName ?? t("members:badges.quiz.maskedEvent");
        // Game numbers repeat across events, so the timestamp joins the key.
        const winKey = `${win.wonAt}:${win.eventSlug ?? "masked"}:${win.gameNumber}`;
        return (
          <li key={winKey} className={styles.winItem}>
            <span className={styles.winLine}>
              <Translation
                i18nKey="members:badges.quiz.winLine"
                values={{ number: win.gameNumber }}
                slots={{
                  event: win.eventSlug ? (
                    <Link
                      to={gatheringPath(win.eventSlug)}
                      className={styles.winLink}
                    >
                      {eventName}
                    </Link>
                  ) : (
                    eventName
                  ),
                }}
              />
            </span>
            <time className={styles.winDate} dateTime={win.wonAt}>
              {fmt.date(new Date(win.wonAt))}
            </time>
          </li>
        );
      })}
    </ol>
  );
}
