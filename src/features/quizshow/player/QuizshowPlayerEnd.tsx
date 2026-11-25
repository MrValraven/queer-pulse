import { useContext } from "react";
import { FiHeart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { communityPath } from "../../../app/routeMap";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowGivingLink,
  QuizshowNextEvent,
  QuizshowPodiumEntry,
  QuizshowRematch,
  QuizshowScopeKind,
} from "../../../shared/contracts/quizshow";
import { GIVING_TAB_ID } from "../../communities/giving/givingConstants";
import { useIsQuizshowVisible } from "../quizshowLaunch";
import {
  normaliseJoinCode,
  QUIZSHOW_GAMES_ROUTE,
  quizshowPlayPath,
} from "../quizshowPaths";
import {
  isPlayerState,
  type QuizshowClientState,
} from "../realtime/quizshowClientStore";
import { QuizshowPodium } from "../stage/QuizshowPodium";
import { QuizshowPracticeBadge } from "../stage/QuizshowPracticeBadge";
import { quizshowPlaceOf } from "../stage/quizshowOrdinal";
import { QuizshowNextEventCard } from "./QuizshowNextEventCard";
import { QuizshowReportGameButton } from "./QuizshowReportGameButton";
import { QuizshowYourNight } from "./QuizshowYourNight";
import { QuizshowTryOutContext } from "./quizshowTryOutContext";
import styles from "./QuizshowPlay.module.css";
import endStyles from "./QuizshowPlayerEnd.module.css";
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
  rejoinCode = null,
}: {
  /** null when the join was refused, so the kind of game is unknown; Pulse Live is the way out. */
  kind: QuizshowScopeKind | null;
  /** null for a game, or when the join was refused. */
  eventSlug: string | null;
  /** A game session whose id and quiz title are known: the player can still report it. */
  reportSubject?: { sessionId: string; quizTitle: string } | null;
  /** The game's join code when the host lets this player join again (C6.14); null otherwise. */
  rejoinCode?: string | null;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // The studio's try-out phone stays in the studio: neither way out shows.
  const isTryOut = useContext(QuizshowTryOutContext);
  const backLink = playerBackLinkOf(kind ?? "game", eventSlug);
  return (
    <div className={`${styles.endStack} ${styles.sheet}`}>
      <h1 className={styles.title}>{t("quizshow:errors.player_removed")}</h1>
      <p className={styles.lead}>
        {t(
          kind === "event"
            ? "quizshow:player.removedBody"
            : "quizshow:player.removedBodyGame",
        )}
      </p>
      <Collapse isOpen={rejoinCode !== null && !isTryOut}>
        <div className={endStyles.rejoin}>
          <p className={styles.lead}>{t("quizshow:player.removedCanRejoin")}</p>
          {rejoinCode !== null && !isTryOut && (
            <Button
              variant="stage"
              size="lg"
              onClick={() => void navigate(quizshowPlayPath(rejoinCode))}
            >
              {t("quizshow:player.joinAgain")}
            </Button>
          )}
        </div>
      </Collapse>
      {!isTryOut && (
        <Button
          to={backLink.to}
          variant={rejoinCode === null ? "stage" : "stage-ghost"}
          size="lg"
        >
          {t(backLink.labelKey)}
        </Button>
      )}
      <Collapse
        isOpen={kind === "game" && reportSubject !== null}
        className={styles.reportRow}
      >
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

/** The key `QuizshowJoinForm` reads to preselect the old team on a rematch (D7). */
function rematchTeamNameKey(joinCode: string): string {
  return `quizshow.rematchTeamName.${normaliseJoinCode(joinCode)}`;
}

/**
 * "Join the rematch" (C6.17): remembers the old team's name for the join form
 * of the new code, in this tab only, then opens that code.
 */
function RematchButton({
  rematch,
  lastTeamName,
}: {
  rematch: QuizshowRematch;
  lastTeamName: string | null;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const joinRematch = () => {
    const teamName = lastTeamName?.trim() ?? "";
    if (rematch.playMode === "teams" && teamName !== "") {
      try {
        window.sessionStorage.setItem(
          rematchTeamNameKey(rematch.joinCode),
          teamName,
        );
      } catch {
        // Blocked storage only loses the preselected team; the join still opens.
      }
    }
    void navigate(quizshowPlayPath(rematch.joinCode));
  };
  return (
    <Button
      variant="stage"
      size="lg"
      className={endStyles.fullWidth}
      onClick={joinRematch}
    >
      {t("quizshow:player.rematch")}
    </Button>
  );
}

/** "Support {name}" links to the community's Support section, where its giving methods live (C6.27). */
function GivingLink({ giving }: { giving: QuizshowGivingLink }) {
  const { t } = useTranslation();
  return (
    <Button
      to={`${communityPath(giving.communitySlug)}?tab=${GIVING_TAB_ID}`}
      variant="stage-ghost"
      size="lg"
      className={endStyles.givingLink}
    >
      <FiHeart aria-hidden="true" focusable="false" fill="none" />
      {t("quizshow:player.giving", { name: giving.communityName })}
    </Button>
  );
}

/** "That's the game" or "This game has ended", then the practice note when it was one. */
function EndHeading({
  isAbandoned,
  isPractice,
}: {
  isAbandoned: boolean;
  isPractice: boolean;
}) {
  const { t } = useTranslation();
  return (
    <>
      <h1 className={styles.title}>
        {isAbandoned
          ? t("quizshow:stage.abandoned")
          : t("quizshow:player.endedTitle")}
      </h1>
      <Collapse isOpen={isPractice}>
        <div className={endStyles.practice}>
          <QuizshowPracticeBadge tone="phone" />
          <p className={styles.lead}>{t("quizshow:player.practiceEnd")}</p>
        </div>
      </Collapse>
    </>
  );
}

/** The place as an ordinal (item 44), with the total the scores counted. */
function EndPlace({
  place,
  isTeams,
}: {
  place: QuizshowFinalPlace;
  isTeams: boolean;
}) {
  const { t, language } = useTranslation();
  return (
    <div className={styles.placeCard}>
      <p className={styles.place} role="status">
        {t(
          isTeams
            ? "quizshow:player.teamPlaceLine"
            : "quizshow:player.placeLine",
          { place: quizshowPlaceOf(place.place, place.total, language, t) },
        )}
      </p>
    </div>
  );
}

interface EndFacts {
  podium: QuizshowPodiumEntry[];
  isAbandoned: boolean;
  isPractice: boolean;
  nextEvent: QuizshowNextEvent | null;
  giving: QuizshowGivingLink | null;
  place: QuizshowFinalPlace | null;
  rematch: QuizshowRematch | null;
}

/** What the end screen shows, read from the end frame first and the ended state second. */
function endFactsOf(
  state: QuizshowClientState,
  kind: QuizshowScopeKind,
  finalPlace: QuizshowFinalPlace | null,
): EndFacts {
  const { session, sessionEnd } = state;
  const podium = sessionEnd?.podium ?? session?.podium ?? [];
  const isAbandoned = sessionEnd?.status === "abandoned";
  return {
    podium,
    isAbandoned,
    isPractice: sessionEnd?.isPractice ?? session?.isPractice ?? false,
    nextEvent:
      kind === "game"
        ? null
        : (sessionEnd?.nextEvent ?? session?.nextEvent ?? null),
    giving: isAbandoned
      ? null
      : (sessionEnd?.giving ?? session?.giving ?? null),
    place: isAbandoned
      ? null
      : (finalPlace ??
        placeFromScores(state) ??
        placeFromPodium(state, podium)),
    rematch: isAbandoned ? null : state.rematch,
  };
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
  // Pulse Live's own games are only for members who can see the feature.
  const isQuizshowVisible = useIsQuizshowVisible();
  // The studio's try-out phone stays in the studio: every link out of the game stays hidden.
  const isTryOut = useContext(QuizshowTryOutContext);
  const playerSession = isPlayerState(state.session) ? state.session : null;
  if (isRemovedOf(state)) {
    return (
      <QuizshowRemovedNotice
        kind={kind}
        eventSlug={eventSlug}
        rejoinCode={
          // Joining again only works while the game is still open.
          state.canRejoinAfterRemoval && state.sessionEnd === null
            ? (state.session?.joinCode ?? null)
            : null
        }
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
  const end = endFactsOf(state, kind, finalPlace);
  const isNightShown = state.nightLog.length > 0;
  const isMakeYourOwnShown = isQuizshowVisible && !end.isAbandoned && !isTryOut;
  const hasLeadAction = end.rematch !== null || onPlayAgain !== undefined;
  const isReportShown =
    playerSession !== null &&
    playerSession.kind === "game" &&
    playerSession.me !== null;
  // The player's own player or team, marked on the podium and listed first in a tie.
  const ownEntrantId =
    playerSession?.playMode === "teams"
      ? (playerSession.me?.teamId ?? null)
      : (playerSession?.me?.playerId ?? null);

  return (
    <div className={styles.endStack}>
      <EndHeading isAbandoned={end.isAbandoned} isPractice={end.isPractice} />
      {/* With the night card shown, the place is one of its facts. */}
      <Collapse isOpen={end.place !== null && !isNightShown}>
        {end.place !== null && (
          <EndPlace
            place={end.place}
            isTeams={state.session?.playMode === "teams"}
          />
        )}
      </Collapse>
      {end.podium.length > 0 && (
        <QuizshowPodium
          entries={end.podium}
          size="phone"
          highlightEntrantId={ownEntrantId}
        />
      )}
      <Collapse isOpen={end.rematch !== null && !isTryOut}>
        {end.rematch !== null && !isTryOut && (
          <RematchButton
            rematch={end.rematch}
            lastTeamName={state.lastTeamName}
          />
        )}
      </Collapse>
      <Collapse isOpen={isNightShown}>
        <QuizshowYourNight
          nightLog={state.nightLog}
          finalPlace={end.place}
          quizTitle={state.session?.quizTitle ?? ""}
          isTeams={state.session?.playMode === "teams"}
        />
      </Collapse>
      <Collapse isOpen={end.nextEvent !== null && !isTryOut}>
        {end.nextEvent !== null && !isTryOut && (
          <QuizshowNextEventCard nextEvent={end.nextEvent} />
        )}
      </Collapse>
      <Collapse isOpen={end.giving !== null && !isTryOut}>
        {end.giving !== null && !isTryOut && <GivingLink giving={end.giving} />}
      </Collapse>
      <div className={styles.actions}>
        {onPlayAgain !== undefined && (
          <Button
            variant={end.rematch === null ? "stage" : "stage-ghost"}
            size="lg"
            onClick={onPlayAgain}
          >
            {t("quizshow:player.playAgain")}
          </Button>
        )}
        <Collapse isOpen={isMakeYourOwnShown}>
          <Button
            to={QUIZSHOW_GAMES_ROUTE}
            variant="stage-ghost"
            size="lg"
            className={endStyles.fullWidth}
          >
            {t("quizshow:player.makeYourOwn")}
          </Button>
        </Collapse>
        {!isTryOut && (
          <Button
            to={backLink.to}
            variant={hasLeadAction ? "stage-ghost" : "stage"}
            size="lg"
          >
            {t(backLink.labelKey)}
          </Button>
        )}
      </div>
      <Collapse isOpen={isReportShown} className={styles.reportRow}>
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
