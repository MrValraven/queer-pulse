import { type FocusEvent, type ReactNode, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import { FadeIn } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
import { useSaved } from "../../app/providers/useSaved";
import { routes } from "../../app/routeMap";
import { LocalBusinessCardBody } from "./LocalBusinessCardBody";
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
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isSaved, toggleSave } = useSaved();
  const savedId = `listing:${place.slug}`;
  const saved = isSaved(savedId);

  function handleSave(event: SyntheticEvent) {
    event.preventDefault();
    event.stopPropagation();
    const nowSaved = toggleSave({
      id: savedId,
      kind: "listing",
      title: place.name,
      href: `${routes.directory}/${place.slug}`,
      meta: place.hood,
    });
    showToast(
      t(
        nowSaved
          ? "marketing:directory.card.savedToast"
          : "marketing:directory.card.unsavedToast",
        { name: place.name },
      ),
      nowSaved ? "success" : "info",
    );
  }

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
        saveControl={{ saved, onSave: handleSave }}
        photoTag={photoTag}
      />
    </FadeIn>
  );
}
