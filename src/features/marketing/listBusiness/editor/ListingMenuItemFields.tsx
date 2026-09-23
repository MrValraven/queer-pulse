import { useId } from "react";
import { FiArrowDown, FiArrowUp, FiTrash2 } from "react-icons/fi";
import {
  ChipSelect,
  FormField,
  IconButton,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { DietaryIcon } from "../../DirectoryMenuDietaryIcon";
import {
  LISTING_MENU_DIETARY,
  menuItemProblem,
  MENU_ITEM_DESCRIPTION_MAX,
  MENU_ITEM_NAME_MAX,
  MENU_ITEM_PRICE_MAX,
  type ListingMenuDietary,
  type ListingMenuItemRow,
} from "../listingMenu.data";
import type { ListingForm } from "../useListingForm";
import styles from "./ListingMenu.module.css";

/**
 * One menu item: what it is, what it costs, an optional description and the
 * four dietary labels. Mirrors `ListingServiceRowFields`: a row with neither a
 * name nor a price is a blank line the owner has not filled in yet, never an
 * error and never sent.
 */
export function ListingMenuItemFields({
  form,
  sectionId,
  item,
  position,
  total,
}: {
  form: ListingForm;
  sectionId: string;
  item: ListingMenuItemRow;
  /** 1-based position, for the buttons' accessible names. */
  position: number;
  total: number;
}) {
  const { t } = useTranslation();
  const dietaryLabelId = useId();
  const problem = menuItemProblem(item);
  const itemName =
    item.name.trim() ||
    t("marketing:listBusiness.menu.unnamedItem", { position });

  return (
    <div className={styles.item}>
      <FormField
        className={styles.field}
        label={t("marketing:listBusiness.menu.itemNameLabel")}
        error={
          problem === "name"
            ? t("marketing:listBusiness.menu.itemNameError")
            : undefined
        }
      >
        <input
          type="text"
          maxLength={MENU_ITEM_NAME_MAX}
          placeholder={t("marketing:listBusiness.menu.itemNamePlaceholder")}
          value={item.name}
          onChange={(event) =>
            form.setMenuItemField(sectionId, item.id, {
              name: event.target.value,
            })
          }
        />
      </FormField>

      <FormField
        className={styles.field}
        label={t("marketing:listBusiness.menu.itemPriceLabel")}
        error={
          problem === "price"
            ? t("marketing:listBusiness.menu.itemPriceError")
            : undefined
        }
      >
        <input
          type="text"
          maxLength={MENU_ITEM_PRICE_MAX}
          placeholder={t("marketing:listBusiness.menu.itemPricePlaceholder")}
          value={item.price}
          onChange={(event) =>
            form.setMenuItemField(sectionId, item.id, {
              price: event.target.value,
            })
          }
        />
      </FormField>

      <div className={styles.controls}>
        <IconButton
          size="sm"
          aria-label={t("marketing:listBusiness.menu.moveItemUp", {
            name: itemName,
          })}
          disabled={position === 1}
          onClick={() => form.moveMenuItem(sectionId, item.id, -1)}
        >
          <FiArrowUp aria-hidden />
        </IconButton>
        <IconButton
          size="sm"
          aria-label={t("marketing:listBusiness.menu.moveItemDown", {
            name: itemName,
          })}
          disabled={position === total}
          onClick={() => form.moveMenuItem(sectionId, item.id, 1)}
        >
          <FiArrowDown aria-hidden />
        </IconButton>
        <IconButton
          size="sm"
          aria-label={t("marketing:listBusiness.menu.removeItem", {
            name: itemName,
          })}
          onClick={() => form.removeMenuItem(sectionId, item.id)}
        >
          <FiTrash2 aria-hidden />
        </IconButton>
      </div>

      <FormField
        className={[styles.field, styles.fullCell].join(" ")}
        label={t("marketing:listBusiness.menu.itemDescriptionLabel")}
        helper={t("marketing:listBusiness.menu.itemDescriptionHint")}
      >
        <input
          type="text"
          maxLength={MENU_ITEM_DESCRIPTION_MAX}
          placeholder={t(
            "marketing:listBusiness.menu.itemDescriptionPlaceholder",
          )}
          value={item.description}
          onChange={(event) =>
            form.setMenuItemField(sectionId, item.id, {
              description: event.target.value,
            })
          }
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
          selected={new Set(item.dietary)}
          onToggle={(value) =>
            form.toggleMenuItemDietary(
              sectionId,
              item.id,
              value as ListingMenuDietary,
            )
          }
        />
      </div>
    </div>
  );
}
