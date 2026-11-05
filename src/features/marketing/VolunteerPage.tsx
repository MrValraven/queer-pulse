import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import {
  FilterPageFrame,
  FilterPageLayout,
  FiltersSheet,
  useFilterPageState,
} from "../../shared/components/filterPage";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useAuth } from "../../app/providers/authContext";
import { useSimulatedLoad } from "../../shared/hooks";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyOpportunities } from "./api/useMyOpportunities";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { VolunteerHeader } from "./VolunteerHeader";
import { VolunteerFilterSidebar } from "./VolunteerFilterSidebar";
import { VolunteerRoles } from "./VolunteerRoles";
import { VolunteerContributionCard } from "./VolunteerContributionCard";
import { VolunteerExplainerModal } from "./VolunteerExplainerModal";
import { useVolunteerFilters } from "./useVolunteerFilters";
import {
  VOLUNTEER_FILTER_SECTION_KEYS,
  VOLUNTEER_PANEL_STORAGE_KEY,
  VOLUNTEER_SECTIONS_STORAGE_KEY,
} from "./volunteerFilterSections";
import s from "./VolunteerPage.module.css";

export function VolunteerPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { user, loggedIn } = useAuth();
  const simLoading = useSimulatedLoad();
  // PRD-454. Posting and the change makers are member surfaces, so a
  // signed-out visitor gets the explainer from those CTAs; a member keeps the
  // direct links.
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const openExplainer = () => setIsExplainerOpen(true);

  // View-only preferences (sidebar shown, which sections are open) persist
  // across visits apart from the filter values, so hiding the panel keeps
  // every selection. Below the mobile cutover the sidebar folds into a sheet.
  const filterPage = useFilterPageState({
    panelStorageKey: VOLUNTEER_PANEL_STORAGE_KEY,
    sectionsStorageKey: VOLUNTEER_SECTIONS_STORAGE_KEY,
    sectionKeys: VOLUNTEER_FILTER_SECTION_KEYS,
  });
  const filters = useVolunteerFilters();
  const { opportunities } = filters;
  const isLoading = simLoading || opportunities.isLoading;

  // The "Manage applicants" action only appears once the viewer actually has
  // applicants to review: `/volunteering/mine` returns what they posted
  // themselves plus anything attributed to a community they own or moderate,
  // which is exactly the tier the dashboard serves. Skipped entirely for
  // signed-out visitors (the endpoint is member-guarded).
  const { data: myOpportunities = [] } = useMyOpportunities({
    enabled: Boolean(user),
  });
  const hasOpportunitiesToManage = Boolean(user) && myOpportunities.length > 0;

  const pageTitle = t("marketing:volunteer.meta.title");
  const pageDescription = t("marketing:volunteer.meta.description");

  const renderSidebar = (isInSheet: boolean) => (
    <VolunteerFilterSidebar
      isInSheet={isInSheet}
      commitment={filters.commitment}
      onCommitmentChange={filters.setCommitment}
      cause={filters.cause}
      onCauseChange={filters.setCause}
      commitmentCounts={filters.commitmentCounts}
      causeCounts={filters.causeCounts}
      appliedCount={filters.chips.length}
      onClearAll={filters.clearAll}
      sectionsOpen={filterPage.sectionsOpen}
      onToggleSection={filterPage.toggleSection}
    />
  );

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.volunteer },
        ])}
      />
      <FilterPageFrame>
        <VolunteerHeader
          isLoggedIn={loggedIn}
          hasOpportunitiesToManage={hasOpportunitiesToManage}
          onOpenExplainer={openExplainer}
        />

        <FilterPageLayout
          isMobile={filterPage.isMobile}
          isPanelOpen={filterPage.isPanelOpen}
          sidebar={renderSidebar(false)}
        >
          <VolunteerRoles
            // Signed-in only: `GET /volunteering/me/contribution` is behind
            // `ActiveMemberGuard` and would 401 for a visitor, the same
            // reason `useMyOpportunities` is gated above. The card sits at
            // the foot of the column, under the grid, and renders nothing
            // when the member has nothing confirmed and nothing pending.
            contribution={user ? <VolunteerContributionCard /> : undefined}
            resultCount={filters.resultCount}
            isMobile={filterPage.isMobile}
            isPanelOpen={filterPage.isPanelOpen}
            onTogglePanel={filterPage.togglePanel}
            onOpenSheet={filterPage.openSheet}
            chips={filters.chips}
            visibleOpportunities={filters.visible}
            loadedCount={opportunities.items.length}
            isLoading={isLoading}
            isError={opportunities.isError}
            onRetry={opportunities.refetch}
            hasNextPage={opportunities.hasNextPage}
            isFetchingNextPage={opportunities.isFetchingNextPage}
            onLoadMore={opportunities.fetchNextPage}
            onClearFilters={filters.clearAll}
            onPostSignedOut={loggedIn ? undefined : openExplainer}
          />
        </FilterPageLayout>

        <VolunteerGuideBand />
      </FilterPageFrame>

      <Outro
        title={
          <Translation
            i18nKey="marketing:volunteer.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:volunteer.outro.sub")}
      >
        {loggedIn ? (
          <Button size="lg" to={routes.changemakers}>
            {t("marketing:volunteer.outro.cta")} <FiArrowRight aria-hidden />
          </Button>
        ) : (
          <Button size="lg" onClick={openExplainer}>
            {t("marketing:volunteer.outro.cta")} <FiArrowRight aria-hidden />
          </Button>
        )}
      </Outro>

      {filterPage.isMobile && filterPage.isSheetOpen && (
        <FiltersSheet
          title={t("marketing:volunteer.filtersSheetLabel")}
          showResultsLabel={
            // While the board loads, or after a first-page failure, there is
            // no count to promise, so the button reads plain "Filters". The
            // count row behind the sheet holds its number back the same way.
            isLoading || filters.hasNothingLoadedError ? (
              t("shared:filterPage.filtersCta")
            ) : (
              <Translation
                i18nKey="marketing:volunteer.showResultsCta"
                values={{ count: filters.resultCount }}
                slots={{
                  count: (
                    <RollingNumber
                      value={fmt.number(filters.resultCount)}
                      numericValue={filters.resultCount}
                    />
                  ),
                }}
              />
            )
          }
          onClose={filterPage.closeSheet}
        >
          {renderSidebar(true)}
        </FiltersSheet>
      )}
      {isExplainerOpen && (
        <VolunteerExplainerModal onClose={() => setIsExplainerOpen(false)} />
      )}
    </PageShell>
  );
}

/** The "do more than a shift" band under the roles, pointing at the
 *  activism guide. A quiet paper card, so the plum Outro below stays the only
 *  plum moment on the page. */
function VolunteerGuideBand() {
  const { t } = useTranslation();
  return (
    <section
      className={s.guideWrap}
      aria-label={t("marketing:volunteer.guide.eyebrow")}
    >
      <div className={s.guide}>
        <div className={s.guideText}>
          <span className={s.guideEyebrow}>
            {t("marketing:volunteer.guide.eyebrow")}
          </span>
          <h2 className={s.guideTitle}>
            <Translation
              i18nKey="marketing:volunteer.guide.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={s.guideBody}>{t("marketing:volunteer.guide.body")}</p>
        </div>
        <Button to={routes.activism} variant="ghost">
          {t("marketing:volunteer.guide.cta")} <FiArrowRight aria-hidden />
        </Button>
      </div>
    </section>
  );
}
