import { LocalBusinessCardBody } from "../../LocalBusinessCardBody";
import type { DirectoryPlace } from "../../directoryPlaces";
import dirStyles from "../../DirectoryPage.module.css";

/**
 * The real directory card for a sample place, inside the card surface the
 * directory grid draws (as the listing wizard's live preview does). No save
 * toggle and no link: it renders inside an inert showcase frame.
 */
export function SampleBusinessCard({
  place,
  className,
}: {
  place: DirectoryPlace;
  className?: string;
}) {
  return (
    <div className={[dirStyles.card, className].filter(Boolean).join(" ")}>
      <LocalBusinessCardBody place={place} shouldShowSave={false} />
    </div>
  );
}
