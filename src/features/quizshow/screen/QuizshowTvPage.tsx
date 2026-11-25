import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { MAIN_CONTENT_ID } from "../../../shared/components/layout/SkipToContentLink";
import { Button, Collapse } from "../../../shared/components/ui";
import { useScreenWakeLock } from "../../../shared/hooks/useScreenWakeLock";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PageMeta } from "../../../shared/seo";
import { quizshowErrorKeyOf } from "../api/quizshowErrors";
import {
  QUIZSHOW_TV_LEAVE_STATE,
  isQuizshowTvLeaveState,
  quizshowPlayPath,
  quizshowTvPath,
} from "../quizshowPaths";
import { eventScope, gameScope } from "../quizshowScope";
import { QuizshowBackdrop } from "../stage/QuizshowBackdrop";
import { useQuizshowFramelessPage } from "../useQuizshowFramelessPage";
import { QuizshowPairingCode } from "./QuizshowPairingCode";
import { QuizshowScreenView } from "./QuizshowScreenPage";
import { QuizshowTvNextCode } from "./QuizshowTvNextCode";
import {
  clearDeviceTicket,
  readDevicePairing,
  readLastPairedSessionId,
  saveDeviceTicket,
  type QuizshowPairedClaim,
} from "./quizshowDeviceTicket";
import type { QuizshowHostSession } from "./quizshowHostSession";
import { useHidePointerWhenStill } from "./useHidePointerWhenStill";
import { useQuizshowDevicePairing } from "./useQuizshowDevicePairing";
import pairingStyles from "./QuizshowPairingCode.module.css";
import screenStyles from "./QuizshowScreen.module.css";
import styles from "./QuizshowTvPage.module.css";

/**
 * The refusals that end this TV's pairing: the ticket is cleared and a new
 * code shows. The server drops a device socket at the ticket's exp (contract
 * 4.4), so expiry arrives here as a refusal too; a reload onto a session that
 * has finished refuses the attach with `quizshow_session_finished`. A live end
 * is no refusal: the stage keeps its thank-you view.
 */
const QUIZSHOW_TV_REPAIR_CODES = [
  "quizshow_device_unpaired",
  "quizshow_device_ticket_expired",
  "quizshow_session_finished",
] as const;
type QuizshowTvRepairCode = (typeof QUIZSHOW_TV_REPAIR_CODES)[number];

function isRepairCode(code: string | null): code is QuizshowTvRepairCode {
  return (QUIZSHOW_TV_REPAIR_CODES as readonly (string | null)[]).includes(
    code,
  );
}

/** The last screen pairing this tab made (a helper's pairing never reattaches a TV). Reads only. */
function readStoredPairing(): QuizshowPairedClaim | null {
  const sessionId = readLastPairedSessionId();
  if (sessionId === null) return null;
  return readDevicePairing(sessionId, "screen");
}

/** The screen view's session for a paired TV, built from the claim alone (the TV reads no quiz over REST). */
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
    backPath: quizshowTvPath(),
    // On a TV the back control leaves this pairing for a new code.
    backLabelKey: "quizshow:tv.backToCode",
    backState: QUIZSHOW_TV_LEAVE_STATE,
    noGameKeys: isEvent
      ? { screen: "quizshow:screen.noGame", remote: "quizshow:remote.noGame" }
      : {
          screen: "quizshow:screen.noGameForGame",
          remote: "quizshow:remote.noGameForGame",
        },
    isOrganizer: true,
    isLoading: false,
    sessionId: claim.sessionId,
    errorCode: null,
    hasLoadFailed: false,
    playMode: "solo",
    deviceTicket: claim.deviceTicket,
  };
}

interface QuizshowTvPairedProps {
  claim: QuizshowPairedClaim;
  /** Called with each refusal of the stage's connection; the page keeps only the repair codes. */
  onSessionRefused: (refusalCode: string | null) => void;
  /** Called with the claim a remote made from the code shown after the game ended. */
  onPaired: (claim: QuizshowPairedClaim) => void;
}

