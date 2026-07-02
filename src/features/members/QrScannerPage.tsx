import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import styles from "./QrScannerPage.module.css";

type Mode = "safe" | "event" | "profile";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "safe", label: "Safe space", hint: "Point at a sticker" },
  { id: "event", label: "Event ticket", hint: "Point at your ticket" },
  { id: "profile", label: "Profile", hint: "Point at a profile code" },
];

export function QrScannerPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>("safe");
  const [flash, setFlash] = useState(false);

  // Simulate a successful scan after a few seconds, then route on.
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(
      setTimeout(() => {
        showToast("Mercearia Rosa · verified safe space", "success");
        timers.push(setTimeout(() => navigate(routes.safeSpaces), 1500));
      }, 6000),
    );
    return () => timers.forEach(clearTimeout);
  }, [navigate, showToast]);

  const hint = MODES.find((m) => m.id === mode)!.hint;

  return (
    <div className={styles.root}>
      <div className={styles.top}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => navigate(-1)}
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className={styles.title}>
          Scan a <em>QueerPulse</em> code
        </div>
        <button
          type="button"
          className={`${styles.iconBtn} ${flash ? styles.flashOn : ""}`}
          onClick={() => setFlash((v) => !v)}
          aria-label="Flash"
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
        <span>Camera stays on this device · we never upload frames</span>
      </div>

      <div className={styles.view}>
        <div className={styles.target}>
          <span className={`${styles.corner} ${styles.cornerTr}`} />
          <span className={`${styles.corner} ${styles.cornerBl}`} />
          <div className={styles.line} />
        </div>
        <div className={styles.hint}>
          <b>{hint}</b>
          <br />
          Safe-space window stickers · gathering tickets · profile sharing codes
        </div>
      </div>

      <div className={styles.alt}>
        <span>Can't scan?</span>
        <button
          type="button"
          onClick={() => showToast("Open code · paste flow", "info")}
        >
          Enter code manually
        </button>
        <span className={styles.dot}>·</span>
        <button type="button" onClick={() => navigate(routes.help)}>
          Help with codes
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
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
