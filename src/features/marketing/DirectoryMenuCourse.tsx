import { useTranslation } from "../../shared/i18n/useTranslation";
import { DietaryIcon } from "./DirectoryMenuDietaryIcon";
import type { ListingMenuSection } from "./listBusiness/listingMenu.data";
import styles from "./DirectoryMenu.module.css";

/** One titled part of the menu and its priced items. */
export function DirectoryMenuCourse({
  section,
  headingId,
}: {
  section: ListingMenuSection;
  headingId: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.course}>
      <h3 id={headingId} className={styles.courseTitle} tabIndex={-1}>
        {section.title}
      </h3>
      <ul className={styles.list}>
        {section.items.map((item, index) => (
          // Index-keyed: read-only and never reordered on screen.
          <li key={index} className={styles.row}>
            <span className={styles.body}>
              <span className={styles.name}>{item.name}</span>
              {item.dietary.length > 0 && (
                <span className={styles.chips}>
                  {item.dietary.map((label) => (
                    <span key={label} className={styles.chip}>
                      <DietaryIcon label={label} />
                      {t(`marketing:listBusiness.menu.dietary.${label}`)}
                    </span>
                  ))}
                </span>
              )}
              {item.description !== "" && (
                <span className={styles.description}>{item.description}</span>
              )}
            </span>
            <span className={styles.price}>{item.price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
