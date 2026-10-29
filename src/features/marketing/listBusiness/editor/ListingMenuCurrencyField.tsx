import { FormField, Select } from "../../../../shared/components/ui";
import { intlLocale } from "../../../../shared/i18n/locale";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  menuCurrencyOptions,
  type ListingMenuCurrency,
} from "../listingMenuPrice.data";
import type { ListingForm } from "../useListingForm";
import styles from "./ListingMenu.module.css";

/**
 * The one currency every price on the menu uses. It sits above the sections
 * so the owner picks it before typing the first price.
 */
export function ListingMenuCurrencyField({
  form,
  currency,
}: {
  form: ListingForm;
  currency: ListingMenuCurrency;
}) {
  const { t, language } = useTranslation();
  const options = menuCurrencyOptions(intlLocale(language));

  return (
    <FormField
      className={styles.currencyRow}
      label={t("marketing:listBusiness.menu.currencyLabel")}
      helper={t("marketing:listBusiness.menu.currencyHint")}
    >
      <Select
        size="md"
        searchable={false}
        options={options.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
        value={currency}
        onChange={(value) => {
          const picked = options.find((option) => option.value === value);
          if (picked) form.setMenuCurrency(picked.value);
        }}
      />
    </FormField>
  );
}
