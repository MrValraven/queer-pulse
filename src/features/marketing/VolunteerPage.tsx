import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiPlus } from "react-icons/fi";
import { PageHero, PageShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  FadeIn,
  Outro,
  SkeletonLine,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useOpportunities } from "./api/useOpportunities";
import { causeToLower } from "./api/volunteering.adapters";
import type { VolunteerCause } from "./volunteerOpportunities.types";
import type { Cause, Commit } from "./api/volunteering.api";
import { routes } from "../../app/routeMap";
import s from "./VolunteerPage.module.css";

const CAUSE_FILTERS = new Set<string>([
  "Rights",
  "Health",
  "Youth",
  "Housing",
  "Arts",
]);

const FILTERS = [
  { f: "all", label: "All opportunities" },
  { f: "low", label: "Low commitment" },
  { f: "medium", label: "Medium commitment" },
  { f: "Rights", label: "LGBTQ+ Rights" },
  { f: "Health", label: "Health & Wellbeing" },
  { f: "Youth", label: "Youth" },
  { f: "Housing", label: "Housing" },
  { f: "Arts", label: "Arts & Culture" },
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
  const simLoading = useSimulatedLoad();
  const [filter, setFilter] = useState("all");

  // Translate the single chip group into the API's separate cause/commit params.
  // Demo mode ignores these (the client-side `visible` filter below still runs).
  const commit: Commit | undefined =
    filter === "low" || filter === "medium" ? filter : undefined;
  const cause: Cause | undefined = CAUSE_FILTERS.has(filter)
    ? causeToLower(filter as VolunteerCause)
    : undefined;

  const { data, isLoading } = useOpportunities({ cause, commit });
  const opps = useMemo(() => data?.items ?? [], [data]);
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

  return (
    <PageShell>
      <PageHero
        eyebrow="Volunteer"
        title={
          <>
            Give your time to the <em>community</em> around you.
          </>
        }
        sub="You don't need to be an activist. You need two free hours and a willingness to show up. Below are organisations in Lisbon genuinely looking for people like you."
      >
        <div className={s.note}>
          <span className={s.dot} /> Every organisation below has been vetted by
          the QueerPulse community
        </div>
        <div className={s.heroCta}>
          <Button to={routes.postVolunteer} variant="ghost-dark">
            <FiPlus aria-hidden /> Post an opportunity
          </Button>
        </div>
      </PageHero>

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
                {f.label}
              </button>
            ))}
          </div>

          {!loading && visible.length === 0 ? (
            <EmptyState
              icon={<FiHeart />}
              title="No opportunities match those filters yet"
              description="Try widening your search — there are plenty of ways to give your time, and new roles are added often."
              action={{
                label: "Clear filters",
                onClick: () => setFilter("all"),
              }}
            />
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
                            style={{ background: o.bg, color: o.color }}
                          >
                            {o.av}
                          </span>
                          <div>
                            <div className={s.orgName}>{o.org}</div>
                            <div className={s.orgCause}>{o.cause}</div>
                          </div>
                        </div>
                        <div className={s.role}>{o.role}</div>
                        <p className={s.desc}>{o.desc}</p>
                        <div className={s.metaRow}>
                          <span
                            className={`${s.commit} ${o.commit === "low" ? s.commitGreen : s.commitAmber}`}
                          >
                            {o.commit === "low"
                              ? "Low commitment"
                              : "Medium commitment"}
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
                            Express interest →
                          </Link>
                        </div>
                      </div>
                    </FadeIn>
                  ))}
            </div>
          )}
        </div>
      </section>

      <Outro
        title={
          <>
            Want to connect <em>more deeply?</em>
          </>
        }
        sub="Find the change makers already working on the causes you care about."
      >
        <Button size="lg" to={routes.changemakers}>
          Meet the change makers →
        </Button>
      </Outro>
    </PageShell>
  );
}
