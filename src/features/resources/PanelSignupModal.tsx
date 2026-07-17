import { useState } from "react";
import { Button, Sending } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ResourceModal, PlumSuccess } from "./ResourceModal";
import styles from "./ResourceModal.module.css";

export function PanelSignupModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [why, setWhy] = useState("");
  const [phase, setPhase] = useState<"form" | "loading" | "done">("form");

  const valid =
    name.trim().length > 1 && /.+@.+\..+/.test(email) && why.trim().length > 8;

  const submit = () => {
    if (!valid || phase === "loading") return;
    setPhase("loading");
    setTimeout(() => setPhase("done"), 1100);
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

            <span className={styles.label}>
              {t("resources:microGrants.panel.nameLabel")}
            </span>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("resources:microGrants.panel.namePlaceholder")}
            />

            <span className={styles.label}>
              {t("resources:microGrants.panel.emailLabel")}
            </span>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("resources:microGrants.panel.emailPlaceholder")}
            />

            <span className={styles.label}>
              {t("resources:microGrants.panel.whyLabel")}
            </span>
            <textarea
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
              onClick={submit}
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
