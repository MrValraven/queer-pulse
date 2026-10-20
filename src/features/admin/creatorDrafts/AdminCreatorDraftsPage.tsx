import { AnimatePresence } from "motion/react";
import { FiEdit3 } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import {
  Button,
  CollapseListItem,
  EmptyState,
  FadeIn,
  LoadErrorState,
  SkeletonLine,
} from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  CREATOR_DRAFT_KINDS,
  isCreatorDraftKind,
  type AdminCreatorDraftRow as AdminCreatorDraftRowData,
  type CreatorDraftKind,
} from "../api/adminCreatorDrafts.api";
import { useAdminCreatorDrafts } from "../api/useAdminCreatorDrafts";
import { AdminPageHeader, AdminTabs } from "../ui";
import { AdminCreatorDraftRow } from "./AdminCreatorDraftRow";
import { CREATOR_DRAFT_KIND_LABEL_KEYS } from "./adminCreatorDraftLabels";
import styles from "./AdminCreatorDrafts.module.css";

const ALL_KINDS_TAB = "all";
const KIND_SEARCH_PARAM = "kind";

/**
 * Every member's unfinished creator draft, across the seven kinds, newest save
 * first (Admin only). The kind filter lives in `?kind=` so a link from the
 * listing drafts tab lands already narrowed; an unknown value reads as all.
 * Rows open the read-only preview, which holds the reach-out action.
 */
export function AdminCreatorDraftsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const kindParam = searchParams.get(KIND_SEARCH_PARAM);
  const activeKind = isCreatorDraftKind(kindParam) ? kindParam : null;

  const selectKind = (tabId: string) => {
    setSearchParams((previousParams) => {
      const nextParams = new URLSearchParams(previousParams);
      if (isCreatorDraftKind(tabId)) {
        nextParams.set(KIND_SEARCH_PARAM, tabId);
      } else {
        nextParams.delete(KIND_SEARCH_PARAM);
      }
      return nextParams;
    });
  };

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:creatorDrafts.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:creatorDrafts.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:creatorDrafts.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:creatorDrafts.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={60}>
        <AdminTabs
          tabs={[
            {
              id: ALL_KINDS_TAB,
              label: t("admin:creatorDrafts.filter.all"),
            },
            ...CREATOR_DRAFT_KINDS.map((kind) => ({
              id: kind,
              label: t(CREATOR_DRAFT_KIND_LABEL_KEYS[kind]),
            })),
          ]}
          active={activeKind ?? ALL_KINDS_TAB}
          onChange={selectKind}
        />
      </FadeIn>

      <FadeIn delay={80}>
        <CreatorDraftsBody kind={activeKind} />
      </FadeIn>
    </AdminShell>
  );
}

function CreatorDraftsBody({ kind }: { kind: CreatorDraftKind | null }) {
  const { t } = useTranslation();
  const {
    rows,
    total,
    isLoading,
    isError,
    isFetching,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminCreatorDrafts(kind);

  const isEmpty = !isLoading && !isError && rows.length === 0;
  // A filtered tab names its kind, so an empty tab never reads as an empty
  // queue while other kinds still hold drafts.
  const emptyText = kind
    ? t("admin:creatorDrafts.emptyKind", {
        kind: t(CREATOR_DRAFT_KIND_LABEL_KEYS[kind]),
      })
    : t("admin:creatorDrafts.empty");
  // One live region for every state, mounted the whole time, so a screen
  // reader hears the load finish, the count change with the filter and the
  // count change with the filter. The error panel and the empty panel are
  // status regions themselves, so this one goes quiet while either shows.
  const statusText = isLoading
    ? t("admin:creatorDrafts.loadingMore")
    : isError || isEmpty
      ? ""
      : t("admin:creatorDrafts.count", { count: total });

  return (
    <>
      <p
        className={
          isLoading || isError || isEmpty ? "visuallyHidden" : styles.statusLine
        }
        role="status"
      >
        {statusText}
      </p>
      {isLoading ? (
        <CreatorDraftRowsSkeleton />
      ) : isError ? (
        <LoadErrorState
          onRetry={() => void refetch()}
          isRetrying={isFetching}
          title={t("admin:creatorDrafts.loadError.title")}
          description={t("admin:creatorDrafts.loadError.body")}
        />
      ) : isEmpty ? (
        <EmptyState
          className={styles.empty}
          compact
          headingLevel={2}
          icon={<FiEdit3 aria-hidden />}
          title={emptyText}
        />
      ) : (
        <CreatorDraftRows
          rows={rows}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={() => void fetchNextPage()}
        />
      )}
    </>
  );
}

function CreatorDraftRows({
  rows,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: {
  rows: AdminCreatorDraftRowData[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}) {
  const { t } = useTranslation();
  if (rows.length === 0) return null;
  return (
    <>
      <ul className={styles.rows}>
        <AnimatePresence initial={false}>
          {rows.map((row) => (
            <CollapseListItem key={`${row.kind}:${row.id}`}>
              <AdminCreatorDraftRow row={row} />
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
      {hasNextPage && (
        <div className={styles.loadMore}>
          <Button
            variant="ghost"
            size="md"
            aria-disabled={isFetchingNextPage || undefined}
            onClick={() => {
              if (!isFetchingNextPage) onLoadMore();
            }}
          >
            {isFetchingNextPage
              ? t("admin:creatorDrafts.loadingMore")
              : t("admin:creatorDrafts.loadMore")}
          </Button>
        </div>
      )}
    </>
  );
}

function CreatorDraftRowsSkeleton() {
  return (
    <div className={styles.skeletonRows}>
      {[0, 1, 2, 3].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={120}
          style={{ borderRadius: "var(--radius-card)" }}
        />
      ))}
    </div>
  );
}
