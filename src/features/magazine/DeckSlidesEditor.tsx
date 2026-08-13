import { useId, useState } from "react";
import { Button, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Slide } from "./data/decks";
import { newSlide } from "./deckDraft";
import { SlideEditorCard } from "./SlideEditorCard";
import styles from "./DeckSlidesEditor.module.css";

type AddSlideOption = "text" | "image" | "stat" | "before-after" | "reveal";

/** A deck caps out at 40 slides — the design's stated ceiling for a single
 *  authored deck (`docs/superpowers/plans/2026-08-10-magazine-desk-phase4.md`
 *  Task 3). */
const MAX_SLIDES = 40;

const ADD_OPTIONS: Array<{ id: AddSlideOption; labelKey: string }> = [
  { id: "text", labelKey: "magazine:deck.editor.layout.text" },
  { id: "image", labelKey: "magazine:deck.editor.layout.image" },
  { id: "stat", labelKey: "magazine:deck.editor.layout.stat" },
  { id: "before-after", labelKey: "magazine:deck.editor.layout.beforeAfter" },
  { id: "reveal", labelKey: "magazine:deck.editor.layout.reveal" },
];

/** `newSlide` is overloaded so `kind` is only accepted (and required) for
 * `"interactive"` — this switch calls each overload with its own literal
 * arguments so the picker's dynamic `AddSlideOption` still type-checks. */
function buildSlide(option: AddSlideOption): Slide {
  switch (option) {
    case "text":
      return newSlide("text");
    case "image":
      return newSlide("image");
    case "stat":
      return newSlide("stat");
    case "before-after":
      return newSlide("interactive", "before-after");
    case "reveal":
      return newSlide("interactive", "reveal");
    default:
      return newSlide("text");
  }
}

interface DeckSlidesEditorProps {
  slides: Slide[];
  onChange: (slides: Slide[]) => void;
}

/**
 * The deck-authoring editor's ordered slide list: one `SlideEditorCard` per
 * slide (wired for in-place edit, remove, and immutable bounds-guarded
 * reorder) plus an add-slide layout/kind picker below the list. Owns which
 * single card is expanded (`selectedIndex`) — purely a local UI affordance,
 * not part of the slide-mutation contract below.
 */
export function DeckSlidesEditor({ slides, onChange }: DeckSlidesEditorProps) {
  const { t } = useTranslation();
  const selectId = useId();
  const [selectedOption, setSelectedOption] = useState<AddSlideOption>("text");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    slides.length > 0 ? 0 : null,
  );

  const replaceAt = (index: number, slide: Slide) => {
    onChange(
      slides.map((existing, existingIndex) =>
        existingIndex === index ? slide : existing,
      ),
    );
  };

  const removeAt = (index: number) => {
    onChange(slides.filter((_, existingIndex) => existingIndex !== index));
    setSelectedIndex((current) => {
      if (current === null) return null;
      if (current === index) return null;
      return current > index ? current - 1 : current;
    });
  };

  const swap = (indexA: number, indexB: number) => {
    if (indexB < 0 || indexB >= slides.length) return;
    const next = [...slides];
    [next[indexA], next[indexB]] = [next[indexB]!, next[indexA]!];
    onChange(next);
    setSelectedIndex((current) =>
      current === indexA ? indexB : current === indexB ? indexA : current,
    );
  };

  const atCap = slides.length >= MAX_SLIDES;

  const addSlide = () => {
    if (atCap) return;
    onChange([...slides, buildSlide(selectedOption)]);
    setSelectedIndex(slides.length);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.sectionHead}>
        <h3>{t("magazine:deck.editor.slidesHeading")}</h3>
        <span className={styles.sectionSub}>
          {t("magazine:deck.editor.slidesCount", { count: slides.length, max: MAX_SLIDES })}
        </span>
      </div>
      <ol className={styles.slides}>
        {slides.map((slide, index) => (
          <SlideEditorCard
            key={index}
            slide={slide}
            index={index}
            selected={selectedIndex === index}
            onSelect={() =>
              setSelectedIndex((current) => (current === index ? null : index))
            }
            onChange={(next) => replaceAt(index, next)}
            onRemove={() => removeAt(index)}
            onMoveUp={() => swap(index, index - 1)}
            onMoveDown={() => swap(index, index + 1)}
            canMoveUp={index > 0}
            canMoveDown={index < slides.length - 1}
          />
        ))}
      </ol>

      <div className={styles.addbar}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={selectId}>
            {t("magazine:deck.editor.addSlideLayout")}
          </label>
          <Select
            id={selectId}
            size="sm"
            value={selectedOption}
            disabled={atCap}
            onChange={(value) => setSelectedOption(value as AddSlideOption)}
            options={ADD_OPTIONS.map((option) => ({
              value: option.id,
              label: t(option.labelKey),
            }))}
          />
        </div>
        <Button type="button" variant="ghost" onClick={addSlide} disabled={atCap}>
          {t("magazine:deck.editor.addSlide")}
        </Button>
        <p className={styles.hint}>
          {atCap
            ? t("magazine:deck.editor.slidesCapped")
            : t("magazine:deck.editor.addSlideHint")}
        </p>
      </div>
    </div>
  );
}
