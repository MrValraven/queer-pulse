import { useState } from "react";
import { Button, Sending } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GLOSSARY } from "./queer101.data";
import { ResourceModal, PlumSuccess } from "./ResourceModal";
import styles from "./ResourceModal.module.css";

export function SuggestEditModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [term, setTerm] = useState("");
  const [change, setChange] = useState("");
  const [phase, setPhase] = useState<"form" | "loading" | "done">("form");

  const valid = term.trim().length > 0 && change.trim().length > 8;

  const submit = () => {
    if (!valid || phase === "loading") return;
    setPhase("loading");
    setTimeout(() => setPhase("done"), 1100);
  };

  return (
    <ResourceModal
      title={phase === "done" ? "" : t("resources:suggestEdit.modalTitle")}
      onClose={onClose}
    >
      {phase === "done" ? (
        <PlumSuccess
          title={
            <Translation
              i18nKey="resources:suggestEdit.success.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("resources:suggestEdit.success.sub")}
          onClose={onClose}
        />
      ) : (
        <>
          <div className={styles.body}>
            <p className={styles.sub}>
              {t("resources:suggestEdit.body.intro")}
            </p>

            <span className={styles.label}>
              {t("resources:suggestEdit.form.termLabel")}
            </span>
            <select
              className={styles.select}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            >
              <option value="">
                {t("resources:suggestEdit.form.selectPlaceholder")}
              </option>
              {GLOSSARY.map((g) => (
                <option key={g.termKey} value={t(g.termKey)}>
                  {t(g.termKey)}
                </option>
              ))}
              <option value="__new">
                {t("resources:suggestEdit.form.newTermOption")}
              </option>
            </select>

            <span className={styles.label}>
              {t("resources:suggestEdit.form.changeLabel")}
            </span>
            <textarea
              className={styles.textarea}
              value={change}
              onChange={(e) => setChange(e.target.value)}
              placeholder={t("resources:suggestEdit.form.changePlaceholder")}
            />
          </div>

          <div className={styles.footer}>
            <Button type="button" variant="ghost" onClick={onClose}>
              {t("resources:suggestEdit.cancelCta")}
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
                t("resources:suggestEdit.sendCta")
              )}
            </Button>
          </div>
        </>
      )}
    </ResourceModal>
  );
}
