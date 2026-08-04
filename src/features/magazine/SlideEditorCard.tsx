import { useId } from "react";
import type { AvatarTint } from "../../shared/components/ui";
import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Slide } from "./data/decks";
import { ImageUrlField } from "./ImageUrlField";
import styles from "./DeckEditorPage.module.css";

const AVATAR_TINTS: AvatarTint[] = ["default", "coral", "jade", "plum", "auth"];

/**
 * Every text-ish field on `Slide` is typed `ReactNode` (the reader renders
 * `<em>` emphasis), but everything that reaches this editor was deserialized
 * from JSON (mock data or the API) — never live JSX — so it is always a
 * plain string in practice. This narrows for a controlled input without
 * lying about the wider reader-side type.
 */
function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

interface FieldsProps<T extends Slide> {
  slide: T;
  onChange: (slide: T) => void;
}

/** Shared tint `<select>` over the `AvatarTint` vocabulary. */
function TintSelect({
  value,
  onChange,
}: {
  value: AvatarTint;
  onChange: (tint: AvatarTint) => void;
}) {
  const { t } = useTranslation();
  return (
    <FormField label={t("magazine:deck.editor.field.tint")}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as AvatarTint)}
      >
        {AVATAR_TINTS.map((tint) => (
          <option key={tint} value={tint}>
            {t(`magazine:deck.editor.tint.${tint}`)}
          </option>
        ))}
      </select>
    </FormField>
  );
}

type TextSlide = Extract<Slide, { layout: "text" }>;

function TextFields({ slide, onChange }: FieldsProps<TextSlide>) {
  const { t } = useTranslation();
  return (
    <>
      <FormField label={t("magazine:deck.editor.field.eyebrow")}>
        <input
          type="text"
          value={asText(slide.eyebrow)}
          onChange={(event) => onChange({ ...slide, eyebrow: event.target.value })}
        />
      </FormField>
      <FormField label={t("magazine:deck.editor.field.heading")}>
        <input
          type="text"
          value={asText(slide.heading)}
          onChange={(event) => onChange({ ...slide, heading: event.target.value })}
        />
      </FormField>
      <FormField label={t("magazine:deck.editor.field.body")}>
        <textarea
          value={asText(slide.body)}
          onChange={(event) => onChange({ ...slide, body: event.target.value })}
        />
      </FormField>
      <FormField label={t("magazine:deck.editor.field.pull")}>
        <input
          type="text"
          value={slide.pull ?? ""}
          onChange={(event) => onChange({ ...slide, pull: event.target.value })}
        />
      </FormField>
      <FormField label={t("magazine:deck.editor.field.align")}>
        <select
          value={slide.align ?? ""}
          onChange={(event) =>
            onChange({
              ...slide,
              align:
                event.target.value === ""
                  ? undefined
                  : (event.target.value as "left" | "center"),
            })
          }
        >
          <option value="">{t("magazine:deck.editor.field.alignDefault")}</option>
          <option value="left">{t("magazine:deck.editor.field.alignLeft")}</option>
          <option value="center">{t("magazine:deck.editor.field.alignCenter")}</option>
        </select>
      </FormField>
    </>
  );
}

type ImageSlideMember = Extract<Slide, { layout: "image" }>;

function ImageFields({ slide, onChange }: FieldsProps<ImageSlideMember>) {
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
      <FormField label={t("magazine:deck.editor.field.alt")}>
        <input
          type="text"
          value={slide.alt}
          onChange={(event) => onChange({ ...slide, alt: event.target.value })}
        />
      </FormField>
      <FormField label={t("magazine:deck.editor.field.caption")}>
        <input
          type="text"
          value={slide.caption ?? ""}
          onChange={(event) => onChange({ ...slide, caption: event.target.value })}
        />
      </FormField>
      <TintSelect
        value={slide.tint}
        onChange={(tint) => onChange({ ...slide, tint })}
      />
    </>
  );
}

type StatSlideMember = Extract<Slide, { layout: "stat" }>;

function StatFields({ slide, onChange }: FieldsProps<StatSlideMember>) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.row}>
        <FormField label={t("magazine:deck.editor.field.value")}>
          <input
            type="text"
            value={slide.value}
            onChange={(event) => onChange({ ...slide, value: event.target.value })}
          />
        </FormField>
        <FormField label={t("magazine:deck.editor.field.unit")}>
          <input
            type="text"
            value={slide.unit ?? ""}
            onChange={(event) => onChange({ ...slide, unit: event.target.value })}
          />
        </FormField>
      </div>
      <FormField label={t("magazine:deck.editor.field.label")}>
        <input
          type="text"
          value={asText(slide.label)}
          onChange={(event) => onChange({ ...slide, label: event.target.value })}
        />
      </FormField>
      <FormField label={t("magazine:deck.editor.field.source")}>
        <input
          type="text"
          value={slide.source ?? ""}
          onChange={(event) => onChange({ ...slide, source: event.target.value })}
        />
      </FormField>
      <TintSelect
        value={slide.tint}
        onChange={(tint) => onChange({ ...slide, tint })}
      />
    </>
  );
}

