import { useId } from "react";
import { Collapse } from "../../shared/components/ui/Collapse";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { partnersForView } from "./api/directoryPartners.adapters";
import { useDirectoryPartners } from "./api/useDirectoryPartners";
import { DirectoryPartnerCard } from "./DirectoryPartnerCard";
import type { DirectoryView } from "./useDirectoryFilters";
import { useRailFadeEdges } from "./useRailFadeEdges";
import styles from "./DirectoryPartnersRow.module.css";

/**
 * "Businesses we partner with": the admin-picked businesses at the top of the
 * directory results, as a rail of compact cards with each one's note. The
 * List view shows every partner that is showing, the Online view keeps the
 * ones that sell online, and the Map view leaves the row out. Each mount
 * serves one view (`shownOnView`): the List row sits above the results and
 * the Online row sits under the "Sold online" band. On any other view the
 * mount renders nothing, so the row swaps at once with its tab. It folds
 * away while a search or a filter is narrowing the results, and stays
 * closed while loading, after a failed read, or with no partner to show, so
 * the results below carry on as they are.
 */
export function DirectoryPartnersRow({
  view,
  shownOnView,
  hasActiveFilters,
  isPhone,
}: {
  view: DirectoryView;
  /** The one view this mount of the row shows on. Defaults to `view`, for a
   *  mount that only exists inside its own view. */
  shownOnView?: Exclude<DirectoryView, "map">;
  hasActiveFilters: boolean;
  /** Phones give the row the page's side padding, which the results column
   *  carries on desktop. */
  isPhone: boolean;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const { partners, isLoading } = useDirectoryPartners();
  const shownPartners = partnersForView(partners, view);
  const { railRef, fadeEdges } = useRailFadeEdges(shownPartners.length);
  const isOpen = !hasActiveFilters && !isLoading && shownPartners.length > 0;

  if (view !== (shownOnView ?? view)) return null;

  return (
    <Collapse isOpen={isOpen}>
      <section
        aria-labelledby={headingId}
        className={isPhone ? `${styles.row} wrap` : styles.row}
      >
        <h2 id={headingId} className={styles.title}>
          {t("marketing:directory.partners.title")}
        </h2>
        <p className={styles.sub}>{t("marketing:directory.partners.sub")}</p>
        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- list-style none drops the list role in Safari */}
        <ul
          ref={railRef}
          className={styles.rail}
          role="list"
          data-fade={fadeEdges}
        >
          {shownPartners.map(({ place, note }) => (
            <li key={place.slug} className={styles.item}>
              <DirectoryPartnerCard place={place} note={note} />
            </li>
          ))}
        </ul>
      </section>
    </Collapse>
  );
}
