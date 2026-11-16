import { useState } from "react";
import { FiInbox } from "react-icons/fi";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { ApiError } from "../../shared/api/client";
import { routes } from "../../app/routeMap";
import {
  AdminEmptyState,
  AdminNotice,
  AdminPageHeader,
  AdminPanel,
} from "./ui";
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
import type { AdminLegalRequestDTO } from "./api/adminLegalRequests.api";
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

/** The register itself: a skeleton, a failure, an empty result or the rows.
 *  A failed read is an error notice that names the reason; it never falls
 *  back to the empty line. */
function LegalRequestRegister({
  records,
  isLoading,
  isError,
  isForbidden,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onOpen,
}: {
  records: AdminLegalRequestDTO[];
  isLoading: boolean;
  isError: boolean;
  isForbidden: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onOpen: (recordId: string) => void;
}) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className={styles.skeletons}>
        {[0, 1, 2, 3].map((skeletonIndex) => (
          <SkeletonLine
            key={skeletonIndex}
            height={88}
            style={{ borderRadius: 12 }}
          />
        ))}
      </div>
    );
  }
  if (isError) {
    return (
      <AdminNotice tone="error">
        {isForbidden
          ? t("admin:legalRequests.forbidden")
          : t("admin:legalRequests.loadError")}
      </AdminNotice>
    );
  }
  if (records.length === 0) {
    return (
      <AdminEmptyState icon={FiInbox} title={t("admin:legalRequests.empty")} />
    );
  }
  return (
    <AdminPanel padding="flush">
      <ul className={styles.rows}>
        {records.map((record, index) => (
          <li key={record.id}>
            <FadeIn delay={Math.min(index, 8) * 50}>
              <AdminLegalRequestRow
                record={record}
                onOpen={() => onOpen(record.id)}
              />
            </FadeIn>
          </li>
        ))}
      </ul>
      {hasNextPage && (
        <div className={styles.loadMore}>
          <Button
            variant="ghost"
            size="md"
            disabled={isFetchingNextPage}
            onClick={onLoadMore}
          >
            {isFetchingNextPage
              ? t("admin:legalRequests.loadingMore")
              : t("admin:legalRequests.loadMore")}
          </Button>
        </div>
      )}
    </AdminPanel>
  );
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
 * happened to them. Who was named and what was handed over stay private.
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
          eyebrow={t("shared:adminNav.sections.platform")}
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

      <div className={styles.stack}>
        {demoMode && (
          <AdminNotice tone="info">
            {t("admin:legalRequests.demoNotice")}
          </AdminNotice>
        )}

        <FadeIn delay={60}>
          <AdminLegalRequestFilterBar
            filters={filters}
            onChange={(patch) =>
              setFilters((current) => ({ ...current, ...patch }))
            }
            count={
              !isLoading && !isError && records.length > 0
                ? t("admin:legalRequests.countLine", { count: total })
                : undefined
            }
          />
        </FadeIn>

        <FadeIn delay={80}>
          <LegalRequestRegister
            records={records}
            isLoading={isLoading}
            isError={isError}
            isForbidden={isForbidden}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => void fetchNextPage()}
            onOpen={(recordId) => setOpenPane({ kind: "detail", recordId })}
          />
        </FadeIn>
      </div>

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
