import { type FocusEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FadeIn } from "../../shared/components/ui";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
import { routes } from "../../app/routeMap";
import { LocalBusinessCardBody } from "./LocalBusinessCardBody";
import { useListingSaveToggle } from "./useListingSaveToggle";
import type { DirectoryPlace } from "./directoryPlaces";
import s from "./DirectoryPage.module.css";

/** One business card in the unified Local list. */
export function LocalBusinessCard({
  place,
  index,
  photoTag,
}: {
  place: DirectoryPlace;
  index: number;
  /** Optional chip over the photo: the "Within a short walk" strip passes
   *  the walking distance so its cards match the directory grid exactly. */
  photoTag?: ReactNode;
}) {
  const saveControl = useListingSaveToggle(place);

  /**
   * Brings the card fully into view when the keyboard lands on it. In the
   * phone scroll-snap rail the browser treats a peeking card as already
   * visible and leaves it mostly off screen, so this scrolls the rail to it.
   * Only the card's own focus counts: the nested Save button scrolls itself.
   * In the directory grid `nearest` moves the page only when the card is cut
   * off at the top or bottom, so the handler stays quiet there.
   */
  function handleKeyboardFocus(event: FocusEvent<HTMLElement>) {
    const card = event.currentTarget;
    const isCardItself = event.target === card;
    if (!isCardItself || !card.matches(":focus-visible")) return;
    card.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: prefersReducedMotionNow() ? "auto" : "smooth",
    });
  }

  return (
    <FadeIn
      as={Link}
      delay={Math.min(index, 8) * 60}
      to={`${routes.directory}/${place.slug}`}
      className={s.card}
      onFocus={handleKeyboardFocus}
    >
      <LocalBusinessCardBody
        place={place}
        saveControl={saveControl}
        photoTag={photoTag}
      />
    </FadeIn>
  );
}
