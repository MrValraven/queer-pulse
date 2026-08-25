import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button, Select, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import {
  GOVERNANCE_LOG_ACTIONS,
  type GovernanceLogAction,
} from "./api/adminCommunityGovernanceLog.api";
import {
  GOVERNANCE_LOG_PAGE_SIZE,
  useAdminCommunityGovernanceLog,
} from "./api/useAdminCommunityGovernanceLog";
import { AdminCommunityGovernanceLogRow } from "./AdminCommunityGovernanceLogRow";
import styles from "./AdminCommunityGovernanceLog.module.css";

/** Filter sentinel for "no action filter" — never sent to the backend, which
 *  treats an absent `action` as unfiltered. */
const ALL_ACTIONS = "all";

/**
 * The community governance audit trail: every role change, removal, ownership
 * handover, freeze, archive and settings edit recorded against this community,
 * newest first.
 *
 * Loading, failure, and a genuinely empty trail are three distinct renders.
 * The endpoint is admin-only and 403s otherwise, so folding a failed request
 * into "no activity" would tell an admin mid-incident that nothing has ever
 * happened here, which is the most damaging thing an audit trail can claim.
 */
export function GovernanceLogPane({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const [action, setAction] = useState<string>(ALL_ACTIONS);
  const [page, setPage] = useState(1);

  const activeAction =
    action === ALL_ACTIONS ? undefined : (action as GovernanceLogAction);
  const { data, isPending, isError, refetch } = useAdminCommunityGovernanceLog(
    slug,
    page,
    activeAction,
  );

  const actionOptions = [
    {
      value: ALL_ACTIONS,
      label: t("admin:communities.governanceLog.allActions"),
    },
    ...GOVERNANCE_LOG_ACTIONS.map((actionId) => ({
      value: actionId,
      label: t(`admin:communities.governanceLog.action.${actionId}`),
    })),
  ];

  const changeAction = (next: string) => {
    setAction(next);
    setPage(1);
  };

  // A refetch can shrink the trail under a page the admin already advanced to
  // (an entry filtered away, a narrower result set). Snap back to the last real
  // page instead of rendering the resulting empty slice, which would otherwise
  // read as "this community has no governance history".
  const pageSize = data?.pageSize || GOVERNANCE_LOG_PAGE_SIZE;
  const pageCount = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;
  const isPageOutOfRange = data !== undefined && page > pageCount;
  // Adjust during render rather than in an effect: the condition above is
  // already derived from render-available values, and setting it here (as
  // opposed to in a post-commit effect) avoids painting the stale out-of-range
  // page before snapping back. React re-renders immediately with the
  // corrected page, and isPageOutOfRange is false on that render, so this
  // terminates.
  if (isPageOutOfRange) {
    setPage(pageCount);
  }

  return (
    <div className={styles.pane}>
      <div className={styles.head}>
        <p className={styles.intro}>
          {t("admin:communities.governanceLog.intro")}
        </p>
        <Select
          size="sm"
          label={t("admin:communities.governanceLog.filterLabel")}
          value={action}
          options={actionOptions}
          onChange={(next) => changeAction(next ?? ALL_ACTIONS)}
        />
      </div>

      {isPending || isPageOutOfRange ? (
        <SkeletonTrail />
      ) : isError || !data ? (
        <ErrorPanel onRetry={() => void refetch()} />
      ) : data.total === 0 ? (
        <EmptyPanel
          isFiltered={activeAction !== undefined}
          onClearFilter={() => changeAction(ALL_ACTIONS)}
        />
      ) : (
        <>
          <ul className={styles.list}>
            {data.items.map((entry, index) => (
              <AdminCommunityGovernanceLogRow
                key={entry.id}
                entry={entry}
                delay={index * 35}
              />
            ))}
          </ul>
          <Pager
            page={page}
            pageCount={pageCount}
            pageSize={pageSize}
            shown={data.items.length}
            total={data.total}
            onPage={setPage}
          />
        </>
      )}
    </div>
  );
}

/** Honest failure: says the request failed and offers the retry, instead of
 *  rendering as an empty trail. */
function ErrorPanel({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className={styles.errorPanel} role="alert">
      <p className={styles.errorText}>
        {t("admin:communities.governanceLog.loadError")}
      </p>
      <Button variant="ghost" size="md" onClick={onRetry}>
        {t("admin:communities.governanceLog.retryCta")}
      </Button>
    </div>
  );
}

/** A trail with nothing in it. Split in two, because "this community has no
 *  governance history" and "no entry matches the action you picked" are
 *  different facts and only one of them is about the filter. */
function EmptyPanel({
  isFiltered,
  onClearFilter,
}: {
  isFiltered: boolean;
  onClearFilter: () => void;
}) {
  const { t } = useTranslation();
  const suffix = isFiltered ? "Filtered" : "";
  return (
    <div className={styles.emptyPanel}>
      <h3 className={styles.emptyTitle}>
        <Translation
          i18nKey={`admin:communities.governanceLog.empty${suffix}Title`}
          components={{ em: <em /> }}
        />
      </h3>
      <p className={styles.emptyText}>
        {t(`admin:communities.governanceLog.empty${suffix}Text`)}
      </p>
      {isFiltered && (
        <div className={styles.emptyCta}>
          <Button variant="ghost-dark" size="md" onClick={onClearFilter}>
            {t("admin:communities.governanceLog.clearFilterCta")}
          </Button>
        </div>
      )}
    </div>
  );
}

/** Prev/next rather than one button per page: a long-lived community's trail
 *  can run to hundreds of entries, and a numbered strip that wide is unusable. */
function Pager({
  page,
  pageCount,
  pageSize,
  shown,
  total,
  onPage,
}: {
  page: number;
  pageCount: number;
  pageSize: number;
  shown: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  if (pageCount === 1) return null;

  const start = (page - 1) * pageSize + 1;
  return (
    <div className={styles.pager}>
      <span className={styles.pagerMeta}>
        {t("admin:communities.governanceLog.pagerMeta", {
          start: fmt.number(start),
          end: fmt.number(start + shown - 1),
          total: fmt.number(total),
        })}
      </span>
      <div className={styles.pagerNav}>
        <button
          type="button"
          className={styles.pagerBtn}
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          aria-label={t("admin:communities.governanceLog.prevPage")}
        >
          <FiChevronLeft aria-hidden />
        </button>
        <span className={styles.pagerPage}>
          {t("admin:communities.governanceLog.pagerPage", { page, pageCount })}
        </span>
        <button
          type="button"
          className={styles.pagerBtn}
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
          aria-label={t("admin:communities.governanceLog.nextPage")}
        >
          <FiChevronRight aria-hidden />
        </button>
      </div>
    </div>
  );
}

function SkeletonTrail() {
  return (
    <ul className={styles.list} aria-busy="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <li key={index} className={styles.entry} aria-hidden>
          <SkeletonLine
            width={40}
            height={40}
            style={{ borderRadius: 999, flex: "none" }}
          />
          <div className={styles.entryBody}>
            <SkeletonLine
              width={120}
              height={22}
              style={{ borderRadius: 999 }}
            />
            <SkeletonLine width="70%" style={{ marginTop: 10 }} />
            <SkeletonLine width="45%" style={{ marginTop: 10 }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
