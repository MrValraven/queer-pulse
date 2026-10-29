import { Collapse } from "../../shared/components/ui";
import { useStudioFoundingArtists } from "./api/useStudioFoundingArtists";
import { StudioArtistsRow } from "./StudioArtistsRow";

/** The launch shelf on Studio home: the founding artists in the order staff
 *  set. It folds away while the shelf switch is off or the list is empty;
 *  the badge on each card stays either way. */
export function StudioFoundingShelf() {
  const { founding } = useStudioFoundingArtists();
  return (
    <Collapse
      isOpen={founding?.isShelfVisible === true && founding.artists.length > 0}
    >
      <StudioArtistsRow
        artists={founding?.artists ?? []}
        titleKey="studio:home.founding.title"
      />
    </Collapse>
  );
}
