import { Button, QrCode } from "../../../shared/components/ui";
import type { QuizshowLiveSessionRef } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  quizshowRemotePath,
  quizshowRemoteUrl,
  quizshowScreenPath,
} from "../quizshowPaths";
import styles from "./QuizshowLobby.module.css";

const QR_SIZE = 128;
// Same pairing as the other QR plates: the light plate keeps scanners happy in dark theme.
const QR_LIGHT_FILL = "rgba(var(--cream-rgb), 1)";
const QR_DARK_FILL = "var(--plum)";

interface QuizshowLiveSessionPanelProps {
  slug: string;
  liveSession: QuizshowLiveSessionRef;
}

export function QuizshowLiveSessionPanel({
  slug,
  liveSession,
}: QuizshowLiveSessionPanelProps) {
  const { t } = useTranslation();
  const qrLabel = t("quizshow:live.remoteQr");

  return (
    <section className={styles.panel} aria-labelledby={`live-title-${slug}`}>
      <div className={styles.panelMain}>
        <h3 className={styles.panelTitle} id={`live-title-${slug}`}>
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
          <Button to={quizshowScreenPath(slug)}>
            {t("quizshow:live.openScreen")}
          </Button>
          <Button variant="ghost" to={quizshowRemotePath(slug)}>
            {t("quizshow:live.openRemote")}
          </Button>
        </div>
        <p className={styles.note}>{t("quizshow:live.editsReachNextGame")}</p>
      </div>
      <figure className={styles.qr}>
        <span className={styles.qrPlate}>
          <QrCode
            url={quizshowRemoteUrl(slug)}
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
