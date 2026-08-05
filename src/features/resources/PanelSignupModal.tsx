import { useId, useState } from "react";
import { Button, Sending } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { submitIntake } from "../../shared/api/intakes";
import { ResourceModal, PlumSuccess } from "./ResourceModal";
import styles from "./ResourceModal.module.css";

export function PanelSignupModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const fieldId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [why, setWhy] = useState("");
  const [phase, setPhase] = useState<"form" | "loading" | "done">("form");

  const valid =
    name.trim().length > 1 && /.+@.+\..+/.test(email) && why.trim().length > 8;

  // LIVE: record the panel signup through the generic intake endpoint; demo
  // keeps the simulated success.
  const submit = async () => {
    if (!valid || phase === "loading") return;
    setPhase("loading");
    if (demoMode) {
      setTimeout(() => setPhase("done"), 1100);
      return;
    }
    try {
      await submitIntake("panel_signup", {
        name: name.trim(),
        email: email.trim(),
        why: why.trim(),
      });
      setPhase("done");
    } catch {
      setPhase("form");
      showToast(t("shared:intake.errorToast"), "error");
    }
  };

  return (
    <ResourceModal
      title={
        phase === "done" ? "" : t("resources:microGrants.panel.modalTitle")
      }
      onClose={onClose}
    >
      {phase === "done" ? (
        <PlumSuccess
          title={
            <Translation
              i18nKey="resources:microGrants.panel.success.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("resources:microGrants.panel.success.sub")}
          onClose={onClose}
        />
      ) : (
        <>
          <div className={styles.body}>
            <p className={styles.sub}>
              {t("resources:microGrants.panel.intro")}
            </p>

            <label className={styles.label} htmlFor={`${fieldId}-name`}>
              {t("resources:microGrants.panel.nameLabel")}
            </label>
            <input
              id={`${fieldId}-name`}
              className={styles.input}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("resources:microGrants.panel.namePlaceholder")}
            />

            <label className={styles.label} htmlFor={`${fieldId}-email`}>
              {t("resources:microGrants.panel.emailLabel")}
            </label>
            <input
              id={`${fieldId}-email`}
              className={styles.input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("resources:microGrants.panel.emailPlaceholder")}
            />

            <label className={styles.label} htmlFor={`${fieldId}-why`}>
              {t("resources:microGrants.panel.whyLabel")}
            </label>
            <textarea
              id={`${fieldId}-why`}
              className={styles.textarea}
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              placeholder={t("resources:microGrants.panel.whyPlaceholder")}
            />
          </div>

          <div className={styles.footer}>
            <Button type="button" variant="ghost" onClick={onClose}>
              {t("resources:microGrants.panel.cancelCta")}
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
                t("resources:microGrants.panel.submitCta")
              )}
            </Button>
          </div>
        </>
      )}
    </ResourceModal>
  );
}
