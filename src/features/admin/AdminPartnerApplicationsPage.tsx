import { useState } from "react";
import { Link } from "react-router-dom";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
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
import { AdminApprovedPartners } from "./AdminApprovedPartners";
import { QueueAssignmentFilter } from "./QueueAssignmentFilter";
import {
  assignedToParam,
  type QueueAssignmentScope,
} from "./queueAssignmentScope";
import { usePartnerApplicationAssignment } from "./usePartnerApplicationAssignment";
import { useAuth } from "../../app/providers/authContext";
import styles from "./AdminPartnerApplicationsPage.module.css";

/** A new Set with `id` present or absent, so the queue's two id sets are
 *  updated the same way in both directions. */
function idSetWith(
  current: Set<string>,
  id: string,
  shouldContain: boolean,
): Set<string> {
  const next = new Set(current);
  if (shouldContain) next.add(id);
  else next.delete(id);
  return next;
}

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
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { user } = useAuth();
  // OPS-04. Held here, beside the query it narrows, because the narrowing is
  // the query: the server decides which rows come back, so a claimed row that
  // fell off the end of the page cannot be silently missing from "mine".
  const [assignmentFilter, setAssignmentFilter] =
    useState<QueueAssignmentScope>("all");
  const assignedTo = assignedToParam(assignmentFilter);
  const { data, isLoading, isError, error } = usePartnerApplications(
    assignedTo ? { assignedTo } : {},
  );
  const assignment = usePartnerApplicationAssignment();
  const triage = useTriagePartnerApplication();
  const [leaving, setLeaving] = useState<Set<string>>(new Set());
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  function decide(
    view: PartnerApplicationView,
    action: "approve" | "reject",
    note?: string,
  ) {
    setLeaving((current) => idSetWith(current, view.id, true));
    // The row leaves on a short timer so the decision reads instantly. The
    // timer is held so a failed triage can cancel it: an application nothing
    // was written for must come back to the queue, and a resolved id that
    // landed after the failure would hide it for the rest of the session.
    const resolveTimer = window.setTimeout(() => {
      setResolved((current) => idSetWith(current, view.id, true));
    }, 320);
    triage.mutate(
      { id: view.id, action, ...(note ? { note } : {}) },
      {
        // Only the server deciding says the decision happened. Toasting
        // outside these callbacks announced an approval that may have 403ed
        // moments later, beside the error toast for the same click.
        onSuccess: () => {
          showToast(
            t(
              action === "approve"
                ? "admin:partners.approvedToast"
                : "admin:partners.rejectedToast",
              { name: view.name },
            ),
            action === "approve" ? "success" : "info",
          );
        },
        onError: () => {
          window.clearTimeout(resolveTimer);
          setLeaving((current) => idSetWith(current, view.id, false));
          setResolved((current) => idSetWith(current, view.id, false));
          showToast(t("admin:partners.errorToast"), "error");
        },
      },
    );
  }

  const forbidden =
    isError && error instanceof ApiError && error.status === 403;

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:partners.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:partners.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:partners.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:partners.header.sub")}
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
              ? t("admin:partners.forbidden")
              : t("admin:partners.loadError")}
          </p>
        </div>
      ) : (
        <>
          {/* Above the queue rather than inside it: "Assigned to me" can
              legitimately match nothing, and a control that vanished with the
              rows would leave a reviewer no way back to everything. */}
          <QueueAssignmentFilter
            value={assignmentFilter}
            onChange={setAssignmentFilter}
          />
          <Queue
            views={(data ?? [])
              .filter(
                (application) =>
                  application.status === "pending" &&
                  !resolved.has(application.id),
              )
              .map(applicationToView)
              // A claim taken this session is overlaid before the rows reach
              // the card, so the card and the filter read one row.
              .map(assignment.withAssignment)}
            leaving={leaving}
            isFiltered={assignmentFilter !== "all"}
            currentUserId={user?.id ?? null}
            isAssignmentBusy={assignment.isPending}
            onClaim={(view) => assignment.claim(view.id)}
            onRelease={(view) => assignment.release(view.id)}
            onApprove={(view) => decide(view, "approve")}
            onReject={(view, note) => decide(view, "reject", note)}
          />
        </>
      )}

      <AdminApprovedPartners />

      {/* PRD-266. The For Organisations page used to file its partner ask as an
          `inquiries` row with `kind: "partner"` — a second intake for the same
          request this queue exists to work. That page now hands the
          organisation to the real application form, so no new rows land there,
          but the ones already filed are still real asks from real
          organisations. They are not orphaned: they stay readable and
          triageable in the intake console, under Inquiries, filtered by the
          `partner` kind. This is the pointer from the queue that inherited the
          pipeline to the one that holds its history. */}
      <p className={styles.legacyInquiries}>
        <Translation
          i18nKey="admin:partners.legacyInquiries"
          components={{ a: <Link to={routes.adminIntakes} /> }}
        />
      </p>
    </AdminShell>
  );
}

/** The pending-application list, or a cleared-queue message. */
function Queue({
  views,
  leaving,
  isFiltered,
  currentUserId,
  isAssignmentBusy,
  onClaim,
  onRelease,
  onApprove,
  onReject,
}: {
  views: PartnerApplicationView[];
  leaving: Set<string>;
  /** True while the assignment filter is narrowing the queue, so an empty
   *  result says "nothing matches this filter" rather than the far stronger
   *  "the queue is clear", which would be a lie. */
  isFiltered: boolean;
  currentUserId: string | null;
  isAssignmentBusy: boolean;
  onClaim: (view: PartnerApplicationView) => void;
  onRelease: (view: PartnerApplicationView) => void;
  onApprove: (view: PartnerApplicationView) => void;
  onReject: (view: PartnerApplicationView, note?: string) => void;
}) {
  const { t } = useTranslation();
  if (views.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>
          {t(
            isFiltered
              ? "admin:partners.emptyFiltered"
              : "admin:partners.emptyText",
          )}
        </p>
      </div>
    );
  }
  return (
    <>
      <p className={styles.intro}>{t("admin:partners.intro")}</p>
      <div className={styles.grid}>
        {views.map((view, index) => (
          <FadeIn key={view.id} delay={index * 60}>
            <AdminPartnerApplicationCard
              view={view}
              leaving={leaving.has(view.id)}
              currentUserId={currentUserId}
              isAssignmentBusy={isAssignmentBusy}
              onClaim={() => onClaim(view)}
              onRelease={() => onRelease(view)}
              onApprove={() => onApprove(view)}
              onReject={(note) => onReject(view, note)}
            />
          </FadeIn>
        ))}
      </div>
    </>
  );
}
