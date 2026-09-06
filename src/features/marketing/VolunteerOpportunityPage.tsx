import { useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { ApiError } from "../../shared/api/client";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { useAuth } from "../../app/providers/authContext";
import { routes } from "../../app/routeMap";
import { PageMeta } from "../../shared/seo";
import { ReportSubjectControl } from "../safety/ReportSubjectControl";
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
import type { VolunteerOpportunity } from "./volunteerOpportunities";
import styles from "./VolunteerOpportunityPage.module.css";

/** Map a failed signup to member-facing copy, distinguishing the two 409 cases. */
function signupErrorMessage(e: unknown, t: TFunction): string {
  if (e instanceof ApiError && e.status === 409) {
    if (/already/i.test(e.message)) {
      return t("marketing:volunteerDetail.error.alreadySignedUp");
    }
    if (/full/i.test(e.message)) {
      return t("marketing:volunteerDetail.error.full");
    }
    return t("marketing:volunteerDetail.error.alreadyOrFull");
  }
  return t("marketing:volunteerDetail.error.generic");
}

export function VolunteerOpportunityPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();
  // The opportunity read is public (PRD-260), so this page renders in full for
  // a logged-out visitor; the session only decides whether the sidebar offers
  // to apply or offers to sign in.
  const { loggedIn } = useAuth();
  const { data, isLoading } = useOpportunity(slug);
  const { items: allOpportunities } = useOpportunities();

  // `null` means "defer to the server's mySignup"; set explicitly after a
  // successful signup / withdraw so the optimistic UI updates immediately.
  const [signedUp, setSignedUp] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signup = useSignup(slug ?? "");
  const withdraw = useWithdrawSignup(slug ?? "");
  const close = useCloseOpportunity(slug ?? "");
  const signups = useSignups(slug, data?.canReviewApplicants ?? false);

  const baseOpp = data?.opportunity;
  // A freshly-saved edit arrives via router state (EditOpportunityFlow) so
  // the page reflects it instantly — load-bearing in demo mode, which has
  // no server to refetch from at all. Guarded by slug so a stale edit from
  // a previously viewed opportunity can never bleed into this one.
  const editedOpportunity = (
    location.state as { editedOpportunity?: VolunteerOpportunity } | null
  )?.editedOpportunity;
  const opp =
    editedOpportunity && baseOpp && editedOpportunity.slug === baseOpp.slug
      ? editedOpportunity
      : baseOpp;
  const applied = signedUp ?? data?.mySignup ?? false;

  const apply = (note: string) => {
    setError(null);
    signup.mutate(
      { note: note || undefined },
      {
        onSuccess: () => setSignedUp(true),
        onError: (e) => setError(signupErrorMessage(e, t)),
      },
    );
  };

  const doWithdraw = () => {
    withdraw.mutate(undefined, { onSuccess: () => setSignedUp(false) });
  };

  if (isLoading) {
    return (
      <PageShell>
        {/* Transient skeleton: name the tab honestly and keep the placeholder
            out of the index until the real opportunity resolves. */}
        <PageMeta
          title={t("marketing:volunteerDetail.meta.loadingTitle")}
          noIndex
        />
        <div className={styles.page} aria-busy />
      </PageShell>
    );
  }
  if (!opp) return <Navigate to={routes.volunteer} replace />;

  // First page only — this sidebar shows at most three suggestions, so it never
  // needs to pull further pages.
  const alternatives = allOpportunities
    .filter((o) => o.slug !== opp.slug)
    .slice(0, 3);

  return (
    <PageShell>
      <PageMeta
        title={t("marketing:volunteerDetail.meta.title", {
          role: opp.role,
          org: opp.org,
        })}
        description={opp.description}
        canonical={`${routes.volunteer}/opportunity/${opp.slug}`}
      />
      <div className={styles.page}>
        <Link to={routes.volunteer} className={styles.back}>
          <FiArrowLeft aria-hidden /> {t("marketing:volunteerDetail.backCta")}
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
            canReviewApplicants={data?.canReviewApplicants ?? false}
            canEditOpportunity={data?.canEditOpportunity ?? false}
            poster={data?.poster ?? null}
            isSignedIn={loggedIn}
            signups={signups.data ?? []}
            signupsLoading={signups.isLoading}
            onCloseOpportunity={() => close.mutate()}
            closing={close.isPending}
            closed={data?.status === "closed" || close.isSuccess}
            onEdit={() =>
              void navigate(routes.editVolunteer.replace(":slug", opp.slug))
            }
            alternatives={alternatives}
          />
        </div>

        {/* PRD-283. Until the `volunteering` subject existed there was no way
            to report an opportunity at all: a scam posting or a host org that
            is not affirming reached moderation only as free text through the
            Contact form, with no subject a queue could cluster or resolve
            against. `job` was the nearest-looking neighbour and the wrong one
            (a `job` subject is a slug in the PAID-work directory, a different
            table), so a moderator acting on one would have been acting on
            nothing.

            `subjectId` is the opportunity's SLUG, the same handle
            `GET /volunteering/:slug` and this page's own route already use,
            and the handle the backend's subject resolver looks it up by.

            Ungated, like every other `ReportSubjectControl`: the opportunity
            read is public (PRD-260) and `POST /reports` is public (PRD-280),
            so somebody who spots a scam posting before signing in can still
            raise it. */}
        <ReportSubjectControl
          subjectType="volunteering"
          subjectId={opp.slug}
          subjectName={opp.role}
          label={t("marketing:volunteerDetail.report.cta")}
          ariaLabel={t("marketing:volunteerDetail.report.ariaLabel", {
            role: opp.role,
            org: opp.org,
          })}
        />
      </div>
    </PageShell>
  );
}
