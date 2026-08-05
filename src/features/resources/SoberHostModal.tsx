import { useId, useState } from "react";
import { FiPlusCircle, FiUsers } from "react-icons/fi";
import { Button, Sending } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { submitIntake } from "../../shared/api/intakes";
import { ResourceModal, PlumSuccess } from "./ResourceModal";
import styles from "./ResourceModal.module.css";

type Mode = "host" | "attend";

export function SoberHostModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const fieldId = useId();
  const [mode, setMode] = useState<Mode>("host");
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [phase, setPhase] = useState<"form" | "loading" | "done">("form");

  const valid = name.trim().length > 1 && detail.trim().length > 4;

  // LIVE: record the host/attend intent through the generic intake endpoint;
  // demo keeps the simulated success.
  const submit = async () => {
    if (!valid || phase === "loading") return;
    setPhase("loading");
    if (demoMode) {
      setTimeout(() => setPhase("done"), 1100);
      return;
    }
    try {
      await submitIntake("sober_host", {
        mode,
        name: name.trim(),
        detail: detail.trim(),
      });
      setPhase("done");
    } catch {
      setPhase("form");
      showToast(t("shared:intake.errorToast"), "error");
    }
  };

  return (
    <ResourceModal
      title={phase === "done" ? "" : t("resources:sober.host.modalTitle")}
      onClose={onClose}
    >
      {phase === "done" ? (
        <PlumSuccess
          title={
            <Translation
              i18nKey={
                mode === "host"
                  ? "resources:sober.host.success.hostTitle"
                  : "resources:sober.host.success.attendTitle"
              }
              components={{ em: <em /> }}
            />
          }
          sub={t(
            mode === "host"
              ? "resources:sober.host.success.hostSub"
              : "resources:sober.host.success.attendSub",
          )}
          onClose={onClose}
        />
      ) : (
        <>
          <div className={styles.body}>
            <p className={styles.sub}>{t("resources:sober.host.intro")}</p>

            <span className={styles.label}>
              {t("resources:sober.host.modeLabel")}
            </span>
            <div className={styles.options}>
              <button
                type="button"
                className={`${styles.option} ${mode === "host" ? styles.optionSelected : ""}`}
                onClick={() => setMode("host")}
              >
                <span className={styles.optIcon}>
                  <FiPlusCircle />
                </span>
                <span className={styles.optName}>
                  {t("resources:sober.host.mode.host.name")}
                </span>
                <span className={styles.optDesc}>
                  {t("resources:sober.host.mode.host.desc")}
                </span>
              </button>
              <button
                type="button"
                className={`${styles.option} ${mode === "attend" ? styles.optionSelected : ""}`}
                onClick={() => setMode("attend")}
              >
                <span className={styles.optIcon}>
                  <FiUsers />
                </span>
                <span className={styles.optName}>
                  {t("resources:sober.host.mode.attend.name")}
                </span>
                <span className={styles.optDesc}>
                  {t("resources:sober.host.mode.attend.desc")}
                </span>
              </button>
            </div>

            <label className={styles.label} htmlFor={`${fieldId}-name`}>
              {t(
                mode === "host"
                  ? "resources:sober.host.nameLabel.host"
                  : "resources:sober.host.nameLabel.attend",
              )}
            </label>
            <input
              id={`${fieldId}-name`}
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t(
                mode === "host"
                  ? "resources:sober.host.namePlaceholder.host"
                  : "resources:sober.host.namePlaceholder.attend",
              )}
            />

            <label className={styles.label} htmlFor={`${fieldId}-detail`}>
              {t(
                mode === "host"
                  ? "resources:sober.host.detailLabel.host"
                  : "resources:sober.host.detailLabel.attend",
              )}
            </label>
            <textarea
              id={`${fieldId}-detail`}
              className={styles.textarea}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder={t(
                mode === "host"
                  ? "resources:sober.host.detailPlaceholder.host"
                  : "resources:sober.host.detailPlaceholder.attend",
              )}
            />
          </div>

          <div className={styles.footer}>
            <Button type="button" variant="ghost" onClick={onClose}>
              {t("resources:sober.host.cancelCta")}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => void submit()}
              disabled={!valid || phase === "loading"}
            >
              {phase === "loading" ? (
                <Sending label={t("resources:suggestEdit.sendingLabel")} />
              ) : (
                t(
                  mode === "host"
                    ? "resources:sober.host.submitCta.host"
                    : "resources:sober.host.submitCta.attend",
                )
              )}
            </Button>
          </div>
        </>
      )}
    </ResourceModal>
  );
}
