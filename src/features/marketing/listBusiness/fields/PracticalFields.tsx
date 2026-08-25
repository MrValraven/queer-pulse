import type { ReactNode } from "react";
import { FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR, validateSocials } from "../listBusiness.data";
import type { ListingForm } from "../useListingForm";
import { ListBusinessLocationField } from "../ListBusinessLocationField";
import { ListingHoursEditor } from "../ListingHoursEditor";
import { SOCIAL_FIELDS } from "./practicalFields.data";
import styles from "../ListBusinessPage.module.css";

/**
 * The practical field body: where the place is, when it is open, and how to
 * reach it online.
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

  return (
    <>
      <ListBusinessLocationField draft={draft} set={set} />

      {!draft.online && (
        <>
          <ListingHoursEditor form={form} />
          {hoursExtras}
        </>
      )}

      <h3 className={styles.groupH}>
        {t("marketing:listBusiness.step3.onlineHeading")}
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
