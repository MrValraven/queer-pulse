import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowScopeKind } from "../../../shared/contracts/quizshow";
import {
  isPlayerState,
  type QuizshowClientState,
} from "../realtime/quizshowClientStore";
import { QuizshowPodium } from "../stage/QuizshowPodium";
import { QuizshowReportGameButton } from "./QuizshowReportGameButton";
import styles from "./QuizshowPlay.module.css";
import { playerBackLinkOf } from "./quizshowPlayerBackLink";
import {
  placeFromPodium,
  isRemovedOf,
  placeFromScores,
  type QuizshowFinalPlace,
} from "./usePlayJoin";

/** A host removed this player: say so kindly and point back to the event or to Pulse Live. */
export function QuizshowRemovedNotice({
  kind,
  eventSlug,
  reportSubject = null,
}: {
  /** null when the join was refused, so the kind of game is unknown; Pulse Live is the way out. */
  kind: QuizshowScopeKind | null;
  /** null for a game, or when the join was refused. */
  eventSlug: string | null;
  /** A game session whose id and quiz title are known: the player can still report it. */
  reportSubject?: { sessionId: string; quizTitle: string } | null;
}) {
  const { t } = useTranslation();
  const backLink = playerBackLinkOf(kind ?? "game", eventSlug);
  return (
    <div className={styles.endStack}>
      <h1 className={styles.title}>{t("quizshow:errors.player_removed")}</h1>
      <p className={styles.lead}>
        {t(
          kind === "event"
            ? "quizshow:player.removedBody"
            : "quizshow:player.removedBodyGame",
        )}
      </p>
      <Button to={backLink.to} size="lg">
        {t(backLink.labelKey)}
      </Button>
      <Collapse isOpen={kind === "game" && reportSubject !== null}>
        {reportSubject !== null && (
          <QuizshowReportGameButton
            sessionId={reportSubject.sessionId}
            quizTitle={reportSubject.quizTitle}
          />
        )}
      </Collapse>
    </div>
  );
}

interface QuizshowPlayerEndProps {
  state: QuizshowClientState;
  /** A game leads back to Pulse Live and has no next event. */
  kind: QuizshowScopeKind;
  /** null for a game without an event. */
  eventSlug: string | null;
  /** The place remembered from the scores frames; the podium is the fallback. */
  finalPlace?: QuizshowFinalPlace | null;
  /** Demo only: starts the game again. */
  onPlayAgain?: () => void;
}

export function QuizshowPlayerEnd({
  state,
  kind,
  eventSlug,
  finalPlace = null,
  onPlayAgain,
}: QuizshowPlayerEndProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const playerSession = isPlayerState(state.session) ? state.session : null;
  if (isRemovedOf(state)) {
    return (
      <QuizshowRemovedNotice
        kind={kind}
        eventSlug={eventSlug}
        reportSubject={
          playerSession !== null && playerSession.kind === "game"
            ? {
                sessionId: playerSession.sessionId,
                quizTitle: playerSession.quizTitle,
              }
            : null
        }
      />
    );
  }
  const backLink = playerBackLinkOf(kind, eventSlug);

  const placeKey =
    state.session?.playMode === "teams"
      ? "quizshow:player.teamPlace"
      : "quizshow:player.finalPlace";
  const podium = state.sessionEnd?.podium ?? state.session?.podium ?? [];
  const isAbandoned = state.sessionEnd?.status === "abandoned";
  const nextEvent =
    kind === "game"
      ? null
      : (state.sessionEnd?.nextEvent ?? state.session?.nextEvent);
  const place = isAbandoned
    ? null
    : (finalPlace ?? placeFromScores(state) ?? placeFromPodium(state, podium));

  const isReportShown =
    playerSession !== null &&
    playerSession.kind === "game" &&
    playerSession.me !== null;

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
        <Button to={backLink.to} variant="ghost" size="lg">
          {t(backLink.labelKey)}
        </Button>
      </div>
      <Collapse isOpen={isReportShown}>
        {playerSession !== null && (
          <QuizshowReportGameButton
            sessionId={playerSession.sessionId}
            quizTitle={playerSession.quizTitle}
          />
        )}
      </Collapse>
    </div>
  );
}
