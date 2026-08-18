import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { ApiError } from "../../shared/api/client";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { routes } from "../../app/routeMap";
import { useOpportunity } from "./api/useOpportunity";
import { useOpportunities } from "./api/useOpportunities";
import { useOrganizationOptions } from "./api/useOrganizationOptions";
import { useSignups } from "./api/useSignups";
import {
  applyEditDraft,
  draftToUpdateDto,
  opportunityToEditDraft,
} from "./api/volunteering.adapters";
import {
  useCloseOpportunity,
  useSignup,
  useUpdateOpportunity,
  useWithdrawSignup,
} from "./api/useOpportunityMutations";
import { EditOpportunityModal } from "./EditOpportunityModal";
import { VolunteerOpportunityMain } from "./VolunteerOpportunitySections";
import { VolunteerOpportunitySidebar } from "./VolunteerOpportunitySidebar";
import type { VolunteerOpportunity } from "./volunteerOpportunities";
import type { OpportunityEditDraft } from "./volunteerOpportunities.types";
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
  const { showToast } = useToast();
  const { slug } = useParams();
  const { data, isLoading } = useOpportunity(slug);
  const { items: allOpportunities } = useOpportunities();
  const organizationOptions = useOrganizationOptions();

  // `null` means "defer to the server's mySignup"; set explicitly after a
  // successful signup / withdraw so the optimistic UI updates immediately.
  const [signedUp, setSignedUp] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  // The poster's last saved edit, applied over the query's data so the page
  // reflects a save immediately (load-bearing in demo mode — see
  // `applyEditDraft`). Guarded by slug so a stale edit from a previously
  // viewed opportunity can never bleed into this one.
  const [override, setOverride] = useState<VolunteerOpportunity | null>(null);

  const signup = useSignup(slug ?? "");
  const withdraw = useWithdrawSignup(slug ?? "");
  const close = useCloseOpportunity(slug ?? "");
  const update = useUpdateOpportunity(slug ?? "");
  const signups = useSignups(slug, data?.isPoster ?? false);

  const baseOpp = data?.opportunity;
  const opp =
    override && baseOpp && override.slug === baseOpp.slug
      ? override
      : baseOpp;
  const applied = signedUp ?? data?.mySignup ?? false;

  const saveEdit = (draft: OpportunityEditDraft) => {
    if (!opp) return;
    setOverride(applyEditDraft(opp, draft, organizationOptions));
    update.mutate(draftToUpdateDto(draft), {
      onSuccess: () =>
        showToast(t("marketing:postOpportunity.edit.successToast"), "success"),
      onError: () => {
        setOverride(null);
        showToast(t("marketing:postOpportunity.edit.errorToast"), "error");
      },
    });
  };

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
            isPoster={data?.isPoster ?? false}
            signups={signups.data ?? []}
            signupsLoading={signups.isLoading}
            onCloseOpportunity={() => close.mutate()}
            closing={close.isPending}
            closed={data?.status === "closed" || close.isSuccess}
            onEdit={() => setEditOpen(true)}
            alternatives={alternatives}
          />
        </div>
      </div>

      {editOpen && (
        <EditOpportunityModal
          initial={opportunityToEditDraft(opp)}
          onClose={() => setEditOpen(false)}
          onSave={saveEdit}
        />
      )}
    </PageShell>
  );
}
