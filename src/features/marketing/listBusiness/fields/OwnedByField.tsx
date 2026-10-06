import { FiShield } from "react-icons/fi";
import { CheckLine, FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import {
  LISTING_OWNED_BY,
  normalizeOwnedBy,
  toggleOwnedBy,
} from "../listingOwnedBy.data";
import type { ListingForm } from "../useListingForm";
import styles from "../ListBusinessPage.module.css";

/**
 * "Who owns and runs it?": the owner's own tags (women, trans, non-binary,
 * BIPOC), any combination or none.
 *
 * OWNER ONLY, and rendered only inside `OwnerFields`, which a suggestion, a
 * staff-authored draft and a co-manager never see. Saying one of these
 * publicly can out the owner, so nobody else may say it for them.
 *
 * The note under the choices states the one thing an owner must know before
 * ticking: the tags stay public whatever they chose for their name, and on a
 * small business a tag alone can point to them.
 */
export function OwnedByField({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, set } = form;
  const ownedBy = normalizeOwnedBy(draft.ownedBy);

  return (
    <FormField
      className={styles.lbField}
      id={ANCHOR.ownedBy}
      label={t("marketing:listBusiness.step4.ownedByLabel")}
      helper={t("marketing:listBusiness.step4.ownedByHelper")}
    >
      <div
        role="group"
        aria-label={t("marketing:listBusiness.step4.ownedByAria")}
        className={styles.ownedByChecks}
      >
        {LISTING_OWNED_BY.map((value) => (
          <CheckLine
            key={value}
            checked={ownedBy.includes(value)}
            onChange={() => set({ ownedBy: toggleOwnedBy(ownedBy, value) })}
            title={t(`marketing:listBusiness.step4.ownedBy.${value}.title`)}
            sub={t(`marketing:listBusiness.step4.ownedBy.${value}.sub`)}
          />
        ))}
        <div className={styles.consent}>
          <FiShield size={17} aria-hidden />
          <p>{t("marketing:listBusiness.step4.ownedByPublicNote")}</p>
        </div>
      </div>
    </FormField>
  );
}
