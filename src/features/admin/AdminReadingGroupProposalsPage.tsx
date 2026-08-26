import { useState } from "react";
import {
  Button,
  FadeIn,
  SegmentedControl,
  SkeletonLine,
} from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { AdminPageHeader, AdminTabs } from "./ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import {
  useAdminReadingGroupProposals,
  type AdminReadingGroupFormatFilter,
  type AdminReadingGroupStatusFilter,
} from "./api/useAdminReadingGroupProposals";
import { useAdminReadingGroupProposalMutations } from "./api/useAdminReadingGroupProposalMutations";
import type {
  AdminReadingGroupProposalDTO,
  ReadingGroupProposalDecision,
  ReadingGroupProposalStatus,
} from "./api/adminReadingGroupProposals.api";
import { AdminReadingGroupProposalRow } from "./AdminReadingGroupProposalRow";
import { AdminReadingGroupDeclineModal } from "./AdminReadingGroupDeclineModal";
import styles from "./AdminSubmissionList.module.css";

const STATUS_TABS: AdminReadingGroupStatusFilter[] = [
  "pending",
  "approved",
  "declined",
  "archived",
  "all",
];

const FORMAT_FILTERS: AdminReadingGroupFormatFilter[] = [
  "all",
  "In-person",
  "Online",
  "Either",
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
 * has submitted, filterable by decision state and by format.
 *
 * It opens on what still needs a decision, because approving now CREATES the
 * community the member proposed and tells them, and declining sends them the
 * reason. A proposal left pending is a member waiting.
 *
 * Demo mode reads the colocated fixture; live mode calls
 * `GET /admin/reading-group-proposals` with pagination.
 */
export function AdminReadingGroupProposalsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] =
    useState<AdminReadingGroupStatusFilter>("pending");
  const [formatFilter, setFormatFilter] =
    useState<AdminReadingGroupFormatFilter>("all");
  const [declining, setDeclining] =
    useState<AdminReadingGroupProposalDTO | null>(null);
  const {
    proposals,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminReadingGroupProposals(formatFilter, statusFilter);
  const { decide, pending } = useAdminReadingGroupProposalMutations();

  const runDecision = (
    id: string,
    decision: ReadingGroupProposalDecision,
    note?: string,
  ) => {
    decide(
      { id, decision, note },
      {
        onSuccess: () => {
          setDeclining(null);
          showToast(
            t(
              `admin:adminReadingGroupProposals.toast.${DECISION_STATUS[decision]}`,
            ),
            "success",
          );
        },
        onError: () =>
          showToast(t("admin:adminReadingGroupProposals.toast.error"), "error"),
      },
    );
  };

  const handleDecide = (
    proposal: AdminReadingGroupProposalDTO,
    decision: ReadingGroupProposalDecision,
  ) => {
    // A decline carries a required reason the proposer reads, so it asks for
    // the words before it sends anything.
    if (decision === "decline") {
      setDeclining(proposal);
      return;
    }
    runDecision(proposal.id, decision);
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
          tabs={STATUS_TABS.map((value) => ({
            id: value,
            label: t(`admin:adminReadingGroupProposals.statusTab.${value}`),
          }))}
          active={statusFilter}
          onChange={(value) =>
            setStatusFilter(value as AdminReadingGroupStatusFilter)
          }
        />
        <SegmentedControl
          label={t("admin:adminReadingGroupProposals.filter.formatLabel")}
          options={FORMAT_FILTERS.map((value) => ({
            value,
            label:
              value === "all"
                ? t("admin:adminReadingGroupProposals.filter.all")
                : t(`admin:adminReadingGroupProposals.format.${value}`),
          }))}
          value={formatFilter}
          onChange={(value) =>
            setFormatFilter(value as AdminReadingGroupFormatFilter)
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
                  <AdminReadingGroupProposalRow
                    proposal={proposal}
                    pending={pending}
                    onDecide={(decision) => handleDecide(proposal, decision)}
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

      {declining && (
        <AdminReadingGroupDeclineModal
          book={declining.book}
          isPending={pending}
          onSubmit={(reason) => runDecision(declining.id, "decline", reason)}
          onClose={() => setDeclining(null)}
        />
      )}
    </AdminShell>
  );
}
