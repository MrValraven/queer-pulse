import { useId, useState } from "react";
import { Button, Select, Sending } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { submitIntake } from "../../shared/api/intakes";
import { GLOSSARY } from "./queer101.data";
import { ResourceModal, PlumSuccess } from "./ResourceModal";
import styles from "./ResourceModal.module.css";

interface SuggestEditModalProps {
  onClose: () => void;
  /**
   * Fixed subject when the modal is scoped to one known thing (a whole page,
   * a single guide) — skips the picker and shows the subject as read-only
   * context instead of asking the reader to choose it.
   */
  subject?: string;
  /**
   * Picker options when the reader should say which item they mean. Defaults
   * to the glossary term list — the modal's original behavior — so the
   * Glossary's call site needs no changes.
   */
  subjectOptions?: string[];
  /**
   * Free-text tag included in the submitted payload so staff can triage by
   * surface (e.g. "legal", "library"). Defaults to "glossary".
   */
  context?: string;
  /**
   * Which subject question the modal asks:
   *  - `"term"` — pick one of `subjectOptions`, in the glossary's "which term"
   *    wording.
   *  - `"generic"` — pick one of `subjectOptions`, in the neutral "what's this
   *    about?" wording.
   *  - `"newTerm"` — name something the glossary does not have yet, as free
   *    text with no picker (PRD-264: "suggest a term" and "suggest an edit"
   *    are different asks and must not arrive as the same submission).
   *
   * Defaults to the historical behaviour: `"generic"` when `subjectOptions`
   * are given, `"term"` otherwise.
   */
  subjectKind?: "term" | "generic" | "newTerm";
}

export function SuggestEditModal({
  onClose,
  subject,
  subjectOptions,
  context = "glossary",
  subjectKind,
}: SuggestEditModalProps) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const fieldId = useId();
  const [term, setTerm] = useState(subject ?? "");
  const [change, setChange] = useState("");
  const [phase, setPhase] = useState<"form" | "loading" | "done">("form");

  const resolvedSubjectKind =
    subjectKind ?? (subjectOptions ? "generic" : "term");
  const isNewSubject = !subject && resolvedSubjectKind === "newTerm";
  const isGenericSubject = resolvedSubjectKind === "generic";
  const options =
    subjectOptions ?? GLOSSARY.map((glossaryTerm) => t(glossaryTerm.termKey));
  const valid =
    (subject ? true : term.trim().length > 0) && change.trim().length > 8;

  // LIVE: POST the suggestion to the generic intake endpoint; demo keeps the
  // simulated success. On failure we drop back to the form and toast.
  const submit = async () => {
    if (!valid || phase === "loading") return;
    setPhase("loading");
    const payload = {
      term: subject ?? term.trim(),
      change: change.trim(),
      context,
    };
    if (demoMode) {
      setTimeout(() => setPhase("done"), 1100);
      return;
    }
    try {
      await submitIntake("suggest_edit", payload);
      setPhase("done");
    } catch {
      setPhase("form");
      showToast(t("shared:intake.errorToast"), "error");
    }
  };

  return (
    <ResourceModal
      title={
        phase === "done"
          ? ""
          : t(
              isNewSubject
                ? "resources:suggestEdit.newTerm.modalTitle"
                : "resources:suggestEdit.modalTitle",
            )
      }
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
              {t(
                subject
                  ? "resources:suggestEdit.body.introSubject"
                  : isNewSubject
                    ? "resources:suggestEdit.body.introNewTerm"
                    : isGenericSubject
                      ? "resources:suggestEdit.body.introPicker"
                      : "resources:suggestEdit.body.intro",
              )}
            </p>

            {isNewSubject ? (
              <>
                <label className={styles.label} htmlFor={`${fieldId}-term`}>
                  {t("resources:suggestEdit.form.newTermNameLabel")}
                </label>
                <input
                  id={`${fieldId}-term`}
                  className={styles.input}
                  type="text"
                  value={term}
                  onChange={(event) => setTerm(event.target.value)}
                  placeholder={t(
                    "resources:suggestEdit.form.newTermNamePlaceholder",
                  )}
                />
              </>
            ) : subject ? (
              <>
                <span className={styles.label}>
                  {t("resources:suggestEdit.form.subjectFixedLabel")}
                </span>
                <p className={styles.sub} style={{ fontWeight: 600 }}>
                  {subject}
                </p>
              </>
            ) : (
              <>
                <label className={styles.label} htmlFor={`${fieldId}-term`}>
                  {t(
                    isGenericSubject
                      ? "resources:suggestEdit.form.subjectLabel"
                      : "resources:suggestEdit.form.termLabel",
                  )}
                </label>
                <Select
                  id={`${fieldId}-term`}
                  placeholder={t(
                    isGenericSubject
                      ? "resources:suggestEdit.form.selectPlaceholderGeneric"
                      : "resources:suggestEdit.form.selectPlaceholder",
                  )}
                  value={term || null}
                  onChange={(value) => setTerm(value ?? "")}
                  options={[
                    ...options.map((option) => ({
                      value: option,
                      label: option,
                    })),
                    {
                      value: "__new",
                      label: t(
                        isGenericSubject
                          ? "resources:suggestEdit.form.otherOption"
                          : "resources:suggestEdit.form.newTermOption",
                      ),
                    },
                  ]}
                />
              </>
            )}

            <label className={styles.label} htmlFor={`${fieldId}-change`}>
              {t(
                isNewSubject
                  ? "resources:suggestEdit.form.newTermDefinitionLabel"
                  : "resources:suggestEdit.form.changeLabel",
              )}
            </label>
            <textarea
              id={`${fieldId}-change`}
              className={styles.textarea}
              value={change}
              onChange={(e) => setChange(e.target.value)}
              placeholder={t(
                isNewSubject
                  ? "resources:suggestEdit.form.newTermDefinitionPlaceholder"
                  : "resources:suggestEdit.form.changePlaceholder",
              )}
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
