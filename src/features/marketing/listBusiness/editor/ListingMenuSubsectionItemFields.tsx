import { useId } from "react";
import { Collapse, FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  menuItemProblem,
  MENU_ITEM_NAME_MAX,
  type ListingMenuItemRow,
} from "../listingMenu.data";
import {
  menuPriceKind,
  type ListingMenuCurrency,
} from "../listingMenuPrice.data";
import type { ListingForm } from "../useListingForm";
import { ListingMenuItemControls } from "./ListingMenuItemControls";
import { ListingMenuItemExtras } from "./ListingMenuItemExtras";
import { ListingMenuPriceInput } from "./ListingMenuPriceInput";
import menuStyles from "./ListingMenu.module.css";
import styles from "./ListingMenuSubsection.module.css";

/**
 * One item inside a sub-section, such as a wine: its name, then an optional
 * price per glass, a visible "/" and an optional price per bottle, all on one
 * line. Below sit the description and dietary chips, shared with direct items.
 * A row with nothing typed is a blank line that raises no error and is not sent.
 */
export function ListingMenuSubsectionItemFields({
  form,
  sectionId,
  subsectionId,
  item,
  currency,
  position,
  total,
}: {
  form: ListingForm;
  sectionId: string;
  subsectionId: string;
  item: ListingMenuItemRow;
  currency: ListingMenuCurrency;
  /** 1-based among the sub-section's items, for the accessible names. */
  position: number;
  total: number;
}) {
  const { t } = useTranslation();
  const glassErrorId = useId();
  const bottleErrorId = useId();
  const problem = menuItemProblem(item, "subsection");
  const itemName =
    item.name.trim() ||
    t("marketing:listBusiness.menu.unnamedItem", { position });
  // Each price is judged on its own, so both messages show when both are bad.
  const isGlassInvalid =
    problem !== null && menuPriceKind(item.priceGlass ?? "") === "incomplete";
  const isBottleInvalid =
    problem !== null && menuPriceKind(item.priceBottle ?? "") === "incomplete";

  function setField(
    patch: Partial<Omit<ListingMenuItemRow, "id" | "dietary">>,
  ) {
    form.setSubsectionItemField(sectionId, subsectionId, item.id, patch);
  }

  return (
    <div className={styles.subItem}>
      <FormField
        className={menuStyles.field}
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
          placeholder={t(
            "marketing:listBusiness.menu.subsectionItemNamePlaceholder",
          )}
          value={item.name}
          onChange={(event) => setField({ name: event.target.value })}
        />
      </FormField>

      <div
        className={styles.subPrices}
        role="group"
        aria-label={t("marketing:listBusiness.menu.priceGlassBottleGroup")}
      >
        <FormField
          className={menuStyles.field}
          label={t("marketing:listBusiness.menu.itemPriceGlassLabel")}
        >
          <ListingMenuPriceInput
            value={item.priceGlass ?? ""}
            onValueChange={(priceGlass) => setField({ priceGlass })}
            currency={currency}
            isCompact
            placeholder={t(
              "marketing:listBusiness.menu.itemPriceGlassPlaceholder",
            )}
            aria-invalid={isGlassInvalid ? true : undefined}
            aria-describedby={isGlassInvalid ? glassErrorId : undefined}
          />
        </FormField>
        <span className={styles.priceDivider} aria-hidden>
          /
        </span>
        <FormField
          className={menuStyles.field}
          label={t("marketing:listBusiness.menu.itemPriceBottleLabel")}
        >
          <ListingMenuPriceInput
            value={item.priceBottle ?? ""}
            onValueChange={(priceBottle) => setField({ priceBottle })}
            currency={currency}
            isCompact
            placeholder={t(
              "marketing:listBusiness.menu.itemPriceBottlePlaceholder",
            )}
            aria-invalid={isBottleInvalid ? true : undefined}
            aria-describedby={isBottleInvalid ? bottleErrorId : undefined}
          />
        </FormField>
        <span className={styles.priceCurrencyNote}>{currency}</span>
        <Collapse
          isOpen={isGlassInvalid || isBottleInvalid}
          className={styles.priceErrorRow}
        >
          {isGlassInvalid && (
            <p className={styles.priceError} id={glassErrorId} role="alert">
              {t("marketing:listBusiness.menu.itemPriceGlassFormatError")}
            </p>
          )}
          {isBottleInvalid && (
            <p className={styles.priceError} id={bottleErrorId} role="alert">
              {t("marketing:listBusiness.menu.itemPriceBottleFormatError")}
            </p>
          )}
        </Collapse>
      </div>

      <div className={styles.alignedControls}>
        <ListingMenuItemControls
          itemName={itemName}
          position={position}
          total={total}
          onMoveUp={() =>
            form.moveSubsectionItem(sectionId, subsectionId, item.id, -1)
          }
          onMoveDown={() =>
            form.moveSubsectionItem(sectionId, subsectionId, item.id, 1)
          }
          onRemove={() =>
            form.removeSubsectionItem(sectionId, subsectionId, item.id)
          }
        />
      </div>

      <ListingMenuItemExtras
        description={item.description}
        detailPlaceholder={t(
          "marketing:listBusiness.menu.subsectionItemDetailPlaceholder",
        )}
        dietary={item.dietary}
        onDescriptionChange={(description) => setField({ description })}
        onToggleDietary={(label) =>
          form.toggleSubsectionItemDietary(
            sectionId,
            subsectionId,
            item.id,
            label,
          )
        }
      />
    </div>
  );
}
