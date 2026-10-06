import { FiMapPin } from "react-icons/fi";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import venueStyles from "../VenuePicker.module.css";

/** The linked venue's address, read-only and styled like the venue picker's
 *  linked chip. It wraps in full, since a cut-off address is no address. */
export function LinkedVenueAddress({
  labelId,
  address,
  venueName,
}: {
  labelId: string;
  address: string;
  venueName: string;
}) {
  const { t } = useTranslation();
  return (
    <div role="group" aria-labelledby={labelId} className={venueStyles.linked}>
      <FiMapPin aria-hidden className={venueStyles.linkedIcon} />
      <div className={venueStyles.linkedBody}>
        <div className={cx(venueStyles.linkedName, venueStyles.linkedNameWrap)}>
          {address}
        </div>
        <div className={venueStyles.linkedMeta}>
          {t("gatherings:create.v2.when.addressFromListing", {
            name: venueName,
          })}
        </div>
      </div>
    </div>
  );
}