/**
 * A paired TV: the presenter screen, attached with the device ticket. Once
 * the session ends (a rematch, a practice before the real game, an abandoned
 * game) the thank-you card stays and a fresh code shows beside it; a remote
 * that pairs it moves this TV to the new session.
 */
function QuizshowTvPaired({
  claim,
  onSessionRefused,
  onPaired,
}: QuizshowTvPairedProps) {
  const hostSession = useMemo(() => hostSessionOfClaim(claim), [claim]);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const handleSessionEnded = useCallback(() => setIsSessionEnded(true), []);
  return (
    <QuizshowScreenView
      hostSession={hostSession}
      onSessionRefused={onSessionRefused}
      onSessionEnded={handleSessionEnded}
      aside={isSessionEnded ? <QuizshowTvNextCode onPaired={onPaired} /> : null}
    />
  );
}

/**
 * The demo's TV page: pairing needs the live app, so it shows only the note
 * and a way back to Pulse Live.
 */
function QuizshowTvDemoPanel() {
  const { t } = useTranslation();
  const titleId = useId();
  return (
    <section className={pairingStyles.panel} aria-labelledby={titleId}>
      <h1 id={titleId} className={pairingStyles.title}>
        {t("quizshow:tv.title")}
      </h1>
      <p className={pairingStyles.body}>{t("quizshow:tv.demoNote")}</p>
      <div className={styles.actions}>
        <Button variant="stage-ghost" to={quizshowPlayPath()}>
          {t("quizshow:player.backToPlay")}
        </Button>
      </div>
    </section>
  );
}

interface QuizshowTvCodeScreenProps {
  isDemo: boolean;
  /** The line for the refusal that ended the last pairing; null after a fresh load. */
  noticeKey: string | null;
  onPaired: (claim: QuizshowPairedClaim) => void;
}

/** The code screen: asks for a code, shows it, and hands the claim up once a remote pairs it. */
function QuizshowTvCodeScreen({
  isDemo,
  noticeKey,
  onPaired,
}: QuizshowTvCodeScreenProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const pairing = useQuizshowDevicePairing("screen", { isEnabled: !isDemo });
  useScreenWakeLock(true);
  useQuizshowFramelessPage();
  useHidePointerWhenStill();

  const { status, claim } = pairing;
  useEffect(() => {
    if (status === "paired" && claim !== null) onPaired(claim);
  }, [claim, onPaired, status]);

  const isFailed = status === "failed";
  // While a poll fails the code still works: a quiet line under it. A failed start is an alert.
  // Once the code's time is up a new one is moments away: its expiry line and poll notice go.
  const isCodeLive = status === "showing" && !pairing.isCodeTimeUp;
  const pollNoticeKey = isCodeLive ? pairing.failureKey : null;
  const failureKey = isFailed ? pairing.failureKey : null;
  const expiresLine =
    isCodeLive && pairing.expiresAt !== null
      ? t("quizshow:tv.expires", { time: format.time(pairing.expiresAt) })
      : null;

  return (
    <div className={screenStyles.page} data-theme="dark" data-qs-theme="dark">
      <QuizshowBackdrop variant="stage" />
      <PageMeta title={t("quizshow:tv.metaTitle")} noIndex />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className={styles.main}>
        {isDemo ? (
          <QuizshowTvDemoPanel />
        ) : (
          <QuizshowPairingCode
            title={t("quizshow:tv.title")}
            body={t("quizshow:tv.body")}
            pairingCode={pairing.pairingCode}
            isCodeHidden={isFailed}
          >
            <Collapse isOpen={noticeKey !== null}>
              <p className={styles.notice} role="alert">
                {noticeKey !== null ? t(noticeKey) : null}
              </p>
            </Collapse>
            <Collapse isOpen={expiresLine !== null}>
              <p className={styles.note}>{expiresLine}</p>
            </Collapse>
            <div role="status" aria-live="polite">
              <Collapse isOpen={pollNoticeKey !== null}>
                <p className={styles.note}>
                  {pollNoticeKey !== null ? t(pollNoticeKey) : null}
                </p>
              </Collapse>
            </div>
            <Collapse isOpen={failureKey !== null}>
              <p className={styles.failure} role="alert">
                {failureKey !== null ? t(failureKey) : null}
              </p>
            </Collapse>
            <Collapse isOpen={isFailed}>
              <div className={styles.actions}>
                <Button variant="stage-ghost" onClick={pairing.restart}>
                  {t("quizshow:tv.newCode")}
                </Button>
              </div>
            </Collapse>
          </QuizshowPairingCode>
        )}
      </main>
    </div>
  );
}

