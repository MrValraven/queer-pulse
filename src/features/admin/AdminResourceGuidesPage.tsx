import { useState } from "react";
import {
  Button,
  FadeIn,
  Select,
  SkeletonLine,
} from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ApiError } from "../../shared/api/client";
import { routes } from "../../app/routeMap";
import { AdminPageHeader } from "./ui";
import { useAdminResourceGuides } from "./api/useAdminResourceGuides";
import { AdminResourceGuideRows } from "./AdminResourceGuideRows";
import { AdminResourceGuideEditor } from "./AdminResourceGuideEditor";
import { AdminResourceGuideReviewModal } from "./AdminResourceGuideReviewModal";
import type {
  AdminResourceGuideDTO,
  AdminResourceSort,
} from "./api/adminResourceGuides.api";
import styles from "./AdminResourceGuidesPage.module.css";

const SORTS: AdminResourceSort[] = ["reviewDue", "title", "updated"];

/**
 * The resource guide console (`/admin/resource-guides`) — CON-08 and CON-09.
 *
 * Every guide on the platform, sorted stalest first by default so the page
 * opens on the question it was built to answer: which of these has nobody
 * looked at? These are the highest-stakes pages QueerPulse publishes — trans
 * healthcare pathways, harm reduction, sexual health, crisis lines, legal aid
 * — and until now editing one meant an engineer with a deploy, and a wrong
 * phone number stayed wrong until they had time.
 *
 * Demo mode shows an honestly empty list (see `adminResourceGuides.data.ts`):
 * fabricating health guidance with invented review dates would teach a
 * reviewer exactly the wrong thing about what this panel holds.
 */
export function AdminResourceGuidesPage() {
  const { t } = useTranslation();
  const [sort, setSort] = useState<AdminResourceSort>("reviewDue");
  const { data, isLoading, isError, error } = useAdminResourceGuides({ sort });
  const [editing, setEditing] = useState<AdminResourceGuideDTO | null>(null);
  const [reviewing, setReviewing] = useState<AdminResourceGuideDTO | null>(
    null,
  );

  const isForbidden =
    isError && error instanceof ApiError && error.status === 403;
  const guides = data ?? [];
  const staleCount = guides.filter(
    (guide) => guide.lastReviewedOn === null,
  ).length;

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminResourceGuides.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:adminResourceGuides.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:adminResourceGuides.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminResourceGuides.header.sub")}
          actions={
            <Select
              aria-label={t("admin:adminResourceGuides.sortLabel")}
              value={sort}
              options={SORTS.map((value) => ({
                value,
                label: t(`admin:adminResourceGuides.sort.${value}`),
              }))}
              onChange={(value) =>
                setSort((value ?? "reviewDue") as AdminResourceSort)
              }
            />
          }
        />
      </FadeIn>

      {!isLoading && !isError && staleCount > 0 && (
        <p className={styles.staleBanner}>
          {t("admin:adminResourceGuides.staleBanner", { count: staleCount })}
        </p>
      )}

      {isLoading ? (
        <div className={styles.rows}>
          {[0, 1, 2, 3].map((skeletonIndex) => (
            <SkeletonLine
              key={skeletonIndex}
              height={68}
              style={{ borderRadius: 14 }}
            />
          ))}
        </div>
      ) : isError ? (
        <div className={styles.notice}>
          <p className={styles.noticeText}>
            {isForbidden
              ? t("admin:common.panelForbidden")
              : t("admin:adminResourceGuides.loadError")}
          </p>
        </div>
      ) : guides.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>
            {t("admin:adminResourceGuides.empty")}
          </p>
          <Button to={routes.guideIndex} variant="ghost" size="sm">
            {t("admin:adminResourceGuides.viewPublicIndexCta")}
          </Button>
        </div>
      ) : (
        <AdminResourceGuideRows
          guides={guides}
          onEdit={setEditing}
          onReview={setReviewing}
        />
      )}

      {editing && (
        <AdminResourceGuideEditor
          guide={editing}
          onClose={() => setEditing(null)}
        />
      )}

      {reviewing && (
        <AdminResourceGuideReviewModal
          guide={reviewing}
          onClose={() => setReviewing(null)}
        />
      )}
    </AdminShell>
  );
}
