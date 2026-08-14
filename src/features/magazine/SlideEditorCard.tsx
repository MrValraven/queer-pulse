import { FiChevronDown, FiChevronUp, FiMoreVertical, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Slide } from "./data/decks";
import { BeforeAfterSlideFields } from "./desk/deck/BeforeAfterSlideFields";
import { ImageSlideFields } from "./desk/deck/ImageSlideFields";
import { RevealSlideFields } from "./desk/deck/RevealSlideFields";
import { StatSlideFields } from "./desk/deck/StatSlideFields";
import { TextSlideFields } from "./desk/deck/TextSlideFields";
import { asText } from "./desk/deck/slideFieldShared";
import styles from "./SlideEditorCard.module.css";

/** Dispatches to the field group for `slide`'s layout (and, for interactive
 * slides, its kind). Each field component preserves the discriminant on
 * every edit by spreading `slide`. */
function SlideFields({
  slide,
  onChange,
}: {
  slide: Slide;
  onChange: (slide: Slide) => void;
}) {
  switch (slide.layout) {
    case "text":
      return <TextSlideFields slide={slide} onChange={onChange} />;
    case "image":
      return <ImageSlideFields slide={slide} onChange={onChange} />;
    case "stat":
      return <StatSlideFields slide={slide} onChange={onChange} />;
    case "interactive":
      return slide.kind === "reveal" ? (
        <RevealSlideFields slide={slide} onChange={onChange} />
      ) : (
        <BeforeAfterSlideFields slide={slide} onChange={onChange} />
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

/** A short, single-line summary of `slide`'s content, shown when the card is
 * collapsed — the first ~70 characters of whichever field best identifies
 * the slide for its layout. */
function slideSummary(slide: Slide): string {
  const raw = (() => {
    switch (slide.layout) {
      case "text":
        return asText(slide.heading) || asText(slide.eyebrow) || asText(slide.body);
      case "image":
        return slide.caption ?? slide.alt;
      case "stat":
        return asText(slide.label) || slide.value;
      case "interactive":
        return slide.kind === "reveal"
          ? asText(slide.prompt)
          : slide.before.label || slide.after.label;
    }
  })().trim();
  return raw.length > 70 ? `${raw.slice(0, 70)}…` : raw;
}

interface SlideEditorCardProps {
  slide: Slide;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onChange: (slide: Slide) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

/**
 * One slide's editing card: a header (drag-grip affordance, slide number,
 * layout eyebrow, reorder/remove tools) over either the per-layout field
 * group (when this card is `selected`) or a one-line content summary
 * (collapsed). Every field edit preserves the `layout`/`kind` discriminant —
 * see `SlideFields` above and each field component's own `onChange` contract.
 */
export function SlideEditorCard({
  slide,
  index,
  selected,
  onSelect,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: SlideEditorCardProps) {
  const { t } = useTranslation();
  const summary = slideSummary(slide);

  return (
    <li className={selected ? `${styles.slideCard} ${styles.sel}` : styles.slideCard}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.headerMain}
          onClick={onSelect}
          aria-expanded={selected}
          aria-label={`${t("magazine:deck.editor.slideNumber", { n: index + 1 })}: ${t(
            layoutLabelKey(slide),
          )}`}
        >
          <FiMoreVertical aria-hidden className={styles.grip} />
          <span className={styles.n} aria-hidden>
            {index + 1}
          </span>
          <span className={styles.eyebrow} aria-hidden>
            {t(layoutLabelKey(slide))}
          </span>
        </button>
        <div className={styles.controls}>
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label={t("magazine:deck.editor.moveUp")}
          >
            <FiChevronUp aria-hidden />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label={t("magazine:deck.editor.moveDown")}
          >
            <FiChevronDown aria-hidden />
          </button>
          <button
            type="button"
            className={styles.remove}
            onClick={onRemove}
            aria-label={t("magazine:deck.editor.removeSlide")}
          >
            <FiTrash2 aria-hidden />
          </button>
        </div>
      </div>

      {selected ? (
        <div className={styles.sbody}>
          <SlideFields slide={slide} onChange={onChange} />
        </div>
      ) : (
        <button type="button" className={styles.summary} onClick={onSelect}>
          {summary || t("magazine:deck.editor.summaryEmpty")}
        </button>
      )}
    </li>
  );
}
