import { useMemo, useState } from "react";
import {
  Button,
  FadeIn,
  LoadErrorState,
  SkeletonLine,
} from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ApiError } from "../../shared/api/client";
import { routes } from "../../app/routeMap";
import { AdminPageHeader } from "./ui";
import { useAdminGlossaryTerms } from "./api/useAdminResourceGuides";
import { AdminGlossaryRows } from "./AdminGlossaryRows";
import { AdminGlossaryTermEditor } from "./AdminGlossaryTermEditor";
import { AdminGlossaryReviewModal } from "./AdminGlossaryReviewModal";
import { AdminGlossaryDeleteModal } from "./AdminGlossaryDeleteModal";
import type { AdminGlossaryTermDTO } from "./api/adminResourceGuides.api";
import styles from "./AdminGlossaryPage.module.css";

/**
 * The glossary console (`/admin/resource-guides/glossary`) — PRD-264.
 *
 * `AdminGlossaryController` has been writable since CON-08, but nothing on the
 * frontend consumed it: adding or correcting a term meant a SQL statement, so
 * the seeded Portuguese definitions were never finished and the public page's
 * EN/PT toggle quietly served English in both. This is the surface that makes
 * "maintained by Trans Hub and Wellbeing" true.
 *
 * Filed under the resource-guides path on purpose: it is the other half of the
 * same editorial job, and it inherits that path's `resource_curator` grant, so
 * a curator without the admin tier can open it. Deletion stays admin-only,
 * enforced per method on the backend.
 *
 * Demo mode shows an honestly empty list, matching the guide console: an
 * invented glossary with invented review dates would misrepresent what this
 * panel holds.
 */
export function AdminGlossaryPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error, refetch } = useAdminGlossaryTerms();
  const [query, setQuery] = useState("");
  const [editorTarget, setEditorTarget] = useState<
    AdminGlossaryTermDTO | "new" | null
  >(null);
  const [reviewTarget, setReviewTarget] = useState<AdminGlossaryTermDTO | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<AdminGlossaryTermDTO | null>(
    null,
  );

  const isForbidden =
    isError && error instanceof ApiError && error.status === 403;
  const terms = useMemo(() => data ?? [], [data]);
  const untranslatedCount = terms.filter((term) => !term.definitionPt).length;

  const visibleTerms = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return terms;
    return terms.filter((term) =>
      `${term.term} ${term.slug} ${term.category ?? ""}`
        .toLowerCase()
        .includes(needle),
    );
  }, [terms, query]);

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminGlossary.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
        {
          label: t("admin:adminGlossary.guidesBreadcrumb"),
          to: routes.adminResourceGuides,
        },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:adminGlossary.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:adminGlossary.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminGlossary.header.sub")}
          actions={
            <>
              <input
                type="search"
                className={styles.searchInput}
                aria-label={t("admin:adminGlossary.searchLabel")}
                placeholder={t("admin:adminGlossary.searchPlaceholder")}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Button
                variant="primary"
                size="md"
                onClick={() => setEditorTarget("new")}
              >
                {t("admin:adminGlossary.newTermCta")}
              </Button>
            </>
          }
        />
      </FadeIn>

      {!isLoading && !isError && untranslatedCount > 0 && (
        <p className={styles.staleBanner}>
          {t("admin:adminGlossary.untranslatedBanner", {
            count: untranslatedCount,
          })}
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
      ) : isForbidden ? (
        <div className={styles.notice}>
          <p className={styles.noticeText}>
            {t("admin:common.panelForbidden")}
          </p>
        </div>
      ) : isError ? (
        <LoadErrorState
          onRetry={() => void refetch()}
          title={
            <Translation
              i18nKey="admin:adminGlossary.loadError.title"
              components={{ em: <em /> }}
            />
          }
          description={t("admin:adminGlossary.loadError.body")}
        />
      ) : visibleTerms.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>
            {t(
              terms.length === 0
                ? "admin:adminGlossary.empty"
                : "admin:adminGlossary.noMatches",
            )}
          </p>
          <Button to={routes.glossary} variant="ghost" size="sm">
            {t("admin:adminGlossary.viewPublicGlossaryCta")}
          </Button>
        </div>
      ) : (
        <AdminGlossaryRows
          terms={visibleTerms}
          onEdit={setEditorTarget}
          onReview={setReviewTarget}
          onDelete={setDeleteTarget}
        />
      )}

      {editorTarget && (
        <AdminGlossaryTermEditor
          term={editorTarget === "new" ? null : editorTarget}
          onClose={() => setEditorTarget(null)}
        />
      )}

      {reviewTarget && (
        <AdminGlossaryReviewModal
          term={reviewTarget}
          onClose={() => setReviewTarget(null)}
        />
      )}

      {deleteTarget && (
        <AdminGlossaryDeleteModal
          term={deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </AdminShell>
  );
}
