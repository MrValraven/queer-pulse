import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FiCheck, FiDownload, FiLoader } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { downloadBlob } from "../../shared/lib/downloadBlob";
import styles from "./SettingsModal.module.css";

/** Shared modal shell with overlay click-to-close, ESC and a close button. */
function ModalShell({
  label,
  onClose,
  children,
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  useScrollLock();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  // Portal to <body> so the fixed-position overlay escapes any ancestor that
  // establishes a containing block for fixed descendants. The settings panes
  // are wrapped in <FadeIn> (`will-change: transform`), which would otherwise
  // trap `position: fixed` inside the tall pane box and mis-position the modal.
  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("settings:modals.common.close")}
        >
          ×
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

function Spinner() {
  return (
    <span className={styles.spin}>
      <FiLoader size={16} />
    </span>
  );
}

/** Plum-panel success state shown after a simulated submission. */
function SuccessPanel({
  title,
  children,
  onClose,
}: {
  title: ReactNode;
  children: ReactNode;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.success}>
      <div className={styles.successIcon}>
        <FiCheck size={28} />
      </div>
      <div className={styles.successTitle}>{title}</div>
      <p className={styles.successSub}>{children}</p>
      <div className={styles.successActions}>
        <Button variant="ghost-dark" onClick={onClose}>
          {t("settings:modals.common.done")}
        </Button>
      </div>
    </div>
  );
}

/* ── Data export (simulated, with mock Blob download) ─────────────── */
export function DataExportModal({
  title,
  filename,
  payload,
  onClose,
}: {
  title: string;
  filename: string;
  payload: Record<string, unknown>;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<"preparing" | "ready">("preparing");

  // Kick off the simulated export as soon as the modal mounts.
  useEffect(() => {
    const readyTimer = setTimeout(() => setPhase("ready"), 1500);
    return () => clearTimeout(readyTimer);
  }, []);

  function download() {
    downloadBlob(filename, JSON.stringify(payload, null, 2), "application/json");
  }

  return (
    <ModalShell label={title} onClose={onClose}>
      {phase === "preparing" ? (
        <div style={{ textAlign: "center", padding: "20px 8px" }}>
          <div className={styles.eye}>
            {t("settings:modals.dataExport.eyebrow")}
          </div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.desc}>
            {t("settings:modals.dataExport.preparingBody")}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              color: "var(--plum)",
            }}
          >
            <Spinner />
          </div>
        </div>
      ) : (
        <SuccessPanel
          title={
            <Translation
              i18nKey="settings:modals.dataExport.readyTitle"
              components={{ em: <em /> }}
            />
          }
          onClose={onClose}
        >
          <Translation
            i18nKey="settings:modals.dataExport.readyBody"
            components={{ strong: <strong /> }}
            values={{ filename }}
          />
          <span style={{ display: "block", marginTop: 18 }}>
            <Button variant="jade" onClick={download}>
              <FiDownload style={{ verticalAlign: "-2px", marginRight: 8 }} />
              {t("settings:modals.dataExport.downloadCta", { filename })}
            </Button>
          </span>
        </SuccessPanel>
      )}
    </ModalShell>
  );
}
