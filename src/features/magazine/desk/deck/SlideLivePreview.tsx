import type { ReactNode } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { cx } from "../../../../shared/lib/cx";
import { useTablistKeys } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { Slide } from "../../data/decks";
import { TextSlide } from "../../TextSlide";
import { ImageSlide } from "../../ImageSlide";
import { StatSlide } from "../../StatSlide";
import { BeforeAfterSlide } from "../../BeforeAfterSlide";
import { RevealSlide } from "../../RevealSlide";
import styles from "./SlideLivePreview.module.css";

/**
 * True when a slide has none of its layout's content-bearing fields filled
 * in yet — freshly added via `newSlide()`, or cleared mid-edit. Rendering the
 * real reader component for a blank slide would show an empty/broken frame
 * (a bare white box, or a stat slide with no value); a placeholder reads
 * better while the author is still typing.
 */
function isSlideBlank(slide: Slide): boolean {
  switch (slide.layout) {
    case "text":
      return !slide.eyebrow && !slide.heading && !slide.body && !slide.pull;
    case "image":
      return !slide.src && !slide.alt;
    case "stat":
      return !slide.value && !slide.label;
    case "interactive":
      return slide.kind === "reveal"
        ? !slide.prompt && !slide.hidden
        : !slide.before.src && !slide.after.src;
  }
}

/**
 * Dispatches to the exact reader component for `slide`'s layout — the same
 * switch `DeckViewer` uses internally (that one isn't exported, so this is a
 * thin, deliberately identical mirror). Every field on the editor's
 * `DeckDraft.slides` is already the reader's real `Slide` union (see
 * `deckDraft.ts` — `newSlide`/form edits produce plain strings, which is
 * exactly what the `ReactNode`-typed fields accept), so no draft→published
 * mapping step is needed: what's passed in IS what a reader would receive.
 */
function renderReaderSlide(slide: Slide): ReactNode {
  switch (slide.layout) {
    case "text":
      return <TextSlide slide={slide} />;
    case "image":
      return <ImageSlide slide={slide} />;
    case "stat":
      // Always "active": this preview only ever shows one slide at a time,
      // so the stat count-up should always play, unlike the swipeable
      // reader stage where only the current slide of many is active.
      return <StatSlide slide={slide} active />;
    case "interactive":
      return slide.kind === "before-after" ? (
        <BeforeAfterSlide slide={slide} />
      ) : (
        <RevealSlide slide={slide} />
      );
  }
}

export interface SlideLivePreviewProps {
  /** The slide currently being edited/previewed; `undefined` when the deck
   *  has no slides yet (or the selected index has fallen out of range). */
  slide: Slide | undefined;
  /** Zero-based index of `slide` among `total` — drives which dot is lit. */
  index: number;
  total: number;
  onGo: (index: number) => void;
}

/**
 * The deck editor's "what readers will see" rail card: renders the current
 * draft slide through the REAL reader slide components (never a bespoke
 * preview renderer), inside a 4:5 phone-proportioned frame, with a row of
 * dot buttons to jump between slides. Because it's the same components the
 * published `/magazine/deck/:slug` page uses, the preview cannot drift from
 * what a reader actually sees.
 */
export function SlideLivePreview({ slide, index, total, onGo }: SlideLivePreviewProps) {
  const { t } = useTranslation();
  // APG tablist keys across the slide dots.
  const { tabProps } = useTablistKeys(total, onGo);

  return (
    <div className={styles.card}>
      <h3>{t("magazine:deck.editor.preview.title")}</h3>
      <div className={styles.frame}>
        {!slide ? (
          <p className={styles.frameEmpty}>{t("magazine:deck.editor.previewEmpty")}</p>
        ) : isSlideBlank(slide) ? (
          <p className={styles.frameEmpty}>{t("magazine:deck.editor.preview.emptySlide")}</p>
        ) : (
          renderReaderSlide(slide)
        )}
      </div>
      {total > 0 && (
        <div className={styles.nav}>
          <Button
            variant="ghost"
            size="sm"
            disabled={index <= 0}
            aria-label={t("magazine:deck.prev")}
            onClick={() => onGo(index - 1)}
          >
            <FiChevronLeft aria-hidden />
          </Button>
          <div
            className={styles.dots}
            role="tablist"
            aria-label={t("magazine:deck.editor.preview.title")}
          >
            {Array.from({ length: total }, (_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                role="tab"
                aria-selected={dotIndex === index}
                {...tabProps(dotIndex, dotIndex === index)}
                aria-label={t("magazine:deck.goToSlide", { n: dotIndex + 1 })}
                className={cx(styles.dot, dotIndex === index && styles.dotOn)}
                onClick={() => onGo(dotIndex)}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={index >= total - 1}
            aria-label={t("magazine:deck.next")}
            onClick={() => onGo(index + 1)}
          >
            <FiChevronRight aria-hidden />
          </Button>
        </div>
      )}
    </div>
  );
}
