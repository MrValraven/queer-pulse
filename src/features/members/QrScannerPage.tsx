import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./QrScannerPage.module.css";

type Mode = "safe" | "event" | "profile";

/** `labelKey`/`hintKey` are catalog keys — a small, platform-defined mode
 *  vocabulary (chrome), resolved through `t()`. */
const MODES: { id: Mode; labelKey: string; hintKey: string }[] = [
  {
    id: "safe",
    labelKey: "members:qrScanner.mode.safe.label",
    hintKey: "members:qrScanner.mode.safe.hint",
  },
  {
    id: "event",
    labelKey: "members:qrScanner.mode.event.label",
    hintKey: "members:qrScanner.mode.event.hint",
  },
  {
    id: "profile",
    labelKey: "members:qrScanner.mode.profile.label",
    hintKey: "members:qrScanner.mode.profile.hint",
  },
];

export function QrScannerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>("safe");
  const [flash, setFlash] = useState(false);

  // Simulate a successful scan after a few seconds, then route on.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(
      setTimeout(() => {
        showToast(
          t("members:qrScanner.scanToast", { name: "Mercearia Rosa" }),
          "success",
        );
        timers.push(setTimeout(() => navigate(routes.safeSpaces), 1500));
      }, 6000),
    );
    return () => timers.forEach(clearTimeout);
  }, [navigate, showToast, t]);

  const hintKey = MODES.find((m) => m.id === mode)!.hintKey;

  return (
    <div className={styles.root}>
      <div className={styles.top}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => navigate(-1)}
          aria-label={t("members:qrScanner.closeAriaLabel")}
        >
          <svg viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className={styles.title}>
          <Translation
            i18nKey="members:qrScanner.title"
            components={{ em: <em /> }}
          />
        </div>
        <button
          type="button"
          className={`${styles.iconBtn} ${flash ? styles.flashOn : ""}`}
          onClick={() => setFlash((v) => !v)}
          aria-label={t("members:qrScanner.flashAriaLabel")}
          aria-pressed={flash}
        >
          <svg viewBox="0 0 24 24">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </button>
      </div>

      <div className={styles.priv}>
        <svg viewBox="0 0 24 24">
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
        <span>{t("members:qrScanner.privacyNote")}</span>
      </div>

      <div className={styles.view}>
        <div className={styles.target}>
          <span className={`${styles.corner} ${styles.cornerTr}`} />
          <span className={`${styles.corner} ${styles.cornerBl}`} />
          <div className={styles.line} />
        </div>
        <div className={styles.hint}>
          <b>{t(hintKey)}</b>
          <br />
          {t("members:qrScanner.hintSuffix")}
        </div>
      </div>

      <div className={styles.alt}>
        <span>{t("members:qrScanner.cantScan")}</span>
        <button
          type="button"
          onClick={() => showToast(t("members:qrScanner.manualToast"), "info")}
        >
          {t("members:qrScanner.enterCodeCta")}
        </button>
        <span className={styles.dot}>·</span>
        <button type="button" onClick={() => navigate(routes.help)}>
          {t("members:qrScanner.helpCta")}
        </button>
      </div>

      <div className={styles.modes}>
        {MODES.map((m) => (
          <button
            type="button"
            key={m.id}
            className={`${styles.mode} ${mode === m.id ? styles.active : ""}`}
            onClick={() => setMode(m.id)}
          >
            {t(m.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}
