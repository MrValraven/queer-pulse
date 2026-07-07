import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { ApiError } from "../../shared/api/client";
import { routes } from "../../app/routeMap";
import { useOpportunity } from "./api/useOpportunity";
import { useOpportunities } from "./api/useOpportunities";
import { useSignups } from "./api/useSignups";
import {
  useCloseOpportunity,
  useSignup,
  useWithdrawSignup,
} from "./api/useOpportunityMutations";
import { VolunteerOpportunityMain } from "./VolunteerOpportunitySections";
import { VolunteerOpportunitySidebar } from "./VolunteerOpportunitySidebar";
import styles from "./VolunteerOpportunityPage.module.css";

/** Map a failed signup to member-facing copy, distinguishing the two 409 cases. */
function signupErrorMessage(e: unknown): string {
  if (e instanceof ApiError && e.status === 409) {
    if (/already/i.test(e.message)) {
      return "You've already signed up for this role.";
    }
    if (/full/i.test(e.message)) {
      return "This opportunity just filled up — every spot is taken.";
    }
    return "You've already signed up, or this opportunity is now full.";
  }
  return "Something went wrong sending your interest — please try again.";
}

export function VolunteerOpportunityPage() {
  const { slug } = useParams();
  const { data, isLoading } = useOpportunity(slug);
  const { data: list } = useOpportunities();

  // `null` means "defer to the server's mySignup"; set explicitly after a
  // successful signup / withdraw so the optimistic UI updates immediately.
  const [signedUp, setSignedUp] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signup = useSignup(slug ?? "");
  const withdraw = useWithdrawSignup(slug ?? "");
  const close = useCloseOpportunity(slug ?? "");
  const signups = useSignups(slug, data?.isPoster ?? false);

  const opp = data?.opportunity;
  const applied = signedUp ?? data?.mySignup ?? false;

  const apply = () => {
    setError(null);
    signup.mutate(
      {},
      {
        onSuccess: () => setSignedUp(true),
        onError: (e) => setError(signupErrorMessage(e)),
      },
    );
  };

  const doWithdraw = () => {
    withdraw.mutate(undefined, { onSuccess: () => setSignedUp(false) });
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className={styles.page} aria-busy />
      </PageShell>
    );
  }
  if (!opp) return <Navigate to={routes.volunteer} replace />;

  const alternatives = (list?.items ?? [])
    .filter((o) => o.slug !== opp.slug)
    .slice(0, 3);

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
            submitting={signup.isPending}
            apply={apply}
            withdraw={doWithdraw}
            withdrawing={withdraw.isPending}
            error={error}
            isFull={data?.isFull ?? false}
            isPoster={data?.isPoster ?? false}
            signups={signups.data ?? []}
            signupsLoading={signups.isLoading}
            onCloseOpportunity={() => close.mutate()}
            closing={close.isPending}
            closed={data?.status === "closed" || close.isSuccess}
            alternatives={alternatives}
          />
        </div>
      </div>
    </PageShell>
  );
}
