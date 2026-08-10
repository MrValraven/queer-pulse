import { useId } from "react";
import { FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { Slide } from "../../data/decks";
import { ImageUrlField } from "../../ImageUrlField";
import type { FieldsProps } from "./slideFieldShared";
import { TintPicker } from "./TintPicker";
import styles from "./SlideFields.module.css";

type ImageSlide = Extract<Slide, { layout: "image" }>;

/** Image slide fields: the URL/uploader field, required alt text, an
 * optional caption, and the shared tint picker. */
export function ImageSlideFields({ slide, onChange }: FieldsProps<ImageSlide>) {
  const { t } = useTranslation();
  const id = useId();
  return (
    <>
      <ImageUrlField
        id={`${id}-src`}
        label={t("magazine:deck.editor.field.imageSrc")}
        value={slide.src}
        onChange={(url) => onChange({ ...slide, src: url })}
        alt={slide.alt}
        tint={slide.tint}
      />
      <FormField label={t("magazine:deck.editor.field.alt")} required>
        <input
          type="text"
          className={styles.input}
          value={slide.alt}
          onChange={(event) => onChange({ ...slide, alt: event.target.value })}
        />
      </FormField>
      <FormField label={t("magazine:deck.editor.field.caption")}>
        <input
          type="text"
          className={styles.input}
          value={slide.caption ?? ""}
          onChange={(event) => onChange({ ...slide, caption: event.target.value })}
        />
      </FormField>
      <TintPicker value={slide.tint} onChange={(tint) => onChange({ ...slide, tint })} />
    </>
  );
}
