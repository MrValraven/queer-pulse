import { useSearchParams } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import {
  FilterPageFrame,
  useFilterPageState,
} from "../../shared/components/filterPage";
import { PageMeta } from "../../shared/seo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CommunitiesHubHeader } from "./CommunitiesHubHeader";
import { CommunitiesHome } from "./CommunitiesHomePage";
import { CommunitiesDiscover } from "./CommunitiesPage";
import { CommunityGateModal } from "./CommunityGateModal";
import {
  COMMUNITIES_FILTER_SECTION_KEYS,
  COMMUNITIES_PANEL_STORAGE_KEY,
  COMMUNITIES_SECTIONS_STORAGE_KEY,
} from "./communitiesFilterSections";
import { useCommunitiesTopTab } from "./useCommunitiesTopTab";
import { useDiscoverCommunities } from "./useDiscoverCommunities";

/**
 * Merged `/communities` surface, on the members directory's filter-page
 * layout. A top-level "My communities | Discover" switch in the header sits
 * above two reused bodies: the member hub (CommunitiesHome) and the directory
 * (CommunitiesDiscover), each the filter sidebar beside its results. The
 * active tab lives in `?tab=`, defaulting smartly to the hub when the member
 * belongs to a community and the directory when they don't. Both surfaces are
 * auth-gated, so there is no signed-out case.
 *
 * The grid's filter state and the sidebar's view state are both owned here,
 * one level above the tab bodies, so switching tabs keeps the search, the
 * filters, the open sections and the shown or hidden sidebar, and re-runs the
 * filters against the other pool.
 */
export function CommunitiesHubPage() {
  const { t } = useTranslation();
  const { tab, setTab, resolving } = useCommunitiesTopTab();
  // While the smart default is still resolving, show the hub (its data hook
  // owns an honest loading state), so Discover never flashes in first.
  const active = resolving ? "mine" : tab;
  const discover = useDiscoverCommunities(active);
  const filterPage = useFilterPageState({
    panelStorageKey: COMMUNITIES_PANEL_STORAGE_KEY,
    sectionsStorageKey: COMMUNITIES_SECTIONS_STORAGE_KEY,
    sectionKeys: COMMUNITIES_FILTER_SECTION_KEYS,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  // `/community/:slug` redirects here with `?gate=<slug>` for a community the
  // viewer is not on the roster of and whose tier is not `public`. The grid
  // renders underneath as it always does, so dismissing the card leaves them
  // somewhere they can act, with a door still open.
  const gateSlug = searchParams.get("gate");

  return (
    <AppShell>
      <PageMeta
        title={t("communities:seo.hub.title")}
        description={t("communities:seo.hub.description")}
      />
      <FilterPageFrame>
        <CommunitiesHubHeader active={active} onChange={setTab} />
        <div
          role="tabpanel"
          id={`communities-top-panel-${active}`}
          aria-labelledby={`communities-top-tab-${active}`}
          tabIndex={0}
        >
          {active === "mine" ? (
            <CommunitiesHome discover={discover} filterPage={filterPage} />
          ) : (
            <CommunitiesDiscover discover={discover} filterPage={filterPage} />
          )}
        </div>
      </FilterPageFrame>

      {gateSlug && (
        <CommunityGateModal
          slug={gateSlug}
          onClose={() =>
            setSearchParams(
              (previous) => {
                const nextParams = new URLSearchParams(previous);
                nextParams.delete("gate");
                return nextParams;
              },
              { replace: true },
            )
          }
        />
      )}
    </AppShell>
  );
}
