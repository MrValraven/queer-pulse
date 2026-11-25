import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import type {
  QuizFinishedGameDTO,
  QuizGameWinnerDTO,
} from "../../../shared/contracts/quizWinBadges";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminPanel } from "../ui";
import { AdminQuizFinishedGameWinner } from "./AdminQuizFinishedGameWinner";
import { AdminQuizRevokeGameWinDialog } from "./AdminQuizRevokeGameWinDialog";
import { QUIZ_EVENT_DATE_FORMAT } from "./quizEventSetup.model";
import styles from "./AdminQuizEventBadges.module.css";

interface AdminQuizFinishedGamesProps {
  eventId: string;
  games: readonly QuizFinishedGameDTO[];
}

/**
 * Every numbered game of the event that has finished, each with its winners
 * and the badges they got. Revoke win on a live winner opens the revoke
 * dialog for that winner. A revoke folds the button away, so focus lands on
 * that winner's name once the dialog closes.
 */
export function AdminQuizFinishedGames({
  eventId,
  games,
}: AdminQuizFinishedGamesProps) {
  const { t } = useTranslation();
  const [revokingWinner, setRevokingWinner] =
    useState<QuizGameWinnerDTO | null>(null);
  const winnerNames = useRef(new Map<string, HTMLElement>());
  const revokedWinnerIdRef = useRef<string | null>(null);

  // Runs after the closing dialog has handed focus back to the opener, and the
  // dialog keeps this newer focus when it is finally removed.
  useEffect(() => {
    const revokedWinnerId = revokedWinnerIdRef.current;
    if (revokingWinner !== null || revokedWinnerId === null) return;
    revokedWinnerIdRef.current = null;
    winnerNames.current.get(revokedWinnerId)?.focus();
  }, [revokingWinner]);

  const nameRefOf = (winnerId: string) => (element: HTMLElement | null) => {
    if (element) winnerNames.current.set(winnerId, element);
    else winnerNames.current.delete(winnerId);
  };

  return (
    <AdminPanel
      className={styles.finished}
      title={t("quizshow:winBadges.admin.finished.title")}
    >
      {games.length === 0 ? (
        <p className={styles.quietLine}>
          {t("quizshow:winBadges.admin.finished.empty")}
        </p>
      ) : (
        <div className={styles.finishedGames}>
          {games.map((game) => (
            <FinishedGame
              key={game.sessionId}
              game={game}
              onRevoke={setRevokingWinner}
              nameRefOf={nameRefOf}
            />
          ))}
        </div>
      )}
      <AnimatePresence>
        {revokingWinner !== null && (
          <AdminQuizRevokeGameWinDialog
            key={revokingWinner.winnerId}
            eventId={eventId}
            winner={revokingWinner}
            onClose={() => setRevokingWinner(null)}
            onRevoked={() => {
              revokedWinnerIdRef.current = revokingWinner.winnerId;
            }}
          />
        )}
      </AnimatePresence>
    </AdminPanel>
  );
}

function FinishedGame({
  game,
  onRevoke,
  nameRefOf,
}: {
  game: QuizFinishedGameDTO;
  onRevoke: (winner: QuizGameWinnerDTO) => void;
  nameRefOf: (winnerId: string) => (element: HTMLElement | null) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <section className={styles.finishedGame}>
      <h3 className={styles.finishedTitle}>
        {t("quizshow:winBadges.admin.finished.game", {
          number: game.gameNumber,
          date: fmt.date(new Date(game.finishedAt), QUIZ_EVENT_DATE_FORMAT),
        })}
      </h3>
      {game.winners.length === 0 ? (
        <p className={styles.quietLine}>
          {t("quizshow:winBadges.admin.finished.noWinner")}
        </p>
      ) : (
        <ul className={styles.winners}>
          {game.winners.map((winner) => (
            <li key={winner.winnerId}>
              <AdminQuizFinishedGameWinner
                winner={winner}
                onRevoke={() => onRevoke(winner)}
                nameRef={nameRefOf(winner.winnerId)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
