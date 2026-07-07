import { useState } from "react";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader } from "./ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { ApiError } from "../../shared/api/client";
import {
  usePartnerApplications,
  useTriagePartnerApplication,
  applicationToView,
  type PartnerApplicationView,
} from "../marketing/api/usePartnerApplications";
import { AdminPartnerApplicationCard } from "./AdminPartnerApplicationCard";
import styles from "./AdminPartnerApplicationsPage.module.css";

/**
 * Admin triage of incoming partner applications. Sourced from
 * usePartnerApplications (GET /partner-applications — admin-only, 403s for a
 * non-admin), with approve/reject wired to useTriagePartnerApplication
 * (PATCH /partner-applications/:id). Approving surfaces the org on the public
 * partners page; rejecting closes it out with an optional note. The mutation
 * invalidates the queue + public listing; we also drop the row locally with a
 * short leave animation so the decision reads instantly in either mode.
 */
export function AdminPartnerApplicationsPage() {
  const { showToast } = useToast();
  const { data, isLoading, isError, error } = usePartnerApplications();
  const triage = useTriagePartnerApplication();
  const [leaving, setLeaving] = useState<Set<string>>(new Set());
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  function decide(
    view: PartnerApplicationView,
    action: "approve" | "reject",
    note?: string,
  ) {
    setLeaving((s) => new Set(s).add(view.id));
    window.setTimeout(() => {
      setResolved((s) => new Set(s).add(view.id));
    }, 320);
    triage.mutate(
      { id: view.id, action, ...(note ? { note } : {}) },
      {
        onError: () => {
          setLeaving((s) => {
            const next = new Set(s);
            next.delete(view.id);
            return next;
          });
          showToast("Could not save that decision — please try again", "error");
        },
      },
    );
    showToast(
      action === "approve"
        ? `${view.name} is now a partner`
        : `${view.name}'s application was set aside`,
      action === "approve" ? "success" : "info",
    );
  }

  const forbidden =
    isError && error instanceof ApiError && error.status === 403;

  return (
    <AdminShell
      title={
        <>
          Partner applications · <em>review</em>
        </>
      }
      breadcrumb={[{ label: "Admin", to: routes.admin }]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow="Partnerships"
          title={
            <>
              Who wants to <em>partner</em>.
            </>
          }
          sub="Organisations that applied to partner with QueerPulse. Read what they do, then approve them onto the public partners page or set the application aside — with a note they'll read."
        />
      </FadeIn>

      {isLoading ? (
        <div className={styles.grid}>
          {[0, 1].map((i) => (
            <div className={styles.card} key={i}>
              <SkeletonLine width="55%" height={18} />
              <SkeletonLine width="80%" />
              <SkeletonLine width="90%" height={40} />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className={styles.notice}>
          <p className={styles.noticeText}>
            {forbidden
              ? "This queue is for admins only."
              : "The queue couldn't load right now — please try again."}
          </p>
        </div>
      ) : (
        <Queue
          views={(data ?? [])
            .filter((a) => a.status === "pending" && !resolved.has(a.id))
            .map(applicationToView)}
          leaving={leaving}
          onApprove={(v) => decide(v, "approve")}
          onReject={(v, note) => decide(v, "reject", note)}
        />
      )}
    </AdminShell>
  );
}

/** The pending-application list, or a cleared-queue message. */
function Queue({
  views,
  leaving,
  onApprove,
  onReject,
}: {
  views: PartnerApplicationView[];
  leaving: Set<string>;
  onApprove: (v: PartnerApplicationView) => void;
  onReject: (v: PartnerApplicationView, note?: string) => void;
}) {
  if (views.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>
          Nothing waiting. Every application has had a decision.
        </p>
      </div>
    );
  }
  return (
    <>
      <p className={styles.intro}>
        These organisations asked to partner with us. Approving one lists it on
        the public partners page.
      </p>
      <div className={styles.grid}>
        {views.map((view, i) => (
          <FadeIn key={view.id} delay={i * 60}>
            <AdminPartnerApplicationCard
              view={view}
              leaving={leaving.has(view.id)}
              onApprove={() => onApprove(view)}
              onReject={(note) => onReject(view, note)}
            />
          </FadeIn>
        ))}
      </div>
    </>
  );
}
