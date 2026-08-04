import { useId, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Slide } from "./data/decks";
import { newSlide } from "./deckDraft";
import { SlideEditorCard } from "./SlideEditorCard";
import styles from "./DeckEditorPage.module.css";

type AddSlideOption = "text" | "image" | "stat" | "before-after" | "reveal";

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
 * reorder) plus an add-slide layout/kind picker below the list.
 */
export function DeckSlidesEditor({ slides, onChange }: DeckSlidesEditorProps) {
  const { t } = useTranslation();
  const selectId = useId();
  const [selectedOption, setSelectedOption] = useState<AddSlideOption>("text");

  const replaceAt = (index: number, slide: Slide) => {
    onChange(
      slides.map((existing, existingIndex) =>
        existingIndex === index ? slide : existing,
      ),
    );
  };

  const removeAt = (index: number) => {
    onChange(slides.filter((_, existingIndex) => existingIndex !== index));
  };

  const swap = (indexA: number, indexB: number) => {
    if (indexB < 0 || indexB >= slides.length) return;
    const next = [...slides];
    [next[indexA], next[indexB]] = [next[indexB]!, next[indexA]!];
    onChange(next);
  };

  const addSlide = () => {
    onChange([...slides, buildSlide(selectedOption)]);
  };

  return (
    <div className={styles.form}>
      <ol className={styles.slideList}>
        {slides.map((slide, index) => (
          <SlideEditorCard
            key={index}
            slide={slide}
            index={index}
            onChange={(next) => replaceAt(index, next)}
            onRemove={() => removeAt(index)}
            onMoveUp={() => swap(index, index - 1)}
            onMoveDown={() => swap(index, index + 1)}
            canMoveUp={index > 0}
            canMoveDown={index < slides.length - 1}
          />
        ))}
      </ol>

      <div className={styles.addSlide}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={selectId}>
            {t("magazine:deck.editor.addSlideLayout")}
          </label>
          <select
            id={selectId}
            className={styles.select}
            value={selectedOption}
            onChange={(event) =>
              setSelectedOption(event.target.value as AddSlideOption)
            }
          >
            {ADD_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </div>
        <Button type="button" variant="ghost" onClick={addSlide}>
          {t("magazine:deck.editor.addSlide")}
        </Button>
      </div>
    </div>
  );
}
