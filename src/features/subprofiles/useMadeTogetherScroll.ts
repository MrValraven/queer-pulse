import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../shared/hooks";

/** A sub-pixel tolerance, because browsers round `scrollLeft` differently. */
const EDGE_TOLERANCE_PX = 2;

export type MadeTogetherScrollDirection = "previous" | "next";

export interface MadeTogetherScroll {
  /** Attach to the scroll-snap list that holds the cards. */
  trackRef: React.RefObject<HTMLUListElement | null>;
  /** Index of the card whose left edge sits nearest the start of the track. */
  activeIndex: number;
  canScrollPrevious: boolean;
  canScrollNext: boolean;
  /** Moves one page of cards. Smooth, or an instant jump under reduced motion. */
  scrollPage: (direction: MadeTogetherScrollDirection) => void;
  /** Brings one card to the start of the track, for the dots. */
  scrollToIndex: (index: number) => void;
}

/**
 * Reads and drives the "Made together" strip's native scroll-snap track.
 * The browser owns the scrolling; this only observes where it landed (one
 * passive scroll listener, batched to a frame) so the dots and the arrows can
 * reflect it, and issues `scrollTo` for the arrows. `cardCount` re-measures
 * when the list changes.
 */
export function useMadeTogetherScroll(cardCount: number): MadeTogetherScroll {
  const trackRef = useRef<HTMLUListElement | null>(null);
  const isReducedMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const firstCard = cards[0];
    if (!firstCard) return;
    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    const isAtEnd = track.scrollLeft >= maxScrollLeft - EDGE_TOLERANCE_PX;
    setCanScrollPrevious(track.scrollLeft > EDGE_TOLERANCE_PX);
    setCanScrollNext(!isAtEnd);
    if (isAtEnd && maxScrollLeft > EDGE_TOLERANCE_PX) {
      setActiveIndex(cards.length - 1);
      return;
    }
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const distance = Math.abs(
        card.offsetLeft - firstCard.offsetLeft - track.scrollLeft,
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    setActiveIndex(nearestIndex);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frameId = 0;
    const scheduleMeasure = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(measure);
    };
    scheduleMeasure();
    track.addEventListener("scroll", scheduleMeasure, { passive: true });
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(scheduleMeasure);
    resizeObserver?.observe(track);
    return () => {
      cancelAnimationFrame(frameId);
      track.removeEventListener("scroll", scheduleMeasure);
      resizeObserver?.disconnect();
    };
  }, [measure, cardCount]);

  const scrollBehavior: ScrollBehavior = isReducedMotion ? "auto" : "smooth";

  const scrollPage = useCallback(
    (direction: MadeTogetherScrollDirection) => {
      const track = trackRef.current;
      const firstCard = track?.children[0] as HTMLElement | undefined;
      const secondCard = track?.children[1] as HTMLElement | undefined;
      if (!track || !firstCard) return;
      // One card plus its gap; a page is as many whole cards as fit.
      const cardStep = secondCard
        ? secondCard.offsetLeft - firstCard.offsetLeft
        : firstCard.offsetWidth;
      const cardsPerPage = Math.max(
        1,
        Math.floor(track.clientWidth / cardStep),
      );
      const distance = cardStep * cardsPerPage;
      track.scrollBy({
        left: direction === "next" ? distance : -distance,
        behavior: scrollBehavior,
      });
    },
    [scrollBehavior],
  );

  const scrollToIndex = useCallback(
    (index: number) => {
      const track = trackRef.current;
      const cards = track ? (Array.from(track.children) as HTMLElement[]) : [];
      const card = cards[index];
      const firstCard = cards[0];
      if (!track || !card || !firstCard) return;
      track.scrollTo({
        left: card.offsetLeft - firstCard.offsetLeft,
        behavior: scrollBehavior,
      });
    },
    [scrollBehavior],
  );

  return {
    trackRef,
    activeIndex,
    canScrollPrevious,
    canScrollNext,
    scrollPage,
    scrollToIndex,
  };
}
