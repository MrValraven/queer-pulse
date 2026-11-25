import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { MAIN_CONTENT_ID } from "../../../shared/components/layout/SkipToContentLink";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useScreenWakeLock } from "../../../shared/hooks/useScreenWakeLock";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PageMeta } from "../../../shared/seo/PageMeta";
import { quizshowHelperRemotePath, quizshowPlayPath } from "../quizshowPaths";
import { QuizshowPairingCode } from "../screen/QuizshowPairingCode";
import { saveDeviceTicket } from "../screen/quizshowDeviceTicket";
import {
  QUIZSHOW_PAIRING_POLL_KEYS,
  useQuizshowDevicePairing,
} from "../screen/useQuizshowDevicePairing";
import { QuizshowBackdrop } from "../stage/QuizshowBackdrop";
import { useQuizshowFramelessPage } from "../useQuizshowFramelessPage";
import remoteStyles from "./QuizshowRemote.module.css";
import styles from "./QuizshowRemotePairing.module.css";

/** The slow-poll line speaks of screens; a helper's phone reads its own. */
function helperPollNoticeKeyOf(pollKey: string | null): string | null {
  return pollKey === QUIZSHOW_PAIRING_POLL_KEYS.rateLimited
    ? "quizshow:helper.pollSlow"
    : pollKey;
}

/**
 * A helper's phone at `/play/remote` (contract 6.5, signed in): it shows a
 * pairing code until the host's remote pairs it, stores the helper ticket for
 * this tab, then opens the helper remote for that session. The code renews by
 * itself when its time is up. Demo has no pairing: it calls nothing and shows
 * only the note with a way back to Pulse Live.
 */
export function QuizshowHelperPairPage() {
  const { t } = useTranslation();
  const format = useFormat();
  const navigate = useNavigate();
  const { demoMode } = useDemoMode();
  const pairing = useQuizshowDevicePairing("helper", { isEnabled: !demoMode });
  useQuizshowFramelessPage();
  // The host may take a minute to type the code in; the phone stays awake meanwhile.
  useScreenWakeLock(!demoMode);

  const { status, claim } = pairing;
  useEffect(() => {
    if (status !== "paired" || claim === null) return;
    saveDeviceTicket(claim, "helper");
    void navigate(quizshowHelperRemotePath(claim.sessionId), { replace: true });
  }, [claim, navigate, status]);

  const isFailed = status === "failed";
  // While a poll fails the code still works: a quiet line under it. A failed start is an alert.
  const isCodeLive = status === "showing" && !pairing.isCodeTimeUp;
  const pollNoticeKey = isCodeLive
    ? helperPollNoticeKeyOf(pairing.failureKey)
    : null;
  const failureKey = isFailed ? pairing.failureKey : null;
  const expiresLine =
    isCodeLive && pairing.expiresAt !== null
      ? t("quizshow:tv.expires", { time: format.time(pairing.expiresAt) })
      : null;

  return (
    <div className={remoteStyles.page} data-theme="dark">
      <div className={remoteStyles.backdrop}>
        <QuizshowBackdrop variant="phone" />
      </div>
      <PageMeta title={t("quizshow:helper.metaTitle")} noIndex />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className={styles.helperMain}>
        {demoMode ? (
          // Demo has no pairing, so the note and the way back are all the page holds.
          <div className={remoteStyles.message}>
            <h1 className={remoteStyles.messageTitle}>
              {t("quizshow:helper.demoNote")}
            </h1>
            <Button to={quizshowPlayPath()} variant="stage-ghost">
              {t("quizshow:player.backToPlay")}
            </Button>
          </div>
        ) : (
          <QuizshowPairingCode
            title={t("quizshow:helper.title")}
            body={t("quizshow:helper.body")}
            pairingCode={pairing.pairingCode}
            isCodeHidden={isFailed}
          >
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
