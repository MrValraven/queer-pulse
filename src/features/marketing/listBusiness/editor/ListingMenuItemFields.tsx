import { FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  menuItemProblem,
  MENU_ITEM_NAME_MAX,
  type ListingMenuItemRow,
} from "../listingMenu.data";
import {
  isLegacyMenuPrice,
  type ListingMenuCurrency,
} from "../listingMenuPrice.data";
import type { ListingForm } from "../useListingForm";
import { ListingMenuItemControls } from "./ListingMenuItemControls";
import { ListingMenuItemExtras } from "./ListingMenuItemExtras";
import { ListingMenuPriceInput } from "./ListingMenuPriceInput";
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
  currency,
  position,
  total,
}: {
  form: ListingForm;
  sectionId: string;
  item: ListingMenuItemRow;
  /** The whole menu's currency, shown beside the price. */
  currency: ListingMenuCurrency;
  /** 1-based position, for the buttons' accessible names. */
  position: number;
  total: number;
}) {
  const { t } = useTranslation();
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
        labelAside={currency}
        helper={
          isLegacyMenuPrice(item.price)
            ? t("marketing:listBusiness.menu.itemPriceLegacyHint", {
                price: item.price,
              })
            : undefined
        }
        error={
          problem === "price"
            ? t("marketing:listBusiness.menu.itemPriceError")
            : problem === "priceFormat"
              ? t("marketing:listBusiness.menu.itemPriceFormatError")
              : undefined
        }
      >
        <ListingMenuPriceInput
          value={item.price}
          onValueChange={(price) =>
            form.setMenuItemField(sectionId, item.id, { price })
          }
          currency={currency}
          placeholder={t("marketing:listBusiness.menu.itemPricePlaceholder")}
        />
      </FormField>

      <ListingMenuItemControls
        itemName={itemName}
        position={position}
        total={total}
        onMoveUp={() => form.moveMenuItem(sectionId, item.id, -1)}
        onMoveDown={() => form.moveMenuItem(sectionId, item.id, 1)}
        onRemove={() => form.removeMenuItem(sectionId, item.id)}
      />

      <ListingMenuItemExtras
        description={item.description}
        dietary={item.dietary}
        onDescriptionChange={(description) =>
          form.setMenuItemField(sectionId, item.id, { description })
        }
        onToggleDietary={(label) =>
          form.toggleMenuItemDietary(sectionId, item.id, label)
        }
      />
    </div>
  );
}