interface QuizshowTvPairingState {
  claim: QuizshowPairedClaim | null;
  /** The navigation the pairing was made or read on; a later one may ask to leave it. */
  locationKey: string;
  /** A session this page left, whose stored ticket an effect clears. */
  leftSessionId: string | null;
}

/**
 * The venue TV at `/play/tv` (contract 6.5), public. A reload reattaches with
 * the ticket this tab stored for a screen; otherwise it shows a pairing code
 * until a host's remote pairs it, then the presenter screen for that session.
 * When the host unpairs it, the ticket expires or a reload finds the session
 * finished, the ticket is cleared and a new code shows with that reason. A
 * session that ends live keeps its thank-you card with a fresh code beside
 * it, and pairing that code moves the TV to the new session. The
 * stage's back control leaves the pairing only when its navigation carries
 * `QUIZSHOW_TV_LEAVE_STATE`. Demo shows only a note that pairing needs the
 * live app and a link back to Pulse Live, and calls nothing.
 */
export function QuizshowTvPage() {
  const { demoMode } = useDemoMode();
  const location = useLocation();
  const [pairing, setPairing] = useState<QuizshowTvPairingState>(() => ({
    claim: readStoredPairing(),
    locationKey: location.key,
    leftSessionId: null,
  }));
  const [noticeKey, setNoticeKey] = useState<string | null>(null);

  // An explicit leave from the stage's back control: adjust during render, clear storage in the effect below.
  if (
    pairing.claim !== null &&
    location.key !== pairing.locationKey &&
    isQuizshowTvLeaveState(location.state)
  ) {
    setPairing({
      claim: null,
      locationKey: location.key,
      leftSessionId: pairing.claim.sessionId,
    });
    setNoticeKey(null);
  }

  const { leftSessionId } = pairing;
  useEffect(() => {
    if (leftSessionId !== null) clearDeviceTicket(leftSessionId);
  }, [leftSessionId]);

  const handlePaired = useCallback(
    (pairedClaim: QuizshowPairedClaim) => {
      saveDeviceTicket(pairedClaim, "screen");
      setNoticeKey(null);
      // Paired again after a game ended: the ended session's ticket goes.
      setPairing((current) => {
        const endedSessionId = current.claim?.sessionId ?? null;
        return {
          claim: pairedClaim,
          locationKey: location.key,
          leftSessionId:
            endedSessionId !== pairedClaim.sessionId ? endedSessionId : null,
        };
      });
    },
    [location.key],
  );

  const { claim } = pairing;
  const pairedSessionId = claim?.sessionId ?? null;
  const handleSessionRefused = useCallback(
    (refusalCode: string | null) => {
      if (pairedSessionId === null || !isRepairCode(refusalCode)) return;
      clearDeviceTicket(pairedSessionId);
      setNoticeKey(quizshowErrorKeyOf(refusalCode));
      setPairing((current) =>
        current.claim?.sessionId === pairedSessionId
          ? { ...current, claim: null }
          : current,
      );
    },
    [pairedSessionId],
  );

  if (!demoMode && claim !== null) {
    return (
      <QuizshowTvPaired
        key={claim.sessionId}
        claim={claim}
        onSessionRefused={handleSessionRefused}
        onPaired={handlePaired}
      />
    );
  }
  return (
    <QuizshowTvCodeScreen
      isDemo={demoMode}
      noticeKey={noticeKey}
      onPaired={handlePaired}
    />
  );
}
