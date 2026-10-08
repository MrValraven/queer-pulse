import { FiLock } from "react-icons/fi";
import { CheckLine, FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  ADULT_LISTING_CATEGORY_SLUG,
  isAdultCategoryPicked,
  listingCategoriesFor,
} from "../../localCategories";
import { ANCHOR, catLabel } from "../listBusiness.data";
import {
  canAcceptAdultTerms,
  isAdultCategoryOffered,
} from "../listingOnline.data";
import { listingKindOf, type ListingKind } from "../listingMobile.data";
import type { ListingForm } from "../useListingForm";
import styles from "../ListBusinessPage.module.css";
import onlineStyles from "./BasicsOnline.module.css";

const STEP_KEY = "marketing:listBusiness.step1";

const CATS_LABEL_KEYS: Record<ListingKind, string> = {
  place: `${STEP_KEY}.catsLabel`,
  online: `${STEP_KEY}.catsLabelOnline`,
  mobile: `${STEP_KEY}.catsLabelMobile`,
};

/**
 * The category chips for the listing's kind, up to two. A stored category the
 * kind does not offer (a draft from before the online vocabulary) is shown
 * after the list so it can be unticked; the missing-fields bar names it.
 *
 * Picking the 18+ category opens its acknowledgement right under the chips.
 * Only the business can accept the 18+ rules (`canAcceptAdultTerms`): staff
 * and a member suggesting a business are offered the category only on an
 * edit of a listing that already holds the server's stamp, and are never
 * shown the checkbox. A picked category they are not offered still shows
 * after the list, so it can be unticked.
 */
export function BasicsCategoryField({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, toggleCat, setAdultTermsAccepted } = form;
  const isAdultOffered = isAdultCategoryOffered(draft);
  const offered = listingCategoriesFor(draft.online).filter(
    (category) => category !== ADULT_LISTING_CATEGORY_SLUG || isAdultOffered,
  );
  const choices = [
    ...offered,
    ...draft.cats.filter((category) => !offered.includes(category)),
  ];
  const isAdultPicked = isAdultCategoryPicked(draft.cats) && isAdultOffered;

  return (
    <>
      <FormField
        className={[styles.lbField, onlineStyles.catsField].join(" ")}
        id={ANCHOR.cats}
        label={
          <span className={onlineStyles.catsLabelText}>
            {t(CATS_LABEL_KEYS[listingKindOf(draft)])}
          </span>
        }
        required
      >
        <div
          className={styles.chipRow}
          role="group"
          aria-label={t(`${STEP_KEY}.catsAria`)}
        >
          {choices.map((category) => {
            const isOn = draft.cats.includes(category);
            const isFull = draft.cats.length >= 2 && !isOn;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={isOn}
                disabled={isFull}
                className={[styles.chip, isOn && styles.chipOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => toggleCat(category)}
              >
                {catLabel(t, category)}
              </button>
            );
          })}
        </div>
      </FormField>
      {isAdultPicked && (
        <div id={ANCHOR.adultTerms} className={onlineStyles.adultTerms}>
          {canAcceptAdultTerms(draft) && (
            <CheckLine
              checked={draft.adultTermsAccepted === true}
              onChange={setAdultTermsAccepted}
              title={t(`${STEP_KEY}.adultTerms.title`)}
              sub={t(`${STEP_KEY}.adultTerms.sub`)}
            />
          )}
          <p className={onlineStyles.adultNote}>
            <FiLock aria-hidden />
            <span>{t(`${STEP_KEY}.adultTerms.note`)}</span>
          </p>
        </div>
      )}
    </>
  );
}
