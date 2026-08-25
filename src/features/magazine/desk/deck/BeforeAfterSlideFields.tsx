import { useId } from "react";
import { FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { Slide } from "../../data/decks";
import { ImageUrlField } from "../../ImageUrlField";
import type { FieldsProps } from "./slideFieldShared";
import styles from "./SlideFields.module.css";

type BeforeAfterSlide = Extract<
  Slide,
  { layout: "interactive"; kind: "before-after" }
>;
type Side = "before" | "after";

function SideFields({
  slide,
  side,
  onChange,
}: {
  slide: BeforeAfterSlide;
  side: Side;
  onChange: (slide: BeforeAfterSlide) => void;
}) {
  const { t } = useTranslation();
  const id = useId();
  const value = slide[side];
  const update = (patch: Partial<BeforeAfterSlide["before"]>) =>
    onChange({ ...slide, [side]: { ...value, ...patch } });
  return (
    <div className={styles.slideGroup}>
      <p className={styles.slideGroupTitle}>
        {t(`magazine:deck.editor.field.${side}`)}
      </p>
      <ImageUrlField
        id={`${id}-src`}
        label={t("magazine:deck.editor.field.imageSrc")}
        value={value.src}
        onChange={(src) => update({ src })}
        alt={value.alt}
      />
      <FormField label={t("magazine:deck.editor.field.alt")} required>
        <input
          type="text"
          className={styles.input}
          value={value.alt}
          onChange={(event) => update({ alt: event.target.value })}
        />
      </FormField>
      <FormField label={t("magazine:deck.editor.field.label")} required>
        <input
          type="text"
          className={styles.input}
          value={value.label}
          onChange={(event) => update({ label: event.target.value })}
        />
      </FormField>
    </div>
  );
}

/** Before/after slide fields: one grouped card per side, each with its own
 * image URL, alt text, and label. No tint picker: the repo's `Slide` union
 * has no `tint` field on the `"interactive"`/`"before-after"` member
 * (preserved as-is — see `TextSlideFields` for the matching text-layout
 * note). */
export function BeforeAfterSlideFields({
  slide,
  onChange,
}: FieldsProps<BeforeAfterSlide>) {
  return (
    <div className={styles.row}>
      <SideFields slide={slide} side="before" onChange={onChange} />
      <SideFields slide={slide} side="after" onChange={onChange} />
    </div>
  );
}
