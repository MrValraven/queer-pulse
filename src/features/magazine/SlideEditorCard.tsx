import { useId } from "react";
import type { AvatarTint } from "../../shared/components/ui";
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
  id,
  value,
  onChange,
}: {
  id: string;
  value: AvatarTint;
  onChange: (tint: AvatarTint) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {t("magazine:deck.editor.field.tint")}
      </label>
      <select
        id={id}
        className={styles.select}
        value={value}
        onChange={(event) => onChange(event.target.value as AvatarTint)}
      >
        {AVATAR_TINTS.map((tint) => (
          <option key={tint} value={tint}>
            {t(`magazine:deck.editor.tint.${tint}`)}
          </option>
        ))}
      </select>
    </div>
  );
}

type TextSlide = Extract<Slide, { layout: "text" }>;

function TextFields({ slide, onChange }: FieldsProps<TextSlide>) {
  const { t } = useTranslation();
  const id = useId();
  return (
    <>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-eyebrow`}>
          {t("magazine:deck.editor.field.eyebrow")}
        </label>
        <input
          id={`${id}-eyebrow`}
          className={styles.input}
          type="text"
          value={asText(slide.eyebrow)}
          onChange={(event) => onChange({ ...slide, eyebrow: event.target.value })}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-heading`}>
          {t("magazine:deck.editor.field.heading")}
        </label>
        <input
          id={`${id}-heading`}
          className={styles.input}
          type="text"
          value={asText(slide.heading)}
          onChange={(event) => onChange({ ...slide, heading: event.target.value })}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-body`}>
          {t("magazine:deck.editor.field.body")}
        </label>
        <textarea
          id={`${id}-body`}
          className={styles.textarea}
          value={asText(slide.body)}
          onChange={(event) => onChange({ ...slide, body: event.target.value })}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-pull`}>
          {t("magazine:deck.editor.field.pull")}
        </label>
        <input
          id={`${id}-pull`}
          className={styles.input}
          type="text"
          value={slide.pull ?? ""}
          onChange={(event) => onChange({ ...slide, pull: event.target.value })}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-align`}>
          {t("magazine:deck.editor.field.align")}
        </label>
        <select
          id={`${id}-align`}
          className={styles.select}
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
      </div>
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
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-alt`}>
          {t("magazine:deck.editor.field.alt")}
        </label>
        <input
          id={`${id}-alt`}
          className={styles.input}
          type="text"
          value={slide.alt}
          onChange={(event) => onChange({ ...slide, alt: event.target.value })}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-caption`}>
          {t("magazine:deck.editor.field.caption")}
        </label>
        <input
          id={`${id}-caption`}
          className={styles.input}
          type="text"
          value={slide.caption ?? ""}
          onChange={(event) => onChange({ ...slide, caption: event.target.value })}
        />
      </div>
      <TintSelect
        id={`${id}-tint`}
        value={slide.tint}
        onChange={(tint) => onChange({ ...slide, tint })}
      />
    </>
  );
}

type StatSlideMember = Extract<Slide, { layout: "stat" }>;

function StatFields({ slide, onChange }: FieldsProps<StatSlideMember>) {
  const { t } = useTranslation();
  const id = useId();
  return (
    <>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${id}-value`}>
            {t("magazine:deck.editor.field.value")}
          </label>
          <input
            id={`${id}-value`}
            className={styles.input}
            type="text"
            value={slide.value}
            onChange={(event) => onChange({ ...slide, value: event.target.value })}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${id}-unit`}>
            {t("magazine:deck.editor.field.unit")}
          </label>
          <input
            id={`${id}-unit`}
            className={styles.input}
            type="text"
            value={slide.unit ?? ""}
            onChange={(event) => onChange({ ...slide, unit: event.target.value })}
          />
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-label`}>
          {t("magazine:deck.editor.field.label")}
        </label>
        <input
          id={`${id}-label`}
          className={styles.input}
          type="text"
          value={asText(slide.label)}
          onChange={(event) => onChange({ ...slide, label: event.target.value })}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-source`}>
          {t("magazine:deck.editor.field.source")}
        </label>
        <input
          id={`${id}-source`}
          className={styles.input}
          type="text"
          value={slide.source ?? ""}
          onChange={(event) => onChange({ ...slide, source: event.target.value })}
        />
      </div>
      <TintSelect
        id={`${id}-tint`}
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
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-alt`}>
          {t("magazine:deck.editor.field.alt")}
        </label>
        <input
          id={`${id}-alt`}
          className={styles.input}
          type="text"
          value={value.alt}
          onChange={(event) => update({ alt: event.target.value })}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-label`}>
          {t("magazine:deck.editor.field.label")}
        </label>
        <input
          id={`${id}-label`}
          className={styles.input}
          type="text"
          value={value.label}
          onChange={(event) => update({ label: event.target.value })}
        />
      </div>
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
  const id = useId();
  return (
    <>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-prompt`}>
          {t("magazine:deck.editor.field.prompt")}
        </label>
        <textarea
          id={`${id}-prompt`}
          className={styles.textarea}
          value={asText(slide.prompt)}
          onChange={(event) => onChange({ ...slide, prompt: event.target.value })}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-hidden`}>
          {t("magazine:deck.editor.field.hidden")}
        </label>
        <textarea
          id={`${id}-hidden`}
          className={styles.textarea}
          value={asText(slide.hidden)}
          onChange={(event) => onChange({ ...slide, hidden: event.target.value })}
        />
      </div>
      <TintSelect
        id={`${id}-tint`}
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
