import { useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader, AdminTabs, AdminChip, type AdminTone } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import {
  useAdminReadingGroupProposals,
  type AdminReadingGroupFormatFilter,
} from "./api/useAdminReadingGroupProposals";
import { useAdminReadingGroupProposalMutations } from "./api/useAdminReadingGroupProposalMutations";
import type {
  AdminReadingGroupProposalDTO,
  ReadingGroupFormat,
  ReadingGroupProposalDecision,
  ReadingGroupProposalStatus,
} from "./api/adminReadingGroupProposals.api";
import styles from "./AdminSubmissionList.module.css";

const FILTERS: AdminReadingGroupFormatFilter[] = [
  "all",
  "In-person",
  "Online",
  "Either",
];

const FORMAT_TONE: Record<ReadingGroupFormat, AdminTone> = {
  "In-person": "jade",
  Online: "violet",
  Either: "plum",
};

const STATUS_TONE: Record<ReadingGroupProposalStatus, AdminTone> = {
  pending: "amber",
  approved: "jade",
  declined: "danger",
  archived: "ghost",
};

// Each action button, and the status its proposal lands in — used to disable
// the button that matches the current status (no-op re-decision).
const ACTIONS: {
  decision: ReadingGroupProposalDecision;
  status: ReadingGroupProposalStatus;
}[] = [
  { decision: "approve", status: "approved" },
  { decision: "decline", status: "declined" },
  { decision: "archive", status: "archived" },
];

// The status each decision resolves to — for the confirmation toast key.
const DECISION_STATUS: Record<
  ReadingGroupProposalDecision,
  ReadingGroupProposalStatus
> = {
  approve: "approved",
  decline: "declined",
  archive: "archived",
};

function shortDate(fmt: Formatters, iso: string): string {
  return fmt.date(new Date(iso), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ProposalRow({
  proposal,
  onDecide,
  pending,
}: {
  proposal: AdminReadingGroupProposalDTO;
  onDecide: (decision: ReadingGroupProposalDecision) => void;
  pending: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const memberName =
    proposal.member?.name ??
    t("admin:adminReadingGroupProposals.unknownMember");
  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{proposal.book}</span>
          <AdminChip tone={FORMAT_TONE[proposal.format]} dot>
            {t(`admin:adminReadingGroupProposals.format.${proposal.format}`)}
          </AdminChip>
        </div>
        <div className={styles.rowMeta}>
          {t("admin:adminReadingGroupProposals.row.by", { name: memberName })}
          {" · "}
          {t("admin:adminReadingGroupProposals.row.maxPeople", {
            count: proposal.maxPeople,
          })}
        </div>
        {proposal.why && <div className={styles.rowNote}>“{proposal.why}”</div>}
        <div className={styles.rowDates}>
          {t("admin:adminReadingGroupProposals.row.sent", {
            date: shortDate(fmt, proposal.createdAt),
          })}
        </div>
      </div>
      <div className={styles.rowActions}>
        <AdminChip tone={STATUS_TONE[proposal.status]} dot>
          {t(`admin:adminReadingGroupProposals.status.${proposal.status}`)}
        </AdminChip>
        <div className={styles.rowActionButtons}>
          {ACTIONS.map(({ decision, status }) => (
            <Button
              key={decision}
              variant="ghost"
              size="sm"
              disabled={pending || proposal.status === status}
              onClick={() => onDecide(decision)}
            >
              {t(`admin:adminReadingGroupProposals.action.${decision}`)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function RowsSkeleton() {
  return (
    <div className={styles.rows}>
      {[0, 1, 2, 3].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={92}
          style={{ borderRadius: 22 }}
        />
      ))}
    </div>
  );
}

/**
 * Admin reading-group-proposal oversight: every "Start your own group" a member
 * has submitted — the book, their reason, format, and size — filterable by
 * format. Demo mode reads the colocated fixture; live mode calls
 * `GET /admin/reading-group-proposals` with pagination.
 */
export function AdminReadingGroupProposalsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<AdminReadingGroupFormatFilter>("all");
  const {
    proposals,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminReadingGroupProposals(filter);
  const { decide, pending } = useAdminReadingGroupProposalMutations();

  const handleDecide = (id: string, decision: ReadingGroupProposalDecision) => {
    decide(
      { id, decision },
      {
        onSuccess: () =>
          showToast(
            t(
              `admin:adminReadingGroupProposals.toast.${DECISION_STATUS[decision]}`,
            ),
            "success",
          ),
        onError: () =>
          showToast(t("admin:adminReadingGroupProposals.toast.error"), "error"),
      },
    );
  };

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminReadingGroupProposals.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:adminReadingGroupProposals.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:adminReadingGroupProposals.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminReadingGroupProposals.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={60}>
        <AdminTabs
          tabs={FILTERS.map((value) => ({
            id: value,
            label:
              value === "all"
                ? t("admin:adminReadingGroupProposals.filter.all")
                : t(`admin:adminReadingGroupProposals.format.${value}`),
          }))}
          active={filter}
          onChange={(value) =>
            setFilter(value as AdminReadingGroupFormatFilter)
          }
        />
      </FadeIn>

      <FadeIn delay={80}>
        {isLoading ? (
          <RowsSkeleton />
        ) : isError ? (
          <p className={styles.emptyLine}>
            {t("admin:adminReadingGroupProposals.error")}
          </p>
        ) : proposals.length === 0 ? (
          <p className={styles.emptyLine}>
            {t("admin:adminReadingGroupProposals.empty")}
          </p>
        ) : (
          <>
            <div className={styles.rows}>
              {proposals.map((proposal, index) => (
                <FadeIn key={proposal.id} delay={Math.min(index, 8) * 50}>
                  <ProposalRow
                    proposal={proposal}
                    pending={pending}
                    onDecide={(decision) => handleDecide(proposal.id, decision)}
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
                    ? t("admin:adminReadingGroupProposals.loadingMore")
                    : t("admin:adminReadingGroupProposals.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </FadeIn>
    </AdminShell>
  );
}
