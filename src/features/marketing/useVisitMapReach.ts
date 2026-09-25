import { useLayoutEffect, type RefObject } from "react";
import s from "./DirectorySpacePage.module.css";

/** The tallest the map band may grow. Past this, a long amenities list above
 *  the hours would turn the card into a poster. */
const MAX_MAP_HEIGHT = 440;

/**
 * Stretches the visit card's map band so the card ends level with the hours
 * card beside it (the `[data-hours-card]` box in `DirectoryHoursSection`).
 *
 * This lives in script because the two cards sit in different grid columns,
 * and CSS has no way to align the bottom edges of boxes in separate columns.
 * The map band absorbs the difference: MapLibre already tracks its
 * container's size, and its canvas is absolutely placed to fill the band, so
 * a taller band simply shows more map. The `min-height` on `.visitMap` stays
 * the floor, so a card already taller than the hours keeps its normal map.
 *
 * Once the edges line up the measured gap is zero and the height holds
 * steady. The grid is observed for anything that moves the hours card (the
 * main column's content, the viewport width), and the card's details for
 * anything that grows the card itself (an enquiry note). The map is left
 * unobserved because this hook is what resizes it.
 */
export function useVisitMapReach(
  cardRef: RefObject<HTMLElement | null>,
  shouldReach: boolean,
) {
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!shouldReach || !card) return;
    const grid = card.closest<HTMLElement>(`.${s.grid}`);
    if (!grid) return;

    const reach = () => {
      const map = card.querySelector<HTMLElement>(`.${s.visitMap}`);
      if (!map) return;
      const hoursCard = grid.querySelector<HTMLElement>("[data-hours-card]");
      if (!hoursCard) {
        map.style.height = "";
        return;
      }
      const gapToHoursEnd =
        hoursCard.getBoundingClientRect().bottom -
        card.getBoundingClientRect().bottom;
      const nextMapHeight = Math.min(
        MAX_MAP_HEIGHT,
        map.getBoundingClientRect().height + gapToHoursEnd,
      );
      map.style.height = `${nextMapHeight}px`;
    };

    reach();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(reach);
    if (observer) {
      observer.observe(grid);
      const visitBody = card.querySelector<HTMLElement>(`.${s.visitBody}`);
      if (visitBody) observer.observe(visitBody);
    }

    return () => {
      observer?.disconnect();
      const map = card.querySelector<HTMLElement>(`.${s.visitMap}`);
      if (map) map.style.height = "";
    };
  }, [cardRef, shouldReach]);
}
