import { useId, type ReactNode } from "react";
import type { AvatarTint } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { DeckDraft } from "./deckDraft";
import { ImageUrlField } from "./ImageUrlField";
import styles from "./DeckEditorPage.module.css";

const COVER_TINT: AvatarTint = "jade";

/** "one, two ,three,, " → ["one", "two", "three"]. */
function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinCsv(values: string[]): string {
  return values.join(", ");
}

interface FieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
}

/** Labelled wrapper shared by every text/textarea field in this form. */
function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

interface DeckMetaFormProps {
  draft: DeckDraft;
  onChange: (patch: Partial<DeckDraft>) => void;
}

/** Deck-level metadata fields for the deck-authoring editor. */
export function DeckMetaForm({ draft, onChange }: DeckMetaFormProps) {
  const { t } = useTranslation();
  const idPrefix = useId();
  const id = (field: string) => `${idPrefix}-${field}`;

  const textFields: Array<{
    field: keyof DeckDraft;
    labelKey: string;
  }> = [
    { field: "slug", labelKey: "magazine:deck.editor.slug" },
    { field: "title", labelKey: "magazine:deck.editor.title" },
    { field: "kicker", labelKey: "magazine:deck.editor.kicker" },
    { field: "section", labelKey: "magazine:deck.editor.section" },
    { field: "byline", labelKey: "magazine:deck.editor.byline" },
    { field: "role", labelKey: "magazine:deck.editor.role" },
    { field: "readTime", labelKey: "magazine:deck.editor.readTime" },
    { field: "coverDesc", labelKey: "magazine:deck.editor.coverDesc" },
  ];

  return (
    <div className={styles.form}>
      <div className={styles.row}>
        {textFields.slice(0, 4).map(({ field, labelKey }) => (
          <Field key={field} label={t(labelKey)} htmlFor={id(field)}>
            <input
              id={id(field)}
              className={styles.input}
              type="text"
              value={draft[field] as string}
              onChange={(event) => onChange({ [field]: event.target.value })}
            />
          </Field>
        ))}
      </div>

      <div className={styles.row}>
        {textFields.slice(4).map(({ field, labelKey }) => (
          <Field key={field} label={t(labelKey)} htmlFor={id(field)}>
            <input
              id={id(field)}
              className={styles.input}
              type="text"
              value={draft[field] as string}
              onChange={(event) => onChange({ [field]: event.target.value })}
            />
          </Field>
        ))}
      </div>

      <Field
        label={t("magazine:deck.editor.authorBio")}
        htmlFor={id("authorBio")}
      >
        <textarea
          id={id("authorBio")}
          className={styles.textarea}
          value={draft.authorBio}
          onChange={(event) => onChange({ authorBio: event.target.value })}
        />
      </Field>

      <div className={styles.row}>
        <Field label={t("magazine:deck.editor.tags")} htmlFor={id("tags")}>
          <input
            id={id("tags")}
            className={styles.input}
            type="text"
            value={joinCsv(draft.tags)}
            onChange={(event) =>
              onChange({ tags: splitCsv(event.target.value) })
            }
          />
        </Field>
        <Field
          label={t("magazine:deck.editor.related")}
          htmlFor={id("related")}
        >
          <input
            id={id("related")}
            className={styles.input}
            type="text"
            value={joinCsv(draft.related)}
            onChange={(event) =>
              onChange({ related: splitCsv(event.target.value) })
            }
          />
        </Field>
      </div>

      <ImageUrlField
        id={id("cover")}
        label={t("magazine:deck.editor.cover")}
        value={draft.cover}
        onChange={(url) => onChange({ cover: url })}
        alt={draft.coverDesc}
        tint={COVER_TINT}
      />
    </div>
  );
}
