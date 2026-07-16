import { useEffect, useState, type ReactNode } from "react";
import { FiCheck, FiDownload, FiLoader } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  return (
    <div
      className={styles.overlay}
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
    </div>
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

type Phase = "form" | "saving" | "done" | "error";

/* ── Suggest an edit (terminology) ────────────────────────────────── */
export function SuggestEditModal({
  term,
  onClose,
}: {
  term: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("form");
  const [suggestion, setSuggestion] = useState("");
  const [why, setWhy] = useState("");
  const valid = suggestion.trim().length > 2;

  useEffect(() => {
    if (phase !== "saving") return;
    const saveTimer = setTimeout(() => setPhase("done"), 1100);
    return () => clearTimeout(saveTimer);
  }, [phase]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setPhase("saving");
  }

  return (
    <ModalShell
      label={t("settings:modals.suggestEdit.ariaLabel", { term })}
      onClose={onClose}
    >
      {phase === "done" ? (
        <SuccessPanel
          title={
            <Translation
              i18nKey="settings:modals.suggestEdit.success.title"
              components={{ em: <em /> }}
            />
          }
          onClose={onClose}
        >
          <Translation
            i18nKey="settings:modals.suggestEdit.success.body"
            components={{ strong: <strong /> }}
            values={{ term }}
          />
        </SuccessPanel>
      ) : (
        <form onSubmit={submit}>
          <div className={styles.eye}>
            {t("settings:modals.suggestEdit.eyebrow")}
          </div>
          <h2 className={styles.title}>
            <Translation
              i18nKey="settings:modals.suggestEdit.title"
              components={{ em: <em /> }}
              values={{ term }}
            />
          </h2>
          <p className={styles.desc}>{t("settings:modals.suggestEdit.desc")}</p>
          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="sugg">
                {t("settings:modals.suggestEdit.wordingLabel")}{" "}
                <span className={styles.req}>*</span>
              </label>
              <textarea
                id="sugg"
                className={styles.input}
                rows={3}
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder={t(
                  "settings:modals.suggestEdit.wordingPlaceholder",
                  { term },
                )}
                autoFocus
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="why">
                {t("settings:modals.suggestEdit.whyLabel")}{" "}
                <span className={styles.hint}>
                  {t("settings:modals.suggestEdit.optional")}
                </span>
              </label>
              <textarea
                id="why"
                className={styles.input}
                rows={2}
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                placeholder={t("settings:modals.suggestEdit.whyPlaceholder")}
              />
            </div>
          </div>
          <div className={styles.actions}>
            <Button
              variant="primary"
              type="submit"
              disabled={!valid || phase === "saving"}
            >
              {phase === "saving" ? (
                <>
                  <Spinner /> {t("settings:modals.suggestEdit.sending")}
                </>
              ) : (
                t("settings:modals.suggestEdit.send")
              )}
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={onClose}
              disabled={phase === "saving"}
            >
              {t("settings:modals.suggestEdit.cancel")}
            </Button>
          </div>
        </form>
      )}
    </ModalShell>
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
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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
