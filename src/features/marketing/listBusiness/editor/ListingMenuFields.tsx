import { FiPlus } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import {
  emptyMenuDraft,
  MAX_LISTING_MENU_ITEMS,
  MAX_LISTING_MENU_SECTIONS,
  menuItemCount,
} from "../listingMenu.data";
import type { ListingForm } from "../useListingForm";
import { ListingMenuFileField } from "./ListingMenuFileField";
import { ListingMenuSectionFields } from "./ListingMenuSectionFields";
import styles from "./ListingMenu.module.css";

/**
 * The menu editor: titled sections of priced items, then the optional file
 * and link. Nothing here is required. A bar can save with only a PDF, only a
 * link, or nothing, and a half-filled row says which half is missing.
 *
 * Carries `ANCHOR.services`, the same anchor the services list uses, since
 * only one of the two renders at a time.
 */
export function ListingMenuFields({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const menu = form.draft.menu ?? emptyMenuDraft();
  const isAtSectionCeiling = menu.sections.length >= MAX_LISTING_MENU_SECTIONS;
  const isAtItemCeiling = menuItemCount(menu) >= MAX_LISTING_MENU_ITEMS;

  const addHint = isAtItemCeiling
    ? t("marketing:listBusiness.menu.itemCeilingHint", {
        count: MAX_LISTING_MENU_ITEMS,
      })
    : isAtSectionCeiling
      ? t("marketing:listBusiness.menu.sectionCeilingHint", {
          count: MAX_LISTING_MENU_SECTIONS,
        })
      : t("marketing:listBusiness.menu.addSectionHint");

  return (
    <div id={ANCHOR.services}>
      <p className={styles.intro}>{t("marketing:listBusiness.menu.intro")}</p>

      {menu.sections.length === 0 ? (
        <p className={styles.empty}>{t("marketing:listBusiness.menu.empty")}</p>
      ) : (
        <div className={styles.sections}>
          {menu.sections.map((section, index) => (
            <ListingMenuSectionFields
              key={section.id}
              form={form}
              section={section}
              position={index + 1}
              total={menu.sections.length}
              isAtItemCeiling={isAtItemCeiling}
            />
          ))}
        </div>
      )}

      <div className={styles.addRow}>
        <Button
          variant="ghost"
          onClick={form.addMenuSection}
          disabled={isAtSectionCeiling || isAtItemCeiling}
        >
          <FiPlus aria-hidden />{" "}
          {t("marketing:listBusiness.menu.addSectionCta")}
        </Button>
        <span className={styles.addHint}>{addHint}</span>
      </div>

      <ListingMenuFileField form={form} />
    </div>
  );
}
