import { AnimatePresence } from "motion/react";
import { CollapseListItem } from "../../../../shared/components/ui";
import type { ListingMenuSectionRow } from "../listingMenu.data";
import type { ListingMenuCurrency } from "../listingMenuPrice.data";
import type { ListingForm } from "../useListingForm";
import { ListingMenuSubsectionFields } from "./ListingMenuSubsectionFields";
import styles from "./ListingMenuSubsection.module.css";

/**
 * The sub-sections of one menu section. Each card grows in when added and
 * folds away when removed, so the cards below glide into place.
 */
export function ListingMenuSubsectionList({
  form,
  section,
  currency,
  isAtItemCeiling,
}: {
  form: ListingForm;
  section: ListingMenuSectionRow;
  currency: ListingMenuCurrency;
  isAtItemCeiling: boolean;
}) {
  return (
    <ul className={styles.subsections}>
      <AnimatePresence initial={false}>
        {section.subsections.map((subsection, index) => (
          <CollapseListItem key={subsection.id}>
            <ListingMenuSubsectionFields
              form={form}
              sectionId={section.id}
              subsection={subsection}
              currency={currency}
              position={index + 1}
              total={section.subsections.length}
              isAtItemCeiling={isAtItemCeiling}
            />
          </CollapseListItem>
        ))}
      </AnimatePresence>
    </ul>
  );
}
