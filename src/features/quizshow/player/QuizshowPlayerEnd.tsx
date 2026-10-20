import { routes } from "../../../app/routeMap";
import { Button } from "../../../shared/components/ui/Button";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { gatheringPath } from "../../gatherings/gatheringPaths";
import type { QuizshowClientState } from "../realtime/quizshowClientStore";
import { QuizshowPodium } from "../stage/QuizshowPodium";
import styles from "./QuizshowPlay.module.css";
import {
  placeFromPodium,
  isRemovedOf,
  placeFromScores,
  type QuizshowFinalPlace,
} from "./usePlayJoin";

/** A host removed this player: say so kindly and point back to the event. */
export function QuizshowRemovedNotice({
  eventSlug,
}: {
  /** null when the join was refused, so only the events list is known. */
  eventSlug: string | null;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.endStack}>
      <h1 className={styles.title}>{t("quizshow:errors.player_removed")}</h1>
      <p className={styles.lead}>{t("quizshow:player.removedBody")}</p>
      <Button
        to={eventSlug === null ? routes.gatherings : gatheringPath(eventSlug)}
        size="lg"
      >
        {t("quizshow:player.backToEvent")}
      </Button>
    </div>
  );
}

interface QuizshowPlayerEndProps {
  state: QuizshowClientState;
  eventSlug: string;
  /** The place remembered from the scores frames; the podium is the fallback. */
  finalPlace?: QuizshowFinalPlace | null;
  /** Demo only: starts the game again. */
  onPlayAgain?: () => void;
}

export function QuizshowPlayerEnd({
  state,
  eventSlug,
  finalPlace = null,
  onPlayAgain,
}: QuizshowPlayerEndProps) {
  const { t } = useTranslation();
  const format = useFormat();
  if (isRemovedOf(state))
    return <QuizshowRemovedNotice eventSlug={eventSlug} />;

  const placeKey =
    state.session?.playMode === "teams"
      ? "quizshow:player.teamPlace"
      : "quizshow:player.finalPlace";
  const podium = state.sessionEnd?.podium ?? state.session?.podium ?? [];
  const isAbandoned = state.sessionEnd?.status === "abandoned";
  const nextEvent = state.sessionEnd?.nextEvent ?? state.session?.nextEvent;
  const place = isAbandoned
    ? null
    : (finalPlace ?? placeFromScores(state) ?? placeFromPodium(state, podium));

  return (
    <div className={styles.endStack}>
      <h1 className={styles.title}>
        {isAbandoned
          ? t("quizshow:stage.abandoned")
          : t("quizshow:player.endedTitle")}
      </h1>
      {place !== null && (
        <p className={styles.place} role="status">
          {t(placeKey, {
            place: place.place,
            total: place.total,
          })}
        </p>
      )}
      {podium.length > 0 && <QuizshowPodium entries={podium} size="phone" />}
      {nextEvent && (
        <p className={styles.lead}>
          {t("quizshow:stage.nextEvent", {
            event: nextEvent.title,
            date: format.date(new Date(nextEvent.startAt)),
          })}
        </p>
      )}
      <div className={styles.actions}>
        {onPlayAgain !== undefined && (
          <Button size="lg" onClick={onPlayAgain}>
            {t("quizshow:player.playAgain")}
          </Button>
        )}
        <Button to={gatheringPath(eventSlug)} variant="ghost" size="lg">
          {t("quizshow:player.backToEvent")}
        </Button>
      </div>
    </div>
  );
}
