import { useSearchParams } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { FilterPageFrame } from "../../shared/components/filterPage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FollowedPersonasPanel } from "./FollowedPersonasPanel";
import { MadeTogetherStrip } from "./MadeTogetherStrip";
import { SubprofileCreditsClosing } from "./SubprofileCreditsClosing";
import { SubprofileCreditsHero } from "./SubprofileCreditsHero";
import { SubprofileDirectoryBrowse } from "./SubprofileDirectoryBrowse";
import {
  SubprofileDirectoryTabs,
  type SubprofileDirectoryView,
} from "./SubprofileDirectoryTabs";
import { useSubprofileDirectoryFilters } from "./useSubprofileDirectoryFilters";
import styles from "./SubprofileDirectoryPage.module.css";

/** The directory section's id. The hero's search scrolls here and focuses
 *  the section's visually hidden h2 (`SubprofileCreditsHeroSearch`). */
const DIRECTORY_SECTION_ID = "subprofile-directory";
const DIRECTORY_TITLE_ID = "subprofile-directory-title";

/**
 * The persona hub ("The Credits"): the plum hero with its search, quick
 * chips and wall of faces, the Made together strip, the directory section
 * with its two tabs, and the closing band.
 *
 * **Everyone** browses standalone (unlinked + published) personas across the
 * community, filterable by profession, tag, free-text search, availability
 * and the "At the table" facet, in the chosen sort. That body lives in
 * `SubprofileDirectoryBrowse`.
 *
 * **You follow** is the personal list of personas this member follows
 * (PRD-208), in `FollowedPersonasPanel`.
 *
 * WHY FOLLOWING LIVES HERE. It is a list of somebody else's personas, so it
 * does not belong on `/account/subprofiles`, which is the dashboard for the
 * personas you RUN. The hub is where personas are found, which makes the
 * empty state's "go and find some" the tab next door on the same page, and
 * it needs no new route: `/subprofiles` is already gated to
 * signed-in members in `authGate.ts`.
 *
 * The active tab is addressed by `?view=following`, so the choice survives a
 * refresh and a shared link, and a notification or an empty state elsewhere
 * can point straight at the list. Anything else in that param reads as the
 * default browse tab. Wrapped in `AppShell` (logged-in).
 *
 * The refine state lives here, above both the hero and the grid, because the
 * hero's search and quick chips drive the same query the grid, counts and
 * sidebar read. So the directory fetch also runs while You follow is on
 * screen; the hero above the tabs answers it either way.
 *
 * Refining from the hero while You follow is showing switches back to
 * Everyone (`onRefine`), since that is the list the refinement narrows.
 *
 * The hero and the strip render before the filter page frame, which wraps
 * only the directory section (its 1440px column and gutters); the closing
 * band follows the frame. Everyone brings the filters sidebar; You follow
 * renders in the same frame with no sidebar.
 */
export function SubprofileDirectoryPage() {
  const { t } = useTranslation();
  const directory = useSubprofileDirectoryFilters();
  const [searchParams, setSearchParams] = useSearchParams();
  const view: SubprofileDirectoryView =
    searchParams.get("view") === "following" ? "following" : "browse";

  // `replace` so tab switching never fills the back stack: Back should leave
  // the hub, the way it does on every other tabbed surface here.
  const setView = (next: SubprofileDirectoryView) => {
    const params = new URLSearchParams(searchParams);
    if (next === "following") {
      params.set("view", "following");
    } else {
      params.delete("view");
    }
    setSearchParams(params, { replace: true });
  };

  // The hero's search and chips edit state only the browse grid reads, so
  // touching them on You follow brings the member back to Everyone to see it.
  const onRefine = () => {
    if (view === "following") setView("browse");
  };

  return (
    <AppShell>
      {/* First child of main, so the shell paints the nav band plum. */}
      <SubprofileCreditsHero filters={directory} onRefine={onRefine} />
      <MadeTogetherStrip />

      <FilterPageFrame isBottomFlush>
        <section
          id={DIRECTORY_SECTION_ID}
          className={styles.directory}
          aria-labelledby={DIRECTORY_TITLE_ID}
        >
          {/* Hidden from sight, there for the outline and as the hero
              search's focus target. */}
          <h2 id={DIRECTORY_TITLE_ID} className="visuallyHidden" tabIndex={-1}>
            {t("subprofiles:directory.sectionTitle")}
          </h2>
          <div className={styles.tabsRow}>
            <SubprofileDirectoryTabs active={view} onChange={setView} />
          </div>

          <div
            className={view === "following" ? styles.followingPanel : undefined}
            id={`subprofile-directory-panel-${view}`}
            role="tabpanel"
            aria-labelledby={`subprofile-directory-tab-${view}`}
          >
            {view === "following" ? (
              <FollowedPersonasPanel onBrowse={() => setView("browse")} />
            ) : (
              <SubprofileDirectoryBrowse directory={directory} />
            )}
          </div>
        </section>
      </FilterPageFrame>

      <SubprofileCreditsClosing />
    </AppShell>
  );
}
