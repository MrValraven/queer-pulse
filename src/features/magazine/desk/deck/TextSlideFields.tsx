import { FormField, Select } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { Slide } from "../../data/decks";
import { bodyBudget, headingBudget, type FieldBudget } from "./slideBudget";
import { asText, type FieldsProps } from "./slideFieldShared";
import styles from "./SlideFields.module.css";

type TextSlide = Extract<Slide, { layout: "text" }>;

/** The design's `.warnfield` row: `{count} / {max} characters` on the left,
 * a copy hint on the right — rendered into a `FormField`'s `helper` slot. */
function CharBudget({ budget }: { budget: FieldBudget }) {
  const { t } = useTranslation();
  return (
    <span
      className={
        budget.over ? `${styles.warnfield} ${styles.over}` : styles.warnfield
      }
    >
      <span>
        {t("magazine:deck.editor.budget.count", {
          count: budget.count,
          max: budget.max,
        })}
      </span>
      <span>{budget.hint}</span>
    </span>
  );
}

/** Text slide fields: eyebrow, heading (with a 52-char budget — the reader's
 * heading is a single fluid `clamp()` line with no wrap budget), body (with
 * a 180-char budget — a slide caption, not an article paragraph), an
 * optional pull quote, and alignment. No tint picker: the repo's `Slide`
 * union has no `tint` field on the `"text"` member (preserved as-is, not
 * widened, to avoid drifting from the reader's actual data contract). */
export function TextSlideFields({ slide, onChange }: FieldsProps<TextSlide>) {
  const { t } = useTranslation();
  const heading = asText(slide.heading);
  const body = asText(slide.body);

  return (
    <>
      <FormField label={t("magazine:deck.editor.field.eyebrow")}>
        <input
          type="text"
          className={styles.input}
          value={asText(slide.eyebrow)}
          onChange={(event) =>
            onChange({ ...slide, eyebrow: event.target.value })
          }
        />
      </FormField>
      <FormField
        label={t("magazine:deck.editor.field.heading")}
        helper={<CharBudget budget={headingBudget(heading, t)} />}
      >
        <input
          type="text"
          className={styles.input}
          value={heading}
          onChange={(event) =>
            onChange({ ...slide, heading: event.target.value })
          }
        />
      </FormField>
      <FormField
        label={t("magazine:deck.editor.field.body")}
        helper={<CharBudget budget={bodyBudget(body, t)} />}
      >
        <textarea
          className={styles.textarea}
          value={body}
          onChange={(event) => onChange({ ...slide, body: event.target.value })}
        />
      </FormField>
      <FormField label={t("magazine:deck.editor.field.pull")}>
        <input
          type="text"
          className={styles.input}
          value={slide.pull ?? ""}
          onChange={(event) => onChange({ ...slide, pull: event.target.value })}
        />
      </FormField>
      <FormField label={t("magazine:deck.editor.field.align")}>
        <Select
          value={slide.align ?? ""}
          onChange={(value) =>
            onChange({
              ...slide,
              align:
                value === "" || value === null
                  ? undefined
                  : (value as "left" | "center"),
            })
          }
          options={[
            { value: "", label: t("magazine:deck.editor.field.alignDefault") },
            { value: "left", label: t("magazine:deck.editor.field.alignLeft") },
            {
              value: "center",
              label: t("magazine:deck.editor.field.alignCenter"),
            },
          ]}
        />
      </FormField>
    </>
  );
}
