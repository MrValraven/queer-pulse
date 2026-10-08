import type { ReactNode } from "react";
import { CheckLine } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ListingHoursEditor } from "../ListingHoursEditor";
import { ANCHOR } from "../listBusiness.data";
import { normalizeMobileDetails } from "../listingMobile.data";
import type { ListingForm } from "../useListingForm";
import { AlsoSellsOnlineField } from "./AlsoSellsOnlineField";
import { MeetingPointField } from "./MeetingPointField";
import styles from "../ListBusinessPage.module.css";

/**
 * The practical step for an out-and-about listing, in order: the optional
 * meeting point, then the hours with "By appointment only" above the grid
 * (ticking it hides the grid, the note and the special dates, and the save
 * sends none), then "We also sell online", unchanged. The caller adds the
 * contact rows and languages after, as for every kind.
 */
export function MobilePracticalFields({
  form,
  hoursExtras,
}: {
  form: ListingForm;
  hoursExtras?: ReactNode;
}) {
  const { t } = useTranslation();
  const { draft, setByAppointment } = form;
  const isByAppointment = normalizeMobileDetails(
    draft.mobileDetails,
  ).byAppointment;
  return (
    <>
      <MeetingPointField form={form} />
      <h3 className={styles.groupH}>
        {t("marketing:listBusiness.step3.hoursHeading")}
      </h3>
      <div id={ANCHOR.byAppointment} className={styles.onlineToggleRow}>
        <CheckLine
          checked={isByAppointment}
          onChange={setByAppointment}
          title={t("marketing:listBusiness.step3.byAppointment.title")}
          sub={t("marketing:listBusiness.step3.byAppointment.sub")}
        />
      </div>
      {!isByAppointment && (
        <>
          <ListingHoursEditor form={form} hasHeading={false} />
          {hoursExtras}
        </>
      )}
      <AlsoSellsOnlineField form={form} />
    </>
  );
}
