import { LocalBusinessCard } from "../marketing/LocalBusinessCard";
import { OwnedPlaceCard } from "./OwnedPlaceCard";
import type { MemberPlace } from "./places.data";
import styles from "./PlacesSection.module.css";

/**
 * The places grid, in whichever of its two forms applies.
 *
 * The owner gets management cards (status chip, reference, quick edit, full
 * editor, and delete when the place is theirs to delete). A visitor gets the
 * directory card unmodified, bookmark and rating and whole-card link included,
 * so a profile never shows a second-class version of a place.
 */
export function PlacesGrid({
  places,
  isSelf,
  canManage,
  onRemove,
}: {
  places: MemberPlace[];
  isSelf: boolean;
  /** Owner view plus live mode plus a real ref: edit and delete address it. */
  canManage: (entry: MemberPlace) => boolean;
  /** Absent for a place this member cannot delete, which includes every place
   *  they only co-manage: removing a listing stays with its owner. */
  onRemove: (entry: MemberPlace) => (() => void) | undefined;
}) {
  return (
    <div className={styles.grid}>
      {places.map((entry, index) =>
        isSelf ? (
          <OwnedPlaceCard
            key={entry.key}
            entry={entry}
            canManage={canManage(entry)}
            onRemove={onRemove(entry)}
          />
        ) : (
          <LocalBusinessCard
            key={entry.key}
            place={entry.place}
            index={index}
          />
        ),
      )}
    </div>
  );
}
