import { useId, useRef } from "react";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Field, TextInput } from "../CreateGatheringFields";
import { GATE_ANCHOR } from "../createGathering.data";
import { useEventHostScope } from "../eventHostScope";
import type { GatheringForm } from "../useGatheringForm";
import { titleSuggestions } from "./titleSuggestions";
import { MAX_TITLE_LENGTH } from "./whatChapter.data";
import styles from "./WhatChapter.module.css";

/**
 * The gathering's name, with a counter and, while it is still empty, a few
 * plain titles to take with one press.
 *
 * The anchor sits on the whole field, so the "Name your gathering" readiness
 * row flashes label, input and hint together.
 */
export function TitleField({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const fieldId = useId();
  const inputId = `${fieldId}-title`;
  const suggestionsLabelId = `${fieldId}-suggestions-label`;
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestions = form.title.trim()
    ? []
    : titleSuggestions(form, { t, fmt });
  // The member hint coaches with a supper club example. An event QueerPulse
  // hosts shows a music title of its own in the field instead, and needs no
  // coaching line under it.
  const { isHouseEvent } = useEventHostScope();

  return (
    <Field
      label={t("gatherings:create.step1.titleLabel")}
      htmlFor={inputId}
      count={`${form.title.length}/${MAX_TITLE_LENGTH}`}
      hint={isHouseEvent ? undefined : t("gatherings:create.v2.what.titleHint")}
      anchorId={GATE_ANCHOR.title}
    >
      <TextInput
        ref={inputRef}
        id={inputId}
        type="text"
        maxLength={MAX_TITLE_LENGTH}
        autoComplete="off"
        placeholder={t(
          isHouseEvent
            ? "admin:musicEvents.house.titleExample"
            : "gatherings:create.step1.titlePlaceholder",
        )}
        aria-required={true}
        aria-describedby={isHouseEvent ? undefined : `${inputId}-hint`}
        value={form.title}
        onChange={(event) => form.setTitle(event.target.value)}
      />
      {suggestions.length > 0 && (
        <div
          className={styles.suggestions}
          role="group"
          aria-labelledby={suggestionsLabelId}
        >
          <span id={suggestionsLabelId} className={styles.suggestionsLabel}>
            {t("gatherings:create.v2.what.suggestionsLabel")}
          </span>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className={styles.suggestionChip}
              onClick={() => {
                form.setTitle(suggestion);
                // The chips unmount once the title has text, so focus moves
                // to the input the suggestion just filled.
                inputRef.current?.focus();
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </Field>
  );
}
