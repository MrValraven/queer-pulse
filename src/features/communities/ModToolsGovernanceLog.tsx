import { useState } from "react";
import {
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiLock,
} from "react-icons/fi";
import {
  EmptyState,
  IconButton,
  Select,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  COMMUNITY_GOVERNANCE_LOG_ACTIONS,
  type CommunityGovernanceLogAction,
} from "./api/communityGovernanceLog.api";
import {
  COMMUNITY_GOVERNANCE_LOG_PAGE_SIZE,
  useCommunityGovernanceLog,
} from "./api/useCommunityGovernanceLog";
import { isCommunityStaff } from "./communityStaff";
import type { CommunityRole } from "./membership.types";
import { ModToolsGovernanceLogRow } from "./ModToolsGovernanceLogRow";
import detail from "./CommunityDetailPage.module.css";
import panels from "./ModToolsPanels.module.css";
import styles from "./ModToolsGovernanceLog.module.css";

/** Filter sentinel for "no action filter". Never sent to the backend, which
 *  reads an absent `action` as unfiltered. */
const ALL_ACTIONS = "all";

/**
 * This community's own governance history: every role change, removal, ban,
 * ownership handover, freeze, archive, settings edit and card action recorded
 * against it, newest first.
 *
 * The trail existed for a long time with exactly one reader, the platform
 * admin console. A community's own owner could not answer "who removed her",
 * "who unfroze the room" or "who turned us from private to public" without
 * asking QueerPulse staff, which makes an audit trail meant to check unilateral
 * owner power unreadable by the people it is supposed to protect.
 *
 * Loading, failure and a genuinely empty trail are three separate renders. A
 * failed request must never paint as "nobody has ever moderated here": the
 * endpoint 403s anyone below staff and 404s an archived slug, and folding
 * either into an empty list would have the pane state something false at
 * exactly the moment somebody is checking.
 */
