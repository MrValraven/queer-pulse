import { useState } from "react";
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
  const { t } = useTranslation();
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
          showToast(t("admin:partners.errorToast"), "error");
        },
      },
    );
    showToast(
      t(
        action === "approve"
          ? "admin:partners.approvedToast"
          : "admin:partners.rejectedToast",
        { name: view.name },
      ),
      action === "approve" ? "success" : "info",
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
        <Queue
          views={(data ?? [])
            .filter((a) => a.status === "pending" && !resolved.has(a.id))
            .map(applicationToView)}
          leaving={leaving}
          onApprove={(v) => decide(v, "approve")}
          onReject={(v, note) => decide(v, "reject", note)}
        />
      )}

      <AdminApprovedPartners />
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
  const { t } = useTranslation();
  if (views.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>{t("admin:partners.emptyText")}</p>
      </div>
    );
  }
  return (
    <>
      <p className={styles.intro}>{t("admin:partners.intro")}</p>
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
