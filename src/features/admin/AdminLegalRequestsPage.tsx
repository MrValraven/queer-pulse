import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { ApiError } from "../../shared/api/client";
import { routes } from "../../app/routeMap";
import { AdminPageHeader } from "./ui";
import { AdminLegalRequestFilterBar } from "./AdminLegalRequestFilterBar";
import { AdminLegalRequestRow } from "./AdminLegalRequestRow";
import { AdminLegalRequestDetail } from "./AdminLegalRequestDetail";
import { AdminLegalRequestForm } from "./AdminLegalRequestForm";
import {
  DEFAULT_LEGAL_REQUEST_FILTERS,
  useAdminLegalRequest,
  useAdminLegalRequests,
  type AdminLegalRequestFilters,
} from "./api/useAdminLegalRequests";
import styles from "./AdminLegalRequestsPage.module.css";

/** Which pane is open over the register: none, the read-only detail of one
 *  record, or the editor on a new or existing record. */
type OpenPane =
  | { kind: "detail"; recordId: string }
  | { kind: "create" }
  | { kind: "edit"; recordId: string };

/** The editor needs the whole record to seed its draft, so "edit" fetches the
 *  row the same way the detail pane does and holds the drawer back until it has
 *  it. Rendered as its own component so the hook is never called conditionally
 *  from the page. */
function LegalRequestEditor({
  recordId,
  onClose,
}: {
  recordId: string;
  onClose: () => void;
}) {
  const { data: record } = useAdminLegalRequest(recordId);
  if (!record) return null;
  return <AdminLegalRequestForm record={record} onClose={onClose} />;
}

/**
 * `/admin/legal-requests`, the register of demands from courts, police forces,
 * ministries and any other arm of a state (PRD-32).
 *
 * ADMIN ONLY, and narrower than every queue beside it. Each row names a state
 * body, a jurisdiction and a number of members it came for, which makes this the
 * most sensitive table in the product; the moderation rota is a much wider group
 * than the people who should be able to read a police file. The backend is
 * `@Roles(Admin)`, the route gate matches, and the nav entry is hidden from
 * moderators so nobody is offered a link that bounces them.
 *
 * What is written here is counted by the public Transparency Report, and no
 * field of it is published: the report says how many demands arrived and what
 * happened to them, never who was named or what was handed over.
 *
 * A failed read is never an empty register. "Nothing matched these filters" and
 * "the register could not be read" are two different sentences, and only one of
 * them is reassuring.
 */
export function AdminLegalRequestsPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [filters, setFilters] = useState<AdminLegalRequestFilters>(
    DEFAULT_LEGAL_REQUEST_FILTERS,
  );
  const [openPane, setOpenPane] = useState<OpenPane | null>(null);
  const {
    records,
    total,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminLegalRequests(filters);

  const isForbidden =
    isError && error instanceof ApiError && error.status === 403;

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:legalRequests.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:legalRequests.eyebrow")}
          title={
            <Translation
              i18nKey="admin:legalRequests.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:legalRequests.headerSub")}
          actions={
            <Button
              variant="primary"
              size="md"
              onClick={() => setOpenPane({ kind: "create" })}
            >
              {t("admin:legalRequests.recordCta")}
            </Button>
          }
        />
      </FadeIn>

      {demoMode && (
        <p className={styles.notice}>{t("admin:legalRequests.demoNotice")}</p>
      )}

      <FadeIn delay={60}>
        <AdminLegalRequestFilterBar
          filters={filters}
          onChange={(patch) =>
            setFilters((current) => ({ ...current, ...patch }))
          }
        />
      </FadeIn>

      <FadeIn delay={80}>
        {isLoading ? (
          <div className={styles.rows}>
            {[0, 1, 2, 3].map((skeletonIndex) => (
              <SkeletonLine
                key={skeletonIndex}
                height={104}
                style={{ borderRadius: 14 }}
              />
            ))}
          </div>
        ) : isError ? (
          <p className={`${styles.notice} ${styles.errorNotice}`}>
            <FiAlertTriangle aria-hidden className={styles.noticeIcon} />
            {isForbidden
              ? t("admin:legalRequests.forbidden")
              : t("admin:legalRequests.loadError")}
          </p>
        ) : records.length === 0 ? (
          <p className={styles.notice}>{t("admin:legalRequests.empty")}</p>
        ) : (
          <>
            <p className={styles.rowMeta}>
              {t("admin:legalRequests.countLine", { count: total })}
            </p>
            <div className={styles.rows}>
              {records.map((record, index) => (
                <FadeIn key={record.id} delay={Math.min(index, 8) * 50}>
                  <AdminLegalRequestRow
                    record={record}
                    onOpen={() =>
                      setOpenPane({ kind: "detail", recordId: record.id })
                    }
                  />
                </FadeIn>
              ))}
            </div>
            {hasNextPage && (
              <div className={styles.loadMore}>
                <Button
                  variant="ghost"
                  size="md"
                  disabled={isFetchingNextPage}
                  onClick={() => void fetchNextPage()}
                >
                  {isFetchingNextPage
                    ? t("admin:legalRequests.loadingMore")
                    : t("admin:legalRequests.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </FadeIn>

      {openPane?.kind === "detail" && (
        <AdminLegalRequestDetail
          recordId={openPane.recordId}
          onClose={() => setOpenPane(null)}
          onAmend={(recordId) => setOpenPane({ kind: "edit", recordId })}
        />
      )}
      {openPane?.kind === "create" && (
        <AdminLegalRequestForm
          record={null}
          onClose={() => setOpenPane(null)}
        />
      )}
      {openPane?.kind === "edit" && (
        <LegalRequestEditor
          recordId={openPane.recordId}
          onClose={() => setOpenPane(null)}
        />
      )}
    </AdminShell>
  );
}
