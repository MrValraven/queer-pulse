import { FiPlus } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import { MAX_LISTING_SERVICES } from "../listingServices.data";
import type { ListingForm } from "../useListingForm";
import { ListingServiceRowFields } from "./ListingServiceRowFields";
import styles from "./ListingServices.module.css";

/**
 * What the business sells and what it costs.
 *
 * The price band chosen in Basics is untouched and stays the at-a-glance
 * signal a member scans a grid by. This is the next question answered: what,
 * specifically, and for how much. Every price is the owner's own words, so a
 * sliding scale, a "first session free" and a flat number all fit.
 *
 * Optional throughout. A business that prices nothing simply leaves the list
 * empty, and a row that was started but left half-filled says which half is
 * missing rather than blocking the whole save with a vague complaint.
 */
export function ListingServicesFields({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, addService, setServiceField, removeService, moveService } =
    form;
  const services = draft.services ?? [];
  const isAtCeiling = services.length >= MAX_LISTING_SERVICES;

  return (
    <div id={ANCHOR.services}>
      <p className={styles.intro}>
        {t("marketing:listBusiness.services.intro")}
      </p>

      {services.length === 0 ? (
        <p className={styles.empty}>
          {t("marketing:listBusiness.services.empty")}
        </p>
      ) : (
        <div className={styles.rows}>
          {services.map((row, index) => (
            <ListingServiceRowFields
              key={row.id}
              row={row}
              position={index + 1}
              total={services.length}
              onChange={setServiceField}
              onRemove={removeService}
              onMove={moveService}
            />
          ))}
        </div>
      )}

      <div className={styles.addRow}>
        <Button variant="ghost" onClick={addService} disabled={isAtCeiling}>
          <FiPlus aria-hidden /> {t("marketing:listBusiness.services.addCta")}
        </Button>
        <span className={styles.addHint}>
          {isAtCeiling
            ? t("marketing:listBusiness.services.ceilingHint", {
                count: MAX_LISTING_SERVICES,
              })
            : t("marketing:listBusiness.services.addHint")}
        </span>
      </div>
    </div>
  );
}
