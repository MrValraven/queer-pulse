import { FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { Slide } from "../../data/decks";
import { asText, type FieldsProps } from "./slideFieldShared";
import { TintPicker } from "./TintPicker";
import styles from "./SlideFields.module.css";

type StatSlide = Extract<Slide, { layout: "stat" }>;

/** Stat slide fields: a Value/Unit row, a label, an optional source line,
 * and the shared tint picker. */
export function StatSlideFields({ slide, onChange }: FieldsProps<StatSlide>) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.row}>
        <FormField label={t("magazine:deck.editor.field.value")}>
          <input
            type="text"
            className={styles.input}
            value={slide.value}
            onChange={(event) => onChange({ ...slide, value: event.target.value })}
          />
        </FormField>
        <FormField label={t("magazine:deck.editor.field.unit")}>
          <input
            type="text"
            className={styles.input}
            value={slide.unit ?? ""}
            onChange={(event) => onChange({ ...slide, unit: event.target.value })}
          />
        </FormField>
      </div>
      <FormField label={t("magazine:deck.editor.field.label")}>
        <input
          type="text"
          className={styles.input}
          value={asText(slide.label)}
          onChange={(event) => onChange({ ...slide, label: event.target.value })}
        />
      </FormField>
      <FormField label={t("magazine:deck.editor.field.source")}>
        <input
          type="text"
          className={styles.input}
          value={slide.source ?? ""}
          onChange={(event) => onChange({ ...slide, source: event.target.value })}
        />
      </FormField>
      <TintPicker value={slide.tint} onChange={(tint) => onChange({ ...slide, tint })} />
    </>
  );
}
