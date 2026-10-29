import { useId } from "react";
import { ChipSelect, FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { DietaryIcon } from "../../DirectoryMenuDietaryIcon";
import {
  LISTING_MENU_DIETARY,
  MENU_ITEM_DESCRIPTION_MAX,
  type ListingMenuDietary,
} from "../listingMenu.data";
import styles from "./ListingMenu.module.css";

/**
 * The description line and the four dietary chips under a menu item. Shared by
 * direct items and sub-section items, which differ only in their price cells.
 */
export function ListingMenuItemExtras({
  description,
  dietary,
  onDescriptionChange,
  onToggleDietary,
  detailPlaceholder,
}: {
  description: string;
  dietary: ListingMenuDietary[];
  onDescriptionChange: (nextDescription: string) => void;
  onToggleDietary: (label: ListingMenuDietary) => void;
  /** Example text for the detail line. Defaults to the coffee example. */
  detailPlaceholder?: string;
}) {
  const { t } = useTranslation();
  const dietaryLabelId = useId();

  return (
    <>
      <FormField
        className={[styles.field, styles.fullCell].join(" ")}
        label={t("marketing:listBusiness.menu.itemDescriptionLabel")}
        helper={t("marketing:listBusiness.menu.itemDescriptionHint")}
      >
        <input
          type="text"
          maxLength={MENU_ITEM_DESCRIPTION_MAX}
          placeholder={
            detailPlaceholder ??
            t("marketing:listBusiness.menu.itemDescriptionPlaceholder")
          }
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
      </FormField>

      <div className={styles.dietaryCell}>
        <span className={styles.dietaryLabel} id={dietaryLabelId}>
          {t("marketing:listBusiness.menu.dietaryLabel")}
        </span>
        <ChipSelect
          labelledBy={dietaryLabelId}
          options={LISTING_MENU_DIETARY.map((label) => ({
            value: label,
            label: (
              <>
                <DietaryIcon label={label} />{" "}
                {t(`marketing:listBusiness.menu.dietary.${label}`)}
              </>
            ),
          }))}
          selected={new Set(dietary)}
          onToggle={(value) => onToggleDietary(value as ListingMenuDietary)}
        />
      </div>
    </>
  );
}
