import type { ReactNode } from "react";
import { FiMapPin } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { DirectoryPlace } from "../marketing/directoryPlaces";
import type { VenueSelection } from "./VenuePicker";
import { VenuePlaceTile } from "./VenuePlaceTile";
import styles from "./VenuePickerInline.module.css";

/**
 * The venue the gathering has now, at the top of the inline picker, so the
 * host can see what Save will keep before searching for anything else. The
 * name wraps in full: a venue cut off with an ellipsis is a venue the host
 * has to guess at. `detail` sits under the meta line, inside the same card,
 * for whatever the caller knows about the venue (the Edit venue modal shows
 * the listing's street address there).
 */
export function VenueSelectedCard({
  value,
  place,
  detail,
}: {
  value: VenueSelection;
  /** The linked listing, when the directory has it loaded. */
  place: DirectoryPlace | undefined;
  detail?: ReactNode;
}) {
  const { t } = useTranslation();
  const isLinked = value.venueListing !== null;
  return (
    <div className={styles.selection}>
      <div className={styles.eyebrow}>
        {t("gatherings:venuePicker.selectedLabel")}
      </div>
      <div className={styles.card}>
        <VenuePlaceTile place={isLinked ? place : null} size={52} />
        <div className={styles.cardBody}>
          <div className={styles.cardName}>
            {value.venueListing?.name ?? value.text}
          </div>
          <div className={styles.cardMeta}>
            {isLinked
              ? t("gatherings:venuePicker.fromDirectory")
              : t("gatherings:venuePicker.typedByHand")}
          </div>
          {detail && <div className={styles.cardDetail}>{detail}</div>}
        </div>
      </div>
    </div>
  );
}

/** A linked listing's street address, as the selected card's detail: the
 *  address wraps in full, under a label saying who gets to see it. */
export function VenueAddressDetail({ address }: { address: string }) {
  const { t } = useTranslation();
  return (
    <div className={styles.address}>
      <FiMapPin aria-hidden className={styles.addressIcon} />
      <div>
        <div className={styles.addressLabel}>
          {t("gatherings:create.v2.when.addressLabel")}
          <span className={styles.addressNote}>
            {t("gatherings:create.v2.when.addressNote")}
          </span>
        </div>
        <div className={styles.addressText}>{address}</div>
      </div>
    </div>
  );
}
