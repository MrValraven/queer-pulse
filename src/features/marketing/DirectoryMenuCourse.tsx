import { useTranslation } from "../../shared/i18n/useTranslation";
import { DirectoryMenuItemRow } from "./DirectoryMenuItemRow";
import { isWideMenuSection } from "./isWideMenuSection";
import type {
  ListingMenuItem,
  ListingMenuSection,
  ListingMenuSubsection,
} from "./listBusiness/listingMenu.data";
import type { ListingMenuCurrency } from "./listBusiness/listingMenuPrice.data";
import styles from "./DirectoryMenu.module.css";

/** Whether any item of the sub-section shows both a glass and a bottle price,
 *  which is when the "Glass / bottle" legend helps. */
function hasGlassAndBottle(items: ListingMenuItem[]): boolean {
  return items.some(
    (item) =>
      (item.priceGlass ?? "").trim() !== "" &&
      (item.priceBottle ?? "").trim() !== "",
  );
}

function DirectoryMenuSubcourse({
  subsection,
  currency,
}: {
  subsection: ListingMenuSubsection;
  currency: ListingMenuCurrency;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.subcourse}>
      <h4 className={styles.subcourseTitle}>{subsection.title}</h4>
      {hasGlassAndBottle(subsection.items) && (
        <p className={styles.legend}>
          {t("marketing:directory.detail.menu.glassBottleLegend")}
        </p>
      )}
      <ul className={styles.list}>
        {subsection.items.map((item, index) => (
          // Index-keyed: read-only and never reordered on screen.
          <DirectoryMenuItemRow key={index} item={item} currency={currency} />
        ))}
      </ul>
    </div>
  );
}

/** One titled part of the menu: its direct items, then its sub-sections. */
export function DirectoryMenuCourse({
  section,
  currency,
  headingId,
}: {
  section: ListingMenuSection;
  currency: ListingMenuCurrency;
  headingId: string;
}) {
  const courseClassName = isWideMenuSection(section)
    ? `${styles.course} ${styles.courseWide}`
    : styles.course;
  return (
    <div className={courseClassName}>
      <h3 id={headingId} className={styles.courseTitle} tabIndex={-1}>
        {section.title}
      </h3>
      {section.items.length > 0 && (
        <ul className={styles.list}>
          {section.items.map((item, index) => (
            // Index-keyed: read-only and never reordered on screen.
            <DirectoryMenuItemRow key={index} item={item} currency={currency} />
          ))}
        </ul>
      )}
      {section.subsections.map((subsection, index) => (
        <DirectoryMenuSubcourse
          key={index}
          subsection={subsection}
          currency={currency}
        />
      ))}
    </div>
  );
}
