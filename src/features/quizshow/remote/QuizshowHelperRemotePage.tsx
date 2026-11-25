import { useCallback, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { routes } from "../../../app/routeMap";
import { MAIN_CONTENT_ID } from "../../../shared/components/layout/SkipToContentLink";
import { Button } from "../../../shared/components/ui/Button";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PageMeta } from "../../../shared/seo/PageMeta";
import { quizshowHelperPairPath } from "../quizshowPaths";
import { eventScope, gameScope } from "../quizshowScope";
import {
  clearDeviceTicket,
  readDevicePairing,
  type QuizshowPairedClaim,
} from "../screen/quizshowDeviceTicket";
import type { QuizshowHostSession } from "../screen/quizshowHostSession";
import { QuizshowBackdrop } from "../stage/QuizshowBackdrop";
import { useQuizshowFramelessPage } from "../useQuizshowFramelessPage";
import { QuizshowRemoteView } from "./QuizshowRemotePage";
import remoteStyles from "./QuizshowRemote.module.css";
import styles from "./QuizshowRemotePairing.module.css";

/**
 * The refusals that end a helper's pairing, each with the copy the helper
 * reads (the shared lines speak of a screen). The ticket is cleared and the
 * page offers a new code. A finished session and a session the server
 * cannot find keep their shared lines; an event ban or a block reads as one
 * bar, so the helper never learns which.
 */
const HELPER_REPAIR_KEYS: ReadonlyMap<string, string> = new Map([
  ["quizshow_device_unpaired", "quizshow:helper.refusal.deviceUnpaired"],
  ["quizshow_device_ticket_expired", "quizshow:helper.refusal.ticketExpired"],
  ["quizshow_helper_is_playing", "quizshow:helper.refusal.helperIsPlaying"],
  ["quizshow_banned_from_event", "quizshow:helper.refusal.bannedFromEvent"],
  ["quizshow_session_finished", "quizshow:errors.session_finished"],
  ["quizshow_session_not_found", "quizshow:errors.session_not_found"],
]);

/** The remote's session for a paired helper, built from the claim alone (no quiz read over REST). */
function hostSessionOfClaim(claim: QuizshowPairedClaim): QuizshowHostSession {
  const isEvent = claim.kind === "event";
  return {
    scope: isEvent
      ? eventScope(claim.eventSlug ?? "")
      : gameScope(claim.gameId ?? ""),
    slug: isEvent ? claim.eventSlug : null,
    eventTitle: null,
    gameTitle: "",
    isAdultsOnly: false,
    backPath: routes.play,
    backLabelKey: "quizshow:player.backToPlay",
    noGameKeys: isEvent
      ? { screen: "quizshow:screen.noGame", remote: "quizshow:remote.noGame" }
      : {
          screen: "quizshow:screen.noGameForGame",
          remote: "quizshow:remote.noGameForGame",
        },
    // The host's pairing is the helper's grant (C6.5).
    isOrganizer: true,
    isLoading: false,
    sessionId: claim.sessionId,
    errorCode: null,
    hasLoadFailed: false,
    // Only the demo engine reads this; live, the console reads the session's own play mode.
    playMode: "solo",
    deviceTicket: claim.deviceTicket,
  };
}

/** Why this helper's pairing ended, and the way to a new code. */
function HelperPairingEnded({ messageKey }: { messageKey: string }) {
  const { t } = useTranslation();
  useQuizshowFramelessPage();
  return (
    <div className={remoteStyles.page} data-theme="dark">
      <div className={remoteStyles.backdrop}>
        <QuizshowBackdrop variant="phone" />
      </div>
      <PageMeta title={t("quizshow:helper.metaTitle")} noIndex />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className={styles.helperMain}>
        <div className={styles.helperMessage}>
          <div role="alert">
            <h1 className={styles.helperMessageTitle}>{t(messageKey)}</h1>
          </div>
          <Button to={quizshowHelperPairPath()} variant="stage">
            {t("quizshow:helper.pairAgain")}
          </Button>
        </div>
      </main>
    </div>
  );
}

/**
 * A paired helper's remote at `/play/remote/:sessionId` (contract 6.5, signed
 * in): the host's remote driven from socket state alone with the helper
 * ticket this tab stored, so a reload reattaches. Without a stored helper
 * pairing it goes to the code page, and so does demo, which has no pairing.
 * An unpairing, an expired ticket, a helper who joined as a player or one the
 * event bars clears the ticket and offers a new code.
 */
export function QuizshowHelperRemotePage() {
  const { sessionId = "" } = useParams();
  const { demoMode } = useDemoMode();
  const claim = useMemo(
    () => (sessionId === "" ? null : readDevicePairing(sessionId, "helper")),
    [sessionId],
  );
  const hostSession = useMemo(
    () => (claim === null ? null : hostSessionOfClaim(claim)),
    [claim],
  );
  const [endedKey, setEndedKey] = useState<string | null>(null);

  const handleSessionRefused = useCallback(
    (refusalCode: string) => {
      const messageKey = HELPER_REPAIR_KEYS.get(refusalCode);
      if (messageKey === undefined || claim === null) return;
      clearDeviceTicket(claim.sessionId);
      setEndedKey(messageKey);
    },
    [claim],
  );

  if (endedKey !== null) return <HelperPairingEnded messageKey={endedKey} />;
  if (demoMode || hostSession === null) {
    return <Navigate to={quizshowHelperPairPath()} replace />;
  }
  return (
    <QuizshowRemoteView
      key={sessionId}
      hostSession={hostSession}
      onSessionRefused={handleSessionRefused}
    />
  );
}
