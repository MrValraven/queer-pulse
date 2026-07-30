import { useMemo, useState } from "react";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader, AdminTabs } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AdminListingRows } from "./AdminListingRows";
import { ListingPreviewDrawer } from "./ListingPreviewDrawer";
import { EditSuggestionsSection } from "./EditSuggestionsSection";
import { useAdminListings } from "./api/useAdminListings";
import type { ListingStatus } from "../marketing/listBusiness/listBusiness.data";
import type { ListingQueueRow } from "./api/adminListings.api";
import styles from "./AdminListingsPage.module.css";

type StatusFilter = ListingStatus | "all";
const FILTERS: StatusFilter[] = ["all", "review", "question", "live"];

type ViewTab = "queue" | "editSuggestions";
const VIEWS: ViewTab[] = ["queue", "editSuggestions"];

/**
 * Moderator queue for member-submitted directory listings: filter by review
 * status and move a listing review → quick question → live (or back). Live
 * mode PATCHes `/listings/:ref/status`; demo edits a local override map.
 */
export function AdminListingsPage() {
  const { t } = useTranslation();
  const [view, setView] = useState<ViewTab>("queue");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const statusArg = filter === "all" ? undefined : filter;
  const { rows, isLoading } = useAdminListings();
  // Demo's mutation never touches the fixture (see useSetListingStatus), so
  // this map reflects a just-saved status over the fetched list immediately.
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, ListingStatus>
  >({});
  const [openRow, setOpenRow] = useState<ListingQueueRow | null>(null);

  const visibleRows = useMemo(() => {
    const withOverrides = rows.map((row) => {
      const override = statusOverrides[row.ref];
      return override ? { ...row, status: override } : row;
    });
    return statusArg
      ? withOverrides.filter((row) => row.status === statusArg)
      : withOverrides;
  }, [rows, statusOverrides, statusArg]);

  function handleStatusChanged(ref: string, status: ListingStatus) {
    setStatusOverrides((current) => ({ ...current, [ref]: status }));
  }

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminListings.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:adminListings.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:adminListings.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminListings.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={60}>
        <AdminTabs
          tabs={VIEWS.map((value) => ({
            id: value,
            label: t(`admin:adminListings.view.${value}`),
          }))}
          active={view}
          onChange={(value) => setView(value as ViewTab)}
        />
      </FadeIn>

      {view === "queue" ? (
        <>
          <FadeIn delay={70}>
            <AdminTabs
              tabs={FILTERS.map((value) => ({
                id: value,
                label: t(`admin:adminListings.filter.${value}`),
              }))}
              active={filter}
              onChange={(value) => setFilter(value as StatusFilter)}
            />
          </FadeIn>

          <FadeIn delay={80}>
            {isLoading ? (
              <ListingRowsSkeleton />
            ) : (
              <AdminListingRows
                rows={visibleRows}
                onStatusChanged={handleStatusChanged}
                onOpen={setOpenRow}
              />
            )}
          </FadeIn>
        </>
      ) : (
        <EditSuggestionsSection />
      )}

      {openRow && (
        <ListingPreviewDrawer
          row={
            // reflect any just-applied status override in the drawer too
            statusOverrides[openRow.ref]
              ? { ...openRow, status: statusOverrides[openRow.ref]! }
              : openRow
          }
          onClose={() => setOpenRow(null)}
          onStatusChanged={handleStatusChanged}
        />
      )}
    </AdminShell>
  );
}

function ListingRowsSkeleton() {
  return (
    <div className={styles.rows}>
      {[0, 1, 2, 3].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={64}
          style={{ borderRadius: 14 }}
        />
      ))}
    </div>
  );
}
