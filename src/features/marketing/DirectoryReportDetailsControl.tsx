import { useState } from "react";
import { useAuth } from "../../app/providers/authContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type DirectoryPlace } from "./directoryPlaces";
import { DirectorySuggestEditModal } from "./DirectorySuggestEditModal";
import {
  hasMeetingPoint,
  listingKindOf,
} from "./listBusiness/listingMobile.data";
import styles from "./DirectoryContestControl.module.css";
import pageStyles from "./DirectorySpacePage.module.css";

/**
 * "Suggest an edit to these details", at the foot of What's here: a member
 * who finds a detail wrong opens the suggestion form on the "Details and
 * amenities" bucket, which lands in the moderator queue. Same gate as the
 * aside's contest control: signed-in members only, and never the owner,
 * who edits the listing instead. The wrapper lines its text up under the
 * safer-space policy link and underlines it the same way.
 */
export function DirectoryReportDetailsControl({
  place,
  ownerRef,
}: {
  place: DirectoryPlace;
  ownerRef?: string;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  if (ownerRef || !user) return null;

  return (
    <>
      <div className={pageStyles.suggestDetails}>
        <button
          type="button"
          className={styles.trigger}
          onClick={() => setIsOpen(true)}
          aria-label={t(
            "marketing:directory.detail.whatsHere.suggestEditAria",
            { name: place.name },
          )}
        >
          {t("marketing:directory.detail.whatsHere.suggestEdit")}
        </button>
      </div>
      {isOpen && (
        <DirectorySuggestEditModal
          slug={place.slug}
          placeName={place.name}
          isOnline={place.online === true}
          hasNoAddress={
            listingKindOf(place) === "mobile" && !hasMeetingPoint(place)
          }
          initialField="attributes"
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
