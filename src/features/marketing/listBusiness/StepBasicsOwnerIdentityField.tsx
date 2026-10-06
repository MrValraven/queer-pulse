import { ChipSelect, FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ANCHOR } from "./listBusiness.data";
import {
  OWNER_IDENTITIES,
  normalizeOwnerIdentities,
} from "./listingOwnerIdentities.data";
import type { ListingForm } from "./useListingForm";
import styles from "./ListBusinessPage.module.css";

/**
 * The optional "who runs it" tags, right under the ownership badge they
 * extend. Offered for both badge kinds: an allied place can be women-owned
 * too. Always optional.
 */
export function StepBasicsOwnerIdentityField({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, set } = form;
  const chosen = normalizeOwnerIdentities(draft.ownerIdentities);
  const label = t("marketing:listBusiness.step1.ownerIdentityLabel");

  const toggle = (value: string) => {
    const next = chosen.includes(value as (typeof chosen)[number])
      ? chosen.filter((slug) => slug !== value)
      : [...chosen, value];
    set({ ownerIdentities: normalizeOwnerIdentities(next) });
  };

  return (
    <FormField
      className={styles.lbField}
      id={ANCHOR.ownerIdentities}
      label={label}
      helper={t("marketing:listBusiness.step1.ownerIdentityHelper")}
    >
      <ChipSelect
        label={label}
        options={OWNER_IDENTITIES.map((identity) => ({
          value: identity.slug,
          label: t(identity.labelKey),
        }))}
        selected={new Set(chosen)}
        onToggle={toggle}
      />
    </FormField>
  );
}
