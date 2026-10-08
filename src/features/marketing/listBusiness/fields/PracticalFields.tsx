import type { ReactNode } from "react";
import { FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR, validateSocials } from "../listBusiness.data";
import type { ListingForm } from "../useListingForm";
import { ListBusinessLocationField } from "../ListBusinessLocationField";
import { ListingHoursEditor } from "../ListingHoursEditor";
import { listingKindOf } from "../listingMobile.data";
import { AlsoSellsOnlineField } from "./AlsoSellsOnlineField";
import { MobilePracticalFields } from "./MobilePracticalFields";
import { OnlineSellingFields } from "./OnlineSellingFields";
import { SOCIAL_FIELDS } from "./practicalFields.data";
import styles from "../ListBusinessPage.module.css";

/**
 * The practical field body. A place: where it is, when it is open, and its
 * optional "We also sell online" section. An out-and-about business: its
 * optional meeting point, hours or "By appointment only", and "We also sell
 * online". An online-only business: "How
 * people buy from you" (main link through the reply note), which replaces the
 * address and the hours. Both end with the contact rows.
 *
 * Shared by the create wizard's step 3 pane (`StepPractical`) and the owner
 * editor's Practical section. Fragment, so each field stays a direct child of
 * the caller's `.stepBody` column.
 *
 * `hoursExtras` is a slot rendered directly under the weekly grid, for anything
 * that belongs with the hours but not on every surface. The owner editor puts
 * the per-date exceptions list there; the create wizard passes nothing, because
 * a business declaring its Christmas closure before it has been listed at all
 * is not the first submission's job.
 */
export function PracticalFields({
  form,
  hoursExtras,
}: {
  form: ListingForm;
  hoursExtras?: ReactNode;
}) {
  const { t } = useTranslation();
  const { draft, set, setSocial } = form;
  const socialOk = validateSocials(draft.social);
  const kind = listingKindOf(draft);

  return (
    <>
      {kind === "online" ? (
        <OnlineSellingFields form={form} variant="online" />
      ) : kind === "mobile" ? (
        <MobilePracticalFields form={form} hoursExtras={hoursExtras} />
      ) : (
        <>
          <ListBusinessLocationField draft={draft} set={set} />
          <ListingHoursEditor form={form} />
          {hoursExtras}
          <AlsoSellsOnlineField form={form} />
        </>
      )}

      <h3 className={styles.groupH}>
        {t(
          draft.online
            ? "marketing:listBusiness.step3.onlineHeadingOnline"
            : "marketing:listBusiness.step3.onlineHeading",
        )}
      </h3>
      <p className={styles.onlineHint}>
        {t("marketing:listBusiness.step3.onlineHint")}
      </p>
      <div id={ANCHOR.social} className={styles.twoCol}>
        {SOCIAL_FIELDS.map((social) => {
          const value = draft.social[social.key];
          const isValid = socialOk[social.key];
          return (
            <FormField
              key={social.key}
              className={styles.lbField}
              error={!isValid && social.errKey ? t(social.errKey) : undefined}
            >
              <input
                type={social.type}
                aria-invalid={!isValid}
                placeholder={t(social.placeholderKey)}
                value={value}
                onChange={(e) => setSocial(social.key, e.target.value)}
              />
            </FormField>
          );
        })}
      </div>
    </>
  );
}
