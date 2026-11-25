import { useId, useMemo, useRef } from "react";
import { FiCopy } from "react-icons/fi";
import { Button } from "../../../shared/components/ui/Button";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { FormField } from "../../../shared/components/ui/FormField";
import { RadioCardGroup } from "../../../shared/components/ui/RadioCardGroup";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_LIMITS,
  type QuizshowLanguageMode,
  type QuizshowScreenLanguage,
} from "../../../shared/contracts/quizshow";
import { useQuizshowScopeKind } from "../quizshowScope";
import {
  hasEmptyPortuguese,
  useQuizshowReviewMarks,
  withEmptyPortugueseFilled,
} from "./quizshowReviewMarks";
import type { QuizshowDraftController } from "./useQuizshowDraft";
import editorStyles from "./QuizshowQuestionEditor.module.css";
import styles from "./QuizshowRounds.module.css";

const LANGUAGE_MODES: readonly QuizshowLanguageMode[] = ["en", "pt", "both"];
/** The picker shows only while the quiz is in both languages, so it offers "Both" too (contract 6.26). */
const SCREEN_LANGUAGES: readonly QuizshowScreenLanguage[] = [
  "en",
  "pt",
  "both",
];

const SCREEN_LANGUAGE_LABEL_KEYS: Record<QuizshowScreenLanguage, string> = {
  en: "quizshow:language.en",
  pt: "quizshow:language.pt",
  both: "quizshow:settings.screenLanguage.both",
};

export function QuizshowQuizSettings({
  controller,
  titleLabelKey = "quizshow:settings.title.label",
  isTitleRequired = false,
}: {
  controller: QuizshowDraftController;
  /** A game labels the field "Game title". */
  titleLabelKey?: string;
  /** A game or a template cannot save a blank title, so the field says so. */
  isTitleRequired?: boolean;
}) {
  const { t } = useTranslation();
  const languagesLabelId = useId();
  const screenLabelId = useId();
  const screenHintId = useId();
  const languagesGroupRef = useRef<HTMLDivElement | null>(null);
  const scopeKind = useQuizshowScopeKind();
  const isGame = scopeKind === "game";
  const { draft, setQuizField, replaceDraft } = controller;
  const { markFilled } = useQuizshowReviewMarks();
  const isTitleMissing = isTitleRequired && draft.title.trim() === "";
  // Item 24: offered once the quiz is in both languages, while any PT text is still blank.
  const hasFillablePortuguese = useMemo(
    () => draft.languages === "both" && hasEmptyPortuguese(draft),
    [draft],
  );
  const isFillShown = replaceDraft !== undefined && hasFillablePortuguese;

  // One undo step for the whole fill; the copied texts carry a review mark until checked.
  const handleFillPortuguese = () => {
    if (replaceDraft === undefined) return;
    const { draft: filledDraft, copiedTexts } =
      withEmptyPortugueseFilled(draft);
    if (copiedTexts.length === 0) return;
    replaceDraft(filledDraft, "fillLanguage");
    markFilled(copiedTexts);
    // The button folds away once nothing is left to fill, so focus returns to the languages choice.
    languagesGroupRef.current
      ?.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]')
      ?.focus();
  };

  // "Both" needs both languages, so leaving them moves the screen to the one
  // left, as the save would (contract 6.26).
  // Both fields change in one edit, so one Undo takes the whole change back.
  const handleLanguages = (languages: QuizshowLanguageMode) => {
    if (replaceDraft === undefined) {
      setQuizField("languages", languages);
      if (languages !== "both") setQuizField("screenLanguage", languages);
      return;
    }
    replaceDraft(
      (current) => ({
        ...current,
        languages,
        screenLanguage:
          languages === "both" ? current.screenLanguage : languages,
      }),
      "fillLanguage",
    );
  };

  return (
    <div className={styles.fields}>
      <div className={styles.fieldGroup}>
        {/* The hint sits in the field's own error slot, which wires aria-invalid and the description. */}
        <FormField
          label={t(titleLabelKey)}
          error={
            isTitleMissing
              ? t(
                  scopeKind === "template"
                    ? "quizshow:templates.titleRequired"
                    : "quizshow:games.new.titleRequired",
                )
              : undefined
          }
        >
          <input
            type="text"
            value={draft.title}
            maxLength={QUIZSHOW_LIMITS.quizTitleMax}
            placeholder={t(
              isGame
                ? "quizshow:games.new.titlePlaceholder"
                : "quizshow:settings.title.placeholder",
            )}
            onChange={(event) => setQuizField("title", event.target.value)}
          />
        </FormField>
      </div>
      <div ref={languagesGroupRef} className={styles.fieldGroup}>
        <span id={languagesLabelId} className={styles.groupLabel}>
          {t("quizshow:settings.languages.label")}
        </span>
        <RadioCardGroup
          value={draft.languages}
          ariaLabel={t("quizshow:settings.languages.label")}
          ariaLabelledBy={languagesLabelId}
          className={styles.optionGrid}
          optionClassName={styles.choice}
          onChange={handleLanguages}
          options={LANGUAGE_MODES.map((mode) => ({
            id: mode,
            render: t(`quizshow:language.${mode}`),
          }))}
        />
      </div>
      <Collapse isOpen={isFillShown}>
        <div className={editorStyles.fillRow}>
          <Button
            variant="stage-ghost"
            size="sm"
            type="button"
            onClick={handleFillPortuguese}
          >
            <FiCopy aria-hidden /> {t("quizshow:studio.fillPt")}
          </Button>
        </div>
      </Collapse>
      <Collapse isOpen={draft.languages === "both"}>
        <div className={styles.fieldGroup}>
          <span id={screenLabelId} className={styles.groupLabel}>
            {t("quizshow:settings.screenLanguage.label")}
          </span>
          <p id={screenHintId} className={styles.hint}>
            {t("quizshow:settings.screenLanguage.hint")}
          </p>
          <RadioCardGroup
            value={draft.screenLanguage}
            ariaLabel={t("quizshow:settings.screenLanguage.label")}
            ariaLabelledBy={screenLabelId}
            ariaDescribedBy={screenHintId}
            className={styles.optionGrid}
            optionClassName={styles.choice}
            onChange={(language) => setQuizField("screenLanguage", language)}
            options={SCREEN_LANGUAGES.map((language) => ({
              id: language,
              render: t(SCREEN_LANGUAGE_LABEL_KEYS[language]),
            }))}
          />
        </div>
      </Collapse>
    </div>
  );
}
