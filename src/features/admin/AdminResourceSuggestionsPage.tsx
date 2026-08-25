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
  useAdminResourceSuggestions,
  type AdminResourceSuggestionCategoryFilter,
} from "./api/useAdminResourceSuggestions";
import { useAdminResourceSuggestionMutations } from "./api/useAdminResourceSuggestionMutations";
import type {
  AdminResourceSuggestionDTO,
  ResourceListingCategory,
  ResourceSuggestionDecision,
  ResourceSuggestionStatus,
} from "./api/adminResourceSuggestions.api";
import styles from "./AdminSubmissionList.module.css";

const FILTERS: AdminResourceSuggestionCategoryFilter[] = [
  "all",
  "legal_aid",
  "sexual_health_testing",
];

const CATEGORY_TONE: Record<ResourceListingCategory, AdminTone> = {
  legal_aid: "violet",
  sexual_health_testing: "plum",
};

const STATUS_TONE: Record<ResourceSuggestionStatus, AdminTone> = {
  pending: "amber",
  approved: "jade",
  declined: "danger",
  archived: "ghost",
};

// Each action button, and the status its suggestion lands in — used to
// disable the button that matches the current status (no-op re-decision).
const ACTIONS: {
  decision: ResourceSuggestionDecision;
  status: ResourceSuggestionStatus;
}[] = [
  { decision: "approve", status: "approved" },
  { decision: "decline", status: "declined" },
  { decision: "archive", status: "archived" },
];

// The status each decision resolves to — for the confirmation toast key.
const DECISION_STATUS: Record<
  ResourceSuggestionDecision,
  ResourceSuggestionStatus
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

function SuggestionContact({
  suggestion,
}: {
  suggestion: AdminResourceSuggestionDTO;
}) {
  const contact = [suggestion.phone, suggestion.email, suggestion.website]
    .filter(Boolean)
    .join(" · ");
  if (!contact) return null;
  return <div className={styles.rowNote}>{contact}</div>;
}

function SuggestionRow({
  suggestion,
  onDecide,
  pending,
}: {
  suggestion: AdminResourceSuggestionDTO;
  onDecide: (decision: ResourceSuggestionDecision) => void;
  pending: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const memberName =
    suggestion.member?.name ??
    t("admin:adminResourceSuggestions.unknownMember");
  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{suggestion.name}</span>
          <AdminChip tone={CATEGORY_TONE[suggestion.category]} dot>
            {t(
              `admin:adminResourceSuggestions.category.${suggestion.category}`,
            )}
          </AdminChip>
        </div>
        <div className={styles.rowMeta}>
          {t("admin:adminResourceSuggestions.row.by", { name: memberName })}
        </div>
        <div className={styles.rowNote}>{suggestion.description}</div>
        <SuggestionContact suggestion={suggestion} />
        <div className={styles.rowDates}>
          {t("admin:adminResourceSuggestions.row.sent", {
            date: shortDate(fmt, suggestion.createdAt),
          })}
        </div>
      </div>
      <div className={styles.rowActions}>
        <AdminChip tone={STATUS_TONE[suggestion.status]} dot>
          {t(`admin:adminResourceSuggestions.status.${suggestion.status}`)}
        </AdminChip>
        <div className={styles.rowActionButtons}>
          {ACTIONS.map(({ decision, status }) => (
            <Button
              key={decision}
              variant="ghost"
              size="sm"
              disabled={pending || suggestion.status === status}
              onClick={() => onDecide(decision)}
            >
              {t(`admin:adminResourceSuggestions.action.${decision}`)}
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
 * Admin resource-suggestion review queue (CNT-14): every "Suggest a
 * resource" a member has submitted for Legal Aid / Sexual Health Testing —
 * filterable by category. Demo mode reads the colocated fixture; live mode
 * calls `GET /admin/resource-suggestions` with pagination. Approving here
 * only records the decision — it never auto-creates a `ResourceListing`;
 * publishing the real, verified listing stays a deliberate, separate act on
 * Resource listings.
 */
export function AdminResourceSuggestionsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [filter, setFilter] =
    useState<AdminResourceSuggestionCategoryFilter>("all");
  const {
    suggestions,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminResourceSuggestions(filter);
  const { decide, pending } = useAdminResourceSuggestionMutations();

  const handleDecide = (id: string, decision: ResourceSuggestionDecision) => {
    decide(
      { id, decision },
      {
        onSuccess: () =>
          showToast(
            t(
              `admin:adminResourceSuggestions.toast.${DECISION_STATUS[decision]}`,
            ),
            "success",
          ),
        onError: () =>
          showToast(t("admin:adminResourceSuggestions.toast.error"), "error"),
      },
    );
  };

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminResourceSuggestions.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:adminResourceSuggestions.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:adminResourceSuggestions.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminResourceSuggestions.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={60}>
        <AdminTabs
          tabs={FILTERS.map((value) => ({
            id: value,
            label:
              value === "all"
                ? t("admin:adminResourceSuggestions.filter.all")
                : t(`admin:adminResourceSuggestions.category.${value}`),
          }))}
          active={filter}
          onChange={(value) =>
            setFilter(value as AdminResourceSuggestionCategoryFilter)
          }
        />
      </FadeIn>

      <FadeIn delay={80}>
        {isLoading ? (
          <RowsSkeleton />
        ) : isError ? (
          <p className={styles.emptyLine}>
            {t("admin:adminResourceSuggestions.error")}
          </p>
        ) : suggestions.length === 0 ? (
          <p className={styles.emptyLine}>
            {t("admin:adminResourceSuggestions.empty")}
          </p>
        ) : (
          <>
            <div className={styles.rows}>
              {suggestions.map((suggestion, index) => (
                <FadeIn key={suggestion.id} delay={Math.min(index, 8) * 50}>
                  <SuggestionRow
                    suggestion={suggestion}
                    pending={pending}
                    onDecide={(decision) =>
                      handleDecide(suggestion.id, decision)
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
                    ? t("admin:adminResourceSuggestions.loadingMore")
                    : t("admin:adminResourceSuggestions.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </FadeIn>
    </AdminShell>
  );
}
