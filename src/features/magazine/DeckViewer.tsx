import { useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Slide, SlideDeck } from "./data/decks";
import { TextSlide } from "./TextSlide";
import { ImageSlide } from "./ImageSlide";
import { StatSlide } from "./StatSlide";
import { BeforeAfterSlide } from "./BeforeAfterSlide";
import { RevealSlide } from "./RevealSlide";
import { DeckControls } from "./DeckControls";
import styles from "./DeckPage.module.css";

function renderSlide(slide: Slide, active: boolean): ReactNode {
  switch (slide.layout) {
    case "text":
      return <TextSlide slide={slide} />;
    case "image":
      return <ImageSlide slide={slide} />;
    case "stat":
      return <StatSlide slide={slide} active={active} />;
    case "interactive":
      return slide.kind === "before-after" ? (
        <BeforeAfterSlide slide={slide} />
      ) : (
        <RevealSlide slide={slide} />
      );
  }
}

interface DeckViewerProps {
  deck: SlideDeck;
  index: number;
  onIndex: (index: number) => void;
}

export function DeckViewer({ deck, index, onIndex }: DeckViewerProps) {
  const { t } = useTranslation();
  const total = deck.slides.length;
  const isLastSlide = index === total - 1;
  const clamp = (next: number) =>
    onIndex(Math.max(0, Math.min(total - 1, next)));
  const touchX = useRef<number | null>(null);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- APG carousel: the region is intentionally keyboard-interactive for arrow-key slide nav.
    <div
      className={styles.viewer}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- APG carousel: region is intentionally focusable so keyboard users can arrow between slides.
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={typeof deck.title === "string" ? deck.title : deck.section}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "ArrowRight" || event.key === " ") {
          event.preventDefault();
          clamp(index + 1);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          clamp(index - 1);
        }
      }}
      onTouchStart={(event) => {
        touchX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchX.current === null) return;
        const endX = event.changedTouches[0]?.clientX;
        if (endX === undefined) {
          touchX.current = null;
          return;
        }
        const dx = endX - touchX.current;
        if (Math.abs(dx) > 40) clamp(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <div className={styles.stage}>
        {deck.slides.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            className={styles.slideWrap}
            aria-hidden={slideIndex !== index}
            data-active={slideIndex === index}
          >
            {renderSlide(slide, slideIndex === index)}
          </div>
        ))}
        <button
          type="button"
          className={`${styles.zone} ${styles.zoneLeft}`}
          aria-hidden
          tabIndex={-1}
          onClick={() => clamp(index - 1)}
        />
        <button
          type="button"
          className={`${styles.zone} ${styles.zoneRight}`}
          aria-hidden
          tabIndex={-1}
          onClick={() => clamp(index + 1)}
        />
      </div>
      <DeckControls
        current={index}
        total={total}
        onGo={clamp}
        onPrev={() => clamp(index - 1)}
        onNext={() => clamp(index + 1)}
      />
      {isLastSlide && (
        <div className={styles.endHint}>
          {t("magazine:deck.end")}{" "}
          <Link to={routes.magazine}>{t("magazine:deck.backToMagazine")}</Link>
        </div>
      )}
    </div>
  );
}
