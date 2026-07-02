import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import {
  VOLUNTEER_OPPORTUNITIES,
  getOpportunity,
} from "./volunteerOpportunities";
import { VolunteerOpportunityMain } from "./VolunteerOpportunitySections";
import { VolunteerOpportunitySidebar } from "./VolunteerOpportunitySidebar";
import styles from "./VolunteerOpportunityPage.module.css";

export function VolunteerOpportunityPage() {
  const { slug } = useParams();
  const [applied, setApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const apply = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setApplied(true);
    }, 900);
  };

  const opp = getOpportunity(slug);
  if (!opp) return <Navigate to={routes.volunteer} replace />;

  const alternatives = VOLUNTEER_OPPORTUNITIES.filter(
    (o) => o.slug !== opp.slug,
  ).slice(0, 3);

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={routes.volunteer} className={styles.back}>
          ← All volunteer opportunities
        </Link>

        <header className={styles.head}>
          <div className={styles.eyebrow}>
            <span>{opp.eyebrow}</span>
            <span className={styles.sep}>·</span>
            <span className={styles.urgent}>{opp.urgent}</span>
          </div>
          <h1 className={styles.h1}>
            {opp.titleLead}
            <em>{opp.titleEm}</em>
          </h1>
          <p className={styles.sub}>{opp.sub}</p>
          <div className={styles.meta}>
            {opp.stats.map((stat, i) => (
              <span key={i}>
                {stat.value}
                {stat.label}
              </span>
            ))}
          </div>
        </header>

        <div className={styles.grid}>
          <VolunteerOpportunityMain opp={opp} />
          <VolunteerOpportunitySidebar
            opp={opp}
            applied={applied}
            submitting={submitting}
            apply={apply}
            alternatives={alternatives}
          />
        </div>
      </div>
    </PageShell>
  );
}
