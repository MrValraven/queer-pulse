import { type SyntheticEvent } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSaved } from "../../app/providers/useSaved";
import { routes } from "../../app/routeMap";
import type { DirectoryPlace } from "./directoryPlaces";

/**
 * The bookmark on a directory card: whether this listing is saved, and the
 * handler that flips it and says so in a toast. The handler stops the event,
 * because the bookmark sits inside the card's link and a save must never also
 * open the listing.
 */
export function useListingSaveToggle(place: DirectoryPlace): {
  saved: boolean;
  onSave: (event: SyntheticEvent) => void;
} {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isSaved, toggleSave } = useSaved();
  const savedId = `listing:${place.slug}`;

  function onSave(event: SyntheticEvent) {
    event.preventDefault();
    event.stopPropagation();
    const nowSaved = toggleSave({
      id: savedId,
      kind: "listing",
      title: place.name,
      href: `${routes.directory}/${place.slug}`,
      meta: place.online ? t("marketing:directory.card.online") : place.hood,
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

  return { saved: isSaved(savedId), onSave };
}
