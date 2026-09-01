import {
  ActiveFilters,
  RefineToggle,
  SearchInput,
} from "../../shared/components/ui";
import { useRefineDrawer } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SubprofileDirectoryRefinePanel } from "./SubprofileDirectoryRefinePanel";
import { useSubprofileDirectoryActiveFilters } from "./useSubprofileDirectoryActiveFilters";
import type { SubprofileDirectoryFilters } from "./useSubprofileDirectoryFilters";
import styles from "./SubprofileDirectoryPage.module.css";

/**
 * The directory's whole control surface: search and Refine on one row, the
 * drawer beneath, then the chips saying what is currently narrowing the grid.
 *
 * This replaces four stacked bands that stood permanently open above the first
 * persona: thirteen page-family chips, an "N crafts to browse" note, the search
 * field, and a tag row. The families were the deeper problem (a page theme
 * derived from the profession, which the create flow says nobody picks
 * directly), so professions took their place and everything but search moved
 * behind the toggle, the same shape `/communities` uses.
 *
 * The "N crafts to browse" line went with them. Unrefined it counted a facet
 * rather than the results; once something IS narrowing, the count rides the
 * chip row below, beside the chips that explain it.
 */
export function SubprofileDirectoryToolbar({
  directory,
  isCountKnown,
}: {
  directory: SubprofileDirectoryFilters;
  /** False while the fetch is in flight or failed, so a count of 0 is never
   *  shown as an answer to a question that has not been answered yet. */
  isCountKnown: boolean;
}) {
  const { t } = useTranslation();
  const refine = useRefineDrawer("qp.subprofiles.refineOpen");
  const activeFilters = useSubprofileDirectoryActiveFilters(directory);

  // The search term shows in the field itself, so the badge counts only what
  // the shut drawer is actually hiding.
  const hiddenFilterCount =
    directory.kinds.length +
    directory.activeTags.length +
    (directory.openToCollabs ? 1 : 0);

  const resultCount = directory.visibleCards.length;

  // `professionGroups` is built from every fetched persona, so an empty one is
  // an empty directory: refining nothing is an affordance for nothing, and the
  // page's own empty state says more than a search box would. Kept while the
  // first fetch is still in flight (the pool isn't known to be empty yet) and
  // kept whenever a term is typed, so a search can always be cleared.
  const isPoolEmpty = directory.professionGroups.length === 0;
  const isShowingControls =
    !isCountKnown || !isPoolEmpty || directory.hasActiveRefinement;

  return (
    <>
      {isShowingControls && (
        <div className={styles.bar}>
          <SearchInput
            className={styles.search}
            value={directory.query}
            onChange={directory.setQuery}
            placeholder={t("subprofiles:directory.searchPlaceholder")}
            ariaLabel={t("subprofiles:directory.searchAria")}
          />
          <RefineToggle
            {...refine.toggleProps}
            activeCount={hiddenFilterCount}
            className={styles.refineToggle}
          />
        </div>
      )}

      {/* Gated on the same condition as its toggle: the drawer's open state is
          remembered per device, so a member who left it open and then hit an
          empty directory would otherwise face a panel with no way to shut it. */}
      {isShowingControls && (
        <SubprofileDirectoryRefinePanel
          directory={directory}
          panelProps={refine.panelProps}
        />
      )}

      <ActiveFilters
        filters={activeFilters}
        onClearFilters={directory.onClearFilters}
        trailing={
          isCountKnown
            ? t("subprofiles:directory.resultCount", { count: resultCount })
            : null
        }
      />

      {/* The visible count only appears once something is narrowing the grid,
          so this is what tells a screen reader how many personas a refinement
          left behind. */}
      <p className="visuallyHidden" aria-live="polite">
        {isCountKnown && directory.hasActiveRefinement
          ? t("subprofiles:directory.resultCount", { count: resultCount })
          : ""}
      </p>
    </>
  );
}
