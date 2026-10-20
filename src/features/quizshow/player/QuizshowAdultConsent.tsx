import type { QuizshowJoinHost } from "../../../shared/contracts/quizshow";
import { Button } from "../../../shared/components/ui/Button";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./QuizshowPlay.module.css";

/**
 * The 18+ step before the name step, for a game of either kind. Join game
 * moves on to the name form, which then sends the consent with `lobby:join`.
 */
export function QuizshowAdultConsent({
  host,
  quizTitle,
  onAccept,
  onLeave,
}: {
  /** The game's owner; null on an event game. The page shows their card above this step. */
  host: QuizshowJoinHost | null;
  quizTitle: string;
  onAccept: () => void;
  onLeave: () => void;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.endStack}>
      {host === null && <p className={styles.hostQuizTitle}>{quizTitle}</p>}
      <h1 className={styles.title}>{t("quizshow:player.adults.title")}</h1>
      <p className={styles.lead}>{t("quizshow:player.adults.body")}</p>
      <div className={styles.actions}>
        <Button size="lg" onClick={onAccept}>
          {t("quizshow:player.adults.join")}
        </Button>
        <Button variant="ghost" size="lg" onClick={onLeave}>
          {t("quizshow:player.adults.leave")}
        </Button>
      </div>
    </section>
  );
}
