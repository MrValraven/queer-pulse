import { FiArrowDown, FiArrowUp, FiTrash2, FiX } from "react-icons/fi";
import { FormField, IconButton } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ListingPhotoField } from "../ListingPhotoField";
import {
  shopItemProblem,
  shopPhotoDisplayUrl,
  SHOP_ITEM_ALT_MAX,
  SHOP_ITEM_LINK_MAX,
  SHOP_ITEM_NAME_MAX,
  SHOP_ITEM_PRICE_MAX,
  type ListingShopItemRow,
} from "../listingShop.data";
import type { ListingForm } from "../useListingForm";
import styles from "./ListingServices.module.css";
import shopStyles from "./ListingShop.module.css";

/**
 * One shop item: its name, its price in the owner's own words, an optional
 * link to buy that one thing, and an optional photo with its description.
 *
 * Laid out like a service row (name and price side by side, the reorder and
 * remove buttons at the end), so the two lists read as one family. The row
 * keeps its own grid so a long name gets the space; in a narrow pane the
 * buttons move up to a header line at the top right. A blank
 * item never errors and is never sent; a started one needs a name, and a link
 * that is there has to be a working web address.
 */
export function ListingShopItemFields({
  form,
  item,
  position,
  total,
}: {
  form: ListingForm;
  item: ListingShopItemRow;
  /** 1-based position, for the buttons' accessible names. */
  position: number;
  total: number;
}) {
  const { t } = useTranslation();
  const problem = shopItemProblem(item);
  // An item's own name says WHICH item a button acts on; an unnamed item
  // falls back to its position.
  const itemName =
    item.name.trim() ||
    t("marketing:listBusiness.shop.unnamedRow", { position });

  return (
    <div className={shopStyles.item}>
      <FormField
        className={styles.field}
        label={t("marketing:listBusiness.shop.nameLabel")}
        error={
          problem === "name"
            ? t("marketing:listBusiness.shop.nameError")
            : undefined
        }
      >
        <input
          type="text"
          maxLength={SHOP_ITEM_NAME_MAX}
          placeholder={t("marketing:listBusiness.shop.namePlaceholder")}
          value={item.name}
          onChange={(event) =>
            form.setShopItemField(item.id, { name: event.target.value })
          }
        />
      </FormField>

      <FormField
        className={styles.field}
        label={t("marketing:listBusiness.shop.priceLabel")}
      >
        <input
          type="text"
          maxLength={SHOP_ITEM_PRICE_MAX}
          placeholder={t("marketing:listBusiness.shop.pricePlaceholder")}
          value={item.price}
          onChange={(event) =>
            form.setShopItemField(item.id, { price: event.target.value })
          }
        />
      </FormField>

      <div className={shopStyles.controls}>
        <IconButton
          aria-label={t("marketing:listBusiness.services.moveUp", {
            name: itemName,
          })}
          disabled={position === 1}
          onClick={() => form.moveShopItem(item.id, -1)}
        >
          <FiArrowUp aria-hidden />
        </IconButton>
        <IconButton
          aria-label={t("marketing:listBusiness.services.moveDown", {
            name: itemName,
          })}
          disabled={position === total}
          onClick={() => form.moveShopItem(item.id, 1)}
        >
          <FiArrowDown aria-hidden />
        </IconButton>
        <IconButton
          aria-label={t("marketing:listBusiness.services.remove", {
            name: itemName,
          })}
          onClick={() => form.removeShopItem(item.id)}
        >
          <FiTrash2 aria-hidden />
        </IconButton>
      </div>

      <FormField
        className={[styles.field, styles.noteCell].join(" ")}
        label={t("marketing:listBusiness.shop.linkLabel")}
        helper={t("marketing:listBusiness.shop.linkHint")}
        error={
          problem === "link"
            ? t("marketing:listBusiness.social.website.err")
            : undefined
        }
      >
        <input
          type="url"
          inputMode="url"
          maxLength={SHOP_ITEM_LINK_MAX}
          placeholder={t("marketing:listBusiness.shop.linkPlaceholder")}
          value={item.link}
          onChange={(event) =>
            form.setShopItemField(item.id, { link: event.target.value })
          }
        />
      </FormField>

      <ShopItemPhotoCell form={form} item={item} itemName={itemName} />
    </div>
  );
}

/** The item's photo, picked through the listing photo uploader, and the
 *  description that appears once a photo is there. A photo picked this
 *  session paints from its blob preview, which never reaches the draft. */
function ShopItemPhotoCell({
  form,
  item,
  itemName,
}: {
  form: ListingForm;
  item: ListingShopItemRow;
  /** The item's name, or its position while it has none. */
  itemName: string;
}) {
  const { t } = useTranslation();
  const persistedDisplayUrl = item.photo
    ? (shopPhotoDisplayUrl(item.photo.image) ?? "")
    : "";

  return (
    <div className={shopStyles.photoCell}>
      <ListingPhotoField
        height={110}
        placeholder={t("marketing:listBusiness.shop.photoPlaceholder")}
        displayValue={form.shopPhotoPreviews[item.id] || persistedDisplayUrl}
        persistedValue={item.photo?.image ?? ""}
        isRejectedByServer={false}
        accessibleName={t("marketing:listBusiness.shop.photoLabelNamed", {
          name: itemName,
        })}
        onResolved={(persist, preview) =>
          form.setShopItemPhoto(item.id, persist, preview)
        }
        onRemove={() => form.removeShopItemPhoto(item.id)}
        removeIcon={<FiX size={14} aria-hidden />}
      />
      {item.photo && (
        <FormField
          className={styles.field}
          label={t("marketing:listBusiness.shop.altLabel")}
        >
          <input
            type="text"
            maxLength={SHOP_ITEM_ALT_MAX}
            placeholder={t("marketing:listBusiness.step4.altPlaceholder")}
            value={item.photo.alt}
            onChange={(event) =>
              form.setShopItemPhotoAlt(item.id, event.target.value)
            }
          />
        </FormField>
      )}
    </div>
  );
}