export function ModToolsGovernanceLog({
  slug,
  viewerRole,
}: {
  slug: string;
  /** The viewer's own roster role. Owner, co-owner and moderator, matching the
   *  backend's `resolveStaffCommunity` tier exactly.
   *
   *  Named `viewerRole` rather than `role`: a prop called `role` on a JSX
   *  element reads to `jsx-a11y/aria-role` as the DOM aria attribute, and
   *  every call site tripped the a11y ratchet, which blocks the build at
   *  BUDGET=0. */
  viewerRole: CommunityRole | null;
}) {
  const { t } = useTranslation();
  const [action, setAction] = useState<string>(ALL_ACTIONS);
  const [page, setPage] = useState(1);
  const isStaff = isCommunityStaff(viewerRole);

  const activeAction =
    action === ALL_ACTIONS
      ? undefined
      : (action as CommunityGovernanceLogAction);
  const { data, isPending, isError, refetch } = useCommunityGovernanceLog(
    slug,
    page,
    activeAction,
    isStaff,
  );

  const changeAction = (next: string) => {
    setAction(next);
    setPage(1);
  };

  // A refetch can shrink the trail under a page already advanced to. Snap back
  // to the last real page rather than rendering the empty slice, which would
  // otherwise read as "this community has no governance history". Adjusted
  // during render: the condition is derived from render-available values, and
  // the corrected page makes it false on the immediate re-render, so it
  // terminates.
  const pageSize = data?.pageSize || COMMUNITY_GOVERNANCE_LOG_PAGE_SIZE;
  const pageCount = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;
  const isPageOutOfRange = data !== undefined && page > pageCount;
  if (isPageOutOfRange) setPage(pageCount);

  return (
    <div style={{ marginBottom: 32 }}>
      <div className={detail.secLbl}>
        {t("communities:detail.modtools.history.label")}
      </div>
      <p className={panels.intro}>
        {t("communities:detail.modtools.history.intro")}
      </p>

      {!isStaff ? (
        <EmptyState
          compact
          icon={<FiLock />}
          title={t("communities:detail.modtools.history.staffOnly.title")}
          description={t(
            "communities:detail.modtools.history.staffOnly.description",
          )}
        />
      ) : (
        <>
          <div className={styles.filterRow}>
            <Select
              size="sm"
              label={t("communities:detail.modtools.history.filterLabel")}
              value={action}
              options={[
                {
                  value: ALL_ACTIONS,
                  label: t("communities:detail.modtools.history.allActions"),
                },
                ...COMMUNITY_GOVERNANCE_LOG_ACTIONS.map((actionId) => ({
                  value: actionId,
                  label: t(
                    `communities:detail.modtools.history.action.${actionId}`,
                  ),
                })),
              ]}
              onChange={(next) => changeAction(next ?? ALL_ACTIONS)}
            />
          </div>

          {isPending || isPageOutOfRange ? (
            <SkeletonTrail />
          ) : isError || !data ? (
            <EmptyState
              compact
              icon={<FiAlertTriangle />}
              title={t("communities:detail.modtools.history.error.title")}
              description={t(
                "communities:detail.modtools.history.error.description",
              )}
              action={{
                label: t("communities:detail.modtools.history.error.retry"),
                onClick: () => void refetch(),
              }}
            />
          ) : data.total === 0 ? (
            <EmptyState
              compact
              icon={<FiClock />}
              title={t(
                activeAction
                  ? "communities:detail.modtools.history.emptyFiltered.title"
                  : "communities:detail.modtools.history.empty.title",
              )}
              description={t(
                activeAction
                  ? "communities:detail.modtools.history.emptyFiltered.description"
                  : "communities:detail.modtools.history.empty.description",
              )}
              action={
                activeAction
                  ? {
                      label: t(
                        "communities:detail.modtools.history.clearFilterCta",
                      ),
                      onClick: () => changeAction(ALL_ACTIONS),
                    }
                  : undefined
              }
            />
          ) : (
            <>
              <ul className={styles.list}>
                {data.items.map((entry, index) => (
                  <ModToolsGovernanceLogRow
                    key={entry.id}
                    entry={entry}
                    delay={index * 35}
                  />
                ))}
              </ul>
              <GovernanceLogPager
                page={page}
                pageCount={pageCount}
                pageSize={pageSize}
                shown={data.items.length}
                total={data.total}
                onPage={setPage}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

/** Previous/next rather than one button per page: a long-lived community's
 *  trail runs to hundreds of entries, and a numbered strip that wide is
 *  unusable on a phone. */
function GovernanceLogPager({
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
        {t("communities:detail.modtools.history.pagerMeta", {
          start: fmt.number(start),
          end: fmt.number(start + shown - 1),
          total: fmt.number(total),
        })}
      </span>
      <div className={styles.pagerNav}>
        <IconButton
          size="sm"
          aria-label={t("communities:detail.modtools.history.prevPage")}
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
        >
          <FiChevronLeft aria-hidden />
        </IconButton>
        <span className={styles.pagerPage}>
          {t("communities:detail.modtools.history.pagerPage", {
            page,
            pageCount,
          })}
        </span>
        <IconButton
          size="sm"
          aria-label={t("communities:detail.modtools.history.nextPage")}
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
        >
          <FiChevronRight aria-hidden />
        </IconButton>
      </div>
    </div>
  );
}

/** The loading trail. Four placeholder entries rather than a spinner, so the
 *  pane does not jump height the moment the real rows land. */
function SkeletonTrail() {
  return (
    <ul className={styles.list} aria-busy="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <li key={index} className={styles.entry} aria-hidden>
          <SkeletonLine width={120} height={22} style={{ borderRadius: 999 }} />
          <SkeletonLine width="70%" style={{ marginTop: 10 }} />
          <SkeletonLine width="45%" style={{ marginTop: 10 }} />
        </li>
      ))}
    </ul>
  );
}
