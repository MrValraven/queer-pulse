import { useId } from "react";
import { Button, QrCode } from "../../../shared/components/ui";
import type { QuizshowLiveSessionRef } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  quizshowScopeRemotePath,
  quizshowScopeRemoteUrl,
  quizshowScopeScreenPath,
  type QuizshowScope,
} from "../quizshowScope";
import styles from "./QuizshowLobby.module.css";

const QR_SIZE = 128;
// Same pairing as the other QR plates: the light plate keeps scanners happy in dark theme.
const QR_LIGHT_FILL = "rgba(var(--cream-rgb), 1)";
const QR_DARK_FILL = "var(--plum)";

interface QuizshowLiveSessionPanelProps {
  scope: QuizshowScope;
  liveSession: QuizshowLiveSessionRef;
}

export function QuizshowLiveSessionPanel({
  scope,
  liveSession,
}: QuizshowLiveSessionPanelProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const qrLabel = t("quizshow:live.remoteQr");

  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <div className={styles.panelMain}>
        <h3 className={styles.panelTitle} id={headingId}>
          {t("quizshow:live.title")}
        </h3>
        <p className={styles.statusLine} role="status">
          <span className={styles.status}>
            {t(`quizshow:live.status.${liveSession.status}`)}
          </span>
          <span>
            {t("quizshow:live.players", { count: liveSession.playerCount })}
          </span>
        </p>
        <span
          className={styles.code}
          aria-label={t("quizshow:live.code", { code: liveSession.joinCode })}
        >
          {liveSession.joinCode}
        </span>
        <div className={styles.actions}>
          <Button to={quizshowScopeScreenPath(scope)}>
            {t("quizshow:live.openScreen")}
          </Button>
          <Button variant="ghost" to={quizshowScopeRemotePath(scope)}>
            {t("quizshow:live.openRemote")}
          </Button>
        </div>
        <p className={styles.note}>{t("quizshow:live.editsReachNextGame")}</p>
      </div>
      <figure className={styles.qr}>
        <span className={styles.qrPlate}>
          <QrCode
            url={quizshowScopeRemoteUrl(scope)}
            ariaLabel={qrLabel}
            size={QR_SIZE}
            lightFill={QR_LIGHT_FILL}
            darkFill={QR_DARK_FILL}
            hasLightPlate
          />
        </span>
        <figcaption className={styles.qrCaption}>{qrLabel}</figcaption>
      </figure>
    </section>
  );
}
