import { useId, useState } from "react";
import { Button, Sending } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { submitIntake } from "../../shared/api/intakes";
import { GLOSSARY } from "./queer101.data";
import { ResourceModal, PlumSuccess } from "./ResourceModal";
import styles from "./ResourceModal.module.css";

export function SuggestEditModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const fieldId = useId();
  const [term, setTerm] = useState("");
  const [change, setChange] = useState("");
  const [phase, setPhase] = useState<"form" | "loading" | "done">("form");

  const valid = term.trim().length > 0 && change.trim().length > 8;

  // LIVE: POST the suggestion to the generic intake endpoint; demo keeps the
  // simulated success. On failure we drop back to the form and toast.
  const submit = async () => {
    if (!valid || phase === "loading") return;
    setPhase("loading");
    if (demoMode) {
      setTimeout(() => setPhase("done"), 1100);
      return;
    }
    try {
      await submitIntake("suggest_edit", {
        term: term.trim(),
        change: change.trim(),
      });
      setPhase("done");
    } catch {
      setPhase("form");
      showToast(t("shared:intake.errorToast"), "error");
    }
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

            <label className={styles.label} htmlFor={`${fieldId}-term`}>
              {t("resources:suggestEdit.form.termLabel")}
            </label>
            <select
              id={`${fieldId}-term`}
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

            <label className={styles.label} htmlFor={`${fieldId}-change`}>
              {t("resources:suggestEdit.form.changeLabel")}
            </label>
            <textarea
              id={`${fieldId}-change`}
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
              onClick={() => void submit()}
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
