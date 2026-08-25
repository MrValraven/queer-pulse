import { useMemo, useState } from "react";
import { FiArrowRight, FiPlus, FiUsers } from "react-icons/fi";
import { PageHero, PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { useAuth } from "../../app/providers/authContext";
import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useOpportunities } from "./api/useOpportunities";
import { useMyOpportunities } from "./api/useMyOpportunities";
import { causeToLower } from "./api/volunteering.adapters";
import type { VolunteerCause } from "./volunteerOpportunities.types";
import type { Cause, Commit } from "./api/volunteering.api";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { CAUSE_FILTERS } from "./volunteerPage.data";
import { VolunteerRoles } from "./VolunteerRoles";
import s from "./VolunteerPage.module.css";

export function VolunteerPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const simLoading = useSimulatedLoad();
  const [filter, setFilter] = useState("all");

  // Translate the single chip group into the API's separate cause/commit params.
  // Demo mode ignores these (the client-side `visible` filter below still runs).
  const commit: Commit | undefined =
    filter === "low" || filter === "medium" ? filter : undefined;
  const cause: Cause | undefined = CAUSE_FILTERS.has(filter)
    ? causeToLower(filter as VolunteerCause)
    : undefined;

  // The hero CTA only appears once the viewer actually has applicants to
  // review: `/volunteering/mine` returns what they posted themselves plus
  // anything attributed to a community they own or moderate, which is exactly
  // the tier the dashboard serves. Skipped entirely for signed-out visitors
  // (the endpoint is member-guarded).
  const { data: myOpportunities = [] } = useMyOpportunities({
    enabled: Boolean(user),
  });
  const hasOpportunitiesToManage = myOpportunities.length > 0;

  const {
    items: opps,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useOpportunities({ cause, commit });
  const loading = simLoading || isLoading;

  const visible = useMemo(
    () =>
      opps.filter((o) => {
        if (filter === "all") return true;
        if (filter === "low" || filter === "medium") return o.commit === filter;
        return o.cause === filter;
      }),
    [opps, filter],
  );
  const pageTitle = t("marketing:volunteer.meta.title");
  const pageDescription = t("marketing:volunteer.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.volunteer },
        ])}
      />
      <PageHero
        eyebrow={t("marketing:volunteer.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:volunteer.hero.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:volunteer.hero.sub")}
      >
        <div className={s.note}>
          <span className={s.dot} /> {t("marketing:volunteer.hero.note")}
        </div>
        <div className={s.heroCta}>
          <Button to={routes.postVolunteer} variant="ghost-dark">
            <FiPlus aria-hidden /> {t("marketing:volunteer.hero.postCta")}
          </Button>
          {user && hasOpportunitiesToManage && (
            <Button to={routes.manageVolunteerApplicants} variant="ghost-dark">
              <FiUsers aria-hidden /> {t("marketing:volunteer.hero.manageCta")}
            </Button>
          )}
        </div>
      </PageHero>

      <section
        className={s.guideWrap}
        aria-label={t("marketing:volunteer.guide.eyebrow")}
      >
        <div className="wrap">
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
              <p className={s.guideBody}>
                {t("marketing:volunteer.guide.body")}
              </p>
            </div>
            <Button to={routes.activism} variant="ghost-dark">
              {t("marketing:volunteer.guide.cta")} <FiArrowRight aria-hidden />
            </Button>
          </div>
        </div>
      </section>

      <VolunteerRoles
        filter={filter}
        onFilterChange={setFilter}
        visibleOpportunities={visible}
        loadedCount={opps.length}
        isLoading={loading}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />

      <Outro
        title={
          <Translation
            i18nKey="marketing:volunteer.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:volunteer.outro.sub")}
      >
        <Button size="lg" to={routes.changemakers}>
          {t("marketing:volunteer.outro.cta")} <FiArrowRight aria-hidden />
        </Button>
      </Outro>
    </PageShell>
  );
}
