import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiHeart, FiPlus, FiUsers } from "react-icons/fi";
import { PageHero, PageShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  FadeIn,
  Outro,
  SkeletonLine,
} from "../../shared/components/ui";
import { useAuth } from "../../app/providers/authContext";
import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useOpportunities } from "./api/useOpportunities";
import { causeToLower } from "./api/volunteering.adapters";
import type { VolunteerCause } from "./volunteerOpportunities.types";
import type { Cause, Commit } from "./api/volunteering.api";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import s from "./VolunteerPage.module.css";

const CAUSE_FILTERS = new Set<string>([
  "Rights",
  "Health",
  "Youth",
  "Housing",
  "Arts",
]);

const FILTERS = [
  { f: "all", labelKey: "marketing:volunteer.filter.all" },
  { f: "low", labelKey: "marketing:volunteer.filter.low" },
  { f: "medium", labelKey: "marketing:volunteer.filter.medium" },
  { f: "Rights", labelKey: "marketing:volunteer.filter.rights" },
  { f: "Health", labelKey: "marketing:volunteer.filter.health" },
  { f: "Youth", labelKey: "marketing:volunteer.filter.youth" },
  { f: "Housing", labelKey: "marketing:volunteer.filter.housing" },
  { f: "Arts", labelKey: "marketing:volunteer.filter.arts" },
];

function VolunteerCardSkeleton() {
  // Mirrors the real .card: org row (40px avatar + name/cause), role, desc, meta pills, skills, foot.
  return (
    <div className={s.card} aria-hidden>
      <div className={s.org}>
        <SkeletonLine
          width={40}
          height={40}
          style={{ borderRadius: 10, flex: "none" }}
        />
        <div style={{ flex: 1 }}>
          <SkeletonLine width="55%" height={14} />
          <SkeletonLine width="35%" height={12} style={{ marginTop: 5 }} />
        </div>
      </div>
      <SkeletonLine width="75%" height={19} />
      <div style={{ flex: 1 }}>
        <SkeletonLine width="100%" height={13.5} />
        <SkeletonLine width="85%" height={13.5} style={{ marginTop: 6 }} />
      </div>
      <div className={s.metaRow}>
        <SkeletonLine width={120} height={20} style={{ borderRadius: 6 }} />
        <SkeletonLine width={70} height={20} style={{ borderRadius: 6 }} />
      </div>
      <div className={s.cardFoot} style={{ borderTopColor: "transparent" }}>
        <SkeletonLine width={90} height={13} />
        <SkeletonLine width={110} height={30} style={{ borderRadius: 999 }} />
      </div>
    </div>
  );
}

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
          {user && (
            <Button to={routes.manageVolunteerApplicants} variant="ghost-dark">
              <FiUsers aria-hidden /> {t("marketing:volunteer.hero.manageCta")}
            </Button>
          )}
        </div>
      </PageHero>

      <section className={s.guideWrap} aria-label={t("marketing:volunteer.guide.eyebrow")}>
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
              <p className={s.guideBody}>{t("marketing:volunteer.guide.body")}</p>
            </div>
            <Button to={routes.activism} variant="ghost-dark">
              {t("marketing:volunteer.guide.cta")} <FiArrowRight aria-hidden />
            </Button>
          </div>
        </div>
      </section>

      <section className={s.body}>
        <div className="wrap">
          <div className={s.filters}>
            {FILTERS.map((f) => (
              <button
                type="button"
                key={f.f}
                className={[s.chip, filter === f.f && s.chipOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setFilter(f.f)}
              >
                {t(f.labelKey)}
              </button>
            ))}
          </div>

          {!loading && visible.length === 0 ? (
            opps.length === 0 ? (
              <EmptyState
                icon={<FiHeart />}
                title={t("marketing:volunteer.empty.noneTitle")}
                description={t("marketing:volunteer.empty.noneDescription")}
                action={{
                  label: t("marketing:volunteer.empty.noneCta"),
                  to: routes.postVolunteer,
                }}
              />
            ) : (
              <EmptyState
                icon={<FiHeart />}
                title={t("marketing:volunteer.empty.filteredTitle")}
                description={t("marketing:volunteer.empty.filteredDescription")}
                action={{
                  label: t("marketing:volunteer.empty.clearCta"),
                  onClick: () => setFilter("all"),
                }}
              />
            )
          ) : (
            <div className={s.grid}>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <VolunteerCardSkeleton key={i} />
                  ))
                : visible.map((o, i) => (
                    <FadeIn
                      key={o.slug}
                      delay={Math.min(i, 8) * 60}
                      style={{ height: "100%" }}
                    >
                      <div className={s.card} style={{ height: "100%" }}>
                        <div className={s.org}>
                          <span
                            className={s.orgAv}
                            style={{ background: o.background, color: o.color }}
                          >
                            {o.avatar}
                          </span>
                          <div>
                            <div className={s.orgName}>{o.org}</div>
                            <div className={s.orgCause}>{o.cause}</div>
                          </div>
                        </div>
                        <div className={s.role}>{o.role}</div>
                        <p className={s.desc}>{o.description}</p>
                        <div className={s.metaRow}>
                          <span
                            className={`${s.commit} ${o.commit === "low" ? s.commitGreen : s.commitAmber}`}
                          >
                            {o.commit === "low"
                              ? t("marketing:volunteer.card.commitLow")
                              : t("marketing:volunteer.card.commitMedium")}
                          </span>
                          <span className={s.metaPill}>{o.location}</span>
                        </div>
                        <div className={s.skills}>
                          {o.skills.map((sk) => (
                            <span key={sk} className={s.skill}>
                              #{sk}
                            </span>
                          ))}
                        </div>
                        <div className={s.cardFoot}>
                          <span className={s.time}>{o.time}</span>
                          <Link
                            className={s.express}
                            to={`${routes.volunteer}/opportunity/${o.slug}`}
                          >
                            {t("marketing:volunteer.card.expressInterest")}{" "}
                            <FiArrowRight aria-hidden />
                          </Link>
                        </div>
                      </div>
                    </FadeIn>
                  ))}
            </div>
          )}

          {hasNextPage && (
            <div className={s.loadMore}>
              <Button
                type="button"
                variant="ghost"
                disabled={isFetchingNextPage}
                onClick={fetchNextPage}
              >
                {isFetchingNextPage
                  ? t("marketing:volunteer.loadingMore")
                  : t("marketing:volunteer.loadMoreCta")}
              </Button>
            </div>
          )}
        </div>
      </section>

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
