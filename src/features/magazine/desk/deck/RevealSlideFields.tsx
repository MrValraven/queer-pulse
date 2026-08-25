import { FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { Slide } from "../../data/decks";
import { asText, type FieldsProps } from "./slideFieldShared";
import { TintPicker } from "./TintPicker";
import styles from "./SlideFields.module.css";

type RevealSlide = Extract<Slide, { layout: "interactive"; kind: "reveal" }>;

/** Reveal slide fields: the visible prompt, the text hidden until tapped,
 * and the shared tint picker (this member's `tint` is optional — defaults
 * to `"default"` for the picker, matching the old `<select>`'s fallback). */
export function RevealSlideFields({
  slide,
  onChange,
}: FieldsProps<RevealSlide>) {
  const { t } = useTranslation();
  return (
    <>
      <FormField label={t("magazine:deck.editor.field.prompt")}>
        <textarea
          className={styles.textarea}
          value={asText(slide.prompt)}
          onChange={(event) =>
            onChange({ ...slide, prompt: event.target.value })
          }
        />
      </FormField>
      <FormField label={t("magazine:deck.editor.field.hidden")}>
        <textarea
          className={styles.textarea}
          value={asText(slide.hidden)}
          onChange={(event) =>
            onChange({ ...slide, hidden: event.target.value })
          }
        />
      </FormField>
      <TintPicker
        value={slide.tint ?? "default"}
        onChange={(tint) => onChange({ ...slide, tint })}
      />
    </>
  );
}
