import { FiPlus } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  MAX_LISTING_MENU_ITEMS,
  MAX_LISTING_MENU_SUBSECTIONS,
  type ListingMenuSectionRow,
} from "../listingMenu.data";
import type { ListingMenuCurrency } from "../listingMenuPrice.data";
import type { ListingForm } from "../useListingForm";
import { ListingMenuItemFields } from "./ListingMenuItemFields";
import { ListingMenuSectionHead } from "./ListingMenuSectionHead";
import { ListingMenuSubsectionList } from "./ListingMenuSubsectionList";
import styles from "./ListingMenu.module.css";
import subsectionStyles from "./ListingMenuSubsection.module.css";

/**
 * One titled part of the menu: its direct items, then its sub-sections (Red,
 * White and Rosé under Wines). The head owns the title and removal; each
 * sub-section owns its own title, items and removal.
 */
export function ListingMenuSectionFields({
  form,
  section,
  currency,
  position,
  total,
  isAtItemCeiling,
}: {
  form: ListingForm;
  section: ListingMenuSectionRow;
  currency: ListingMenuCurrency;
  /** 1-based, for the buttons' accessible names. */
  position: number;
  total: number;
  isAtItemCeiling: boolean;
}) {
  const { t } = useTranslation();
  const sectionName =
    section.title.trim() ||
    t("marketing:listBusiness.menu.unnamedSection", { position });
  const isAtSubsectionCeiling =
    section.subsections.length >= MAX_LISTING_MENU_SUBSECTIONS;
  const subsectionHint = isAtItemCeiling
    ? t("marketing:listBusiness.menu.itemCeilingHint", {
        count: MAX_LISTING_MENU_ITEMS,
      })
    : isAtSubsectionCeiling
      ? t("marketing:listBusiness.menu.subsectionCeilingHint", {
          count: MAX_LISTING_MENU_SUBSECTIONS,
        })
      : t("marketing:listBusiness.menu.subsectionsHint");

  return (
    <section className={styles.section} aria-label={sectionName}>
      <ListingMenuSectionHead
        form={form}
        section={section}
        sectionName={sectionName}
        position={position}
        total={total}
      />

      <div className={styles.items}>
        {section.items.map((item, index) => (
          <ListingMenuItemFields
            key={item.id}
            form={form}
            sectionId={section.id}
            item={item}
            currency={currency}
            position={index + 1}
            total={section.items.length}
          />
        ))}
      </div>
      <p className={styles.dietaryHint}>
        {t("marketing:listBusiness.menu.dietaryHint")}
      </p>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => form.addMenuItem(section.id)}
        disabled={isAtItemCeiling}
      >
        <FiPlus aria-hidden /> {t("marketing:listBusiness.menu.addItemCta")}
      </Button>

      <ListingMenuSubsectionList
        form={form}
        section={section}
        currency={currency}
        isAtItemCeiling={isAtItemCeiling}
      />
      <div className={subsectionStyles.addRow}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => form.addMenuSubsection(section.id)}
          disabled={isAtSubsectionCeiling || isAtItemCeiling}
        >
          <FiPlus aria-hidden />{" "}
          {t("marketing:listBusiness.menu.addSubsectionCta")}
        </Button>
        <span className={styles.addHint}>{subsectionHint}</span>
      </div>
    </section>
  );
}