type BeforeAfterSlideMember = Extract<
  Slide,
  { layout: "interactive"; kind: "before-after" }
>;
type BeforeAfterSide = "before" | "after";

function BeforeAfterSideFields({
  slide,
  side,
  onChange,
}: {
  slide: BeforeAfterSlideMember;
  side: BeforeAfterSide;
  onChange: (slide: BeforeAfterSlideMember) => void;
}) {
  const { t } = useTranslation();
  const id = useId();
  const value = slide[side];
  const update = (patch: Partial<BeforeAfterSlideMember["before"]>) =>
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
      <FormField label={t("magazine:deck.editor.field.alt")}>
        <input
          type="text"
          value={value.alt}
          onChange={(event) => update({ alt: event.target.value })}
        />
      </FormField>
      <FormField label={t("magazine:deck.editor.field.label")}>
        <input
          type="text"
          value={value.label}
          onChange={(event) => update({ label: event.target.value })}
        />
      </FormField>
    </div>
  );
}

function BeforeAfterFields({ slide, onChange }: FieldsProps<BeforeAfterSlideMember>) {
  return (
    <>
      <BeforeAfterSideFields slide={slide} side="before" onChange={onChange} />
      <BeforeAfterSideFields slide={slide} side="after" onChange={onChange} />
    </>
  );
}

type RevealSlideMember = Extract<Slide, { layout: "interactive"; kind: "reveal" }>;

function RevealFields({ slide, onChange }: FieldsProps<RevealSlideMember>) {
  const { t } = useTranslation();
  return (
    <>
      <FormField label={t("magazine:deck.editor.field.prompt")}>
        <textarea
          value={asText(slide.prompt)}
          onChange={(event) => onChange({ ...slide, prompt: event.target.value })}
        />
      </FormField>
      <FormField label={t("magazine:deck.editor.field.hidden")}>
        <textarea
          value={asText(slide.hidden)}
          onChange={(event) => onChange({ ...slide, hidden: event.target.value })}
        />
      </FormField>
      <TintSelect
        value={slide.tint ?? "default"}
        onChange={(tint) => onChange({ ...slide, tint })}
      />
    </>
  );
}

/** Dispatches to the field group for `slide`'s layout (and, for interactive
 * slides, its kind). Each edit preserves the discriminant by spreading `slide`. */
function SlideFields({ slide, onChange }: FieldsProps<Slide>) {
  switch (slide.layout) {
    case "text":
      return <TextFields slide={slide} onChange={onChange} />;
    case "image":
      return <ImageFields slide={slide} onChange={onChange} />;
    case "stat":
      return <StatFields slide={slide} onChange={onChange} />;
    case "interactive":
      return slide.kind === "reveal" ? (
        <RevealFields slide={slide} onChange={onChange} />
      ) : (
        <BeforeAfterFields slide={slide} onChange={onChange} />
      );
    default:
      return null;
  }
}

function layoutLabelKey(slide: Slide): string {
  const segment =
    slide.layout === "interactive"
      ? slide.kind === "reveal"
        ? "reveal"
        : "beforeAfter"
      : slide.layout;
  return `magazine:deck.editor.layout.${segment}`;
}

interface SlideEditorCardProps {
  slide: Slide;
  index: number;
  onChange: (slide: Slide) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

/**
 * One slide's editing card: a header (layout name, reorder, remove) over the
 * per-layout field group for `slide`. Every field edit preserves the
 * `layout`/`kind` discriminant via `{ ...slide, field: value }`.
 */
export function SlideEditorCard({
  slide,
  index,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: SlideEditorCardProps) {
  const { t } = useTranslation();
  return (
    <li className={styles.slideCard}>
      <div className={styles.slideHead}>
        <span className={styles.slideName}>
          {t("magazine:deck.editor.slideNumber", { n: index + 1 })}
          {" — "}
          {t(layoutLabelKey(slide))}
        </span>
        <div className={styles.slideControls}>
          <button
            type="button"
            className={styles.moveBtn}
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label={t("magazine:deck.editor.moveUp")}
          >
            ‹
          </button>
          <button
            type="button"
            className={styles.moveBtn}
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label={t("magazine:deck.editor.moveDown")}
          >
            ›
          </button>
          <button
            type="button"
            className={styles.removeBtn}
            onClick={onRemove}
            aria-label={t("magazine:deck.editor.removeSlide")}
          >
            ×
          </button>
        </div>
      </div>
      <div className={styles.slideBody}>
        <SlideFields slide={slide} onChange={onChange} />
      </div>
    </li>
  );
}
