import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { AdminSubmissionQueue } from "./AdminSubmissionQueue";
import { AdminIntakeRow } from "./AdminIntakeRow";
import { useAdminIntakeMutations } from "./api/useAdminIntakeMutations";
import type { useAdminIntakes } from "./api/useAdminIntakes";
import type { AdminIntakeDTO } from "./api/adminIntakes.api";

export type AdminIntakesQuery = ReturnType<typeof useAdminIntakes>;

/**
 * Renders one already-fetched intake list. The query is passed in rather than
 * started here so the same list can be shown twice on the same page (the
 * "waiting" landing view and the filtered browse view) without either one
 * firing a second request for rows the other already holds.
 */
export function AdminIntakeList({
  query,
  emptyText,
}: {
  query: AdminIntakesQuery;
  emptyText?: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { triage, pending } = useAdminIntakeMutations();

  const markReviewed = (intake: AdminIntakeDTO) => {
    triage(
      { id: intake.id, status: "reviewed" },
      {
        onSuccess: () =>
          showToast(t("admin:adminIntakes.toast.reviewed"), "success"),
        onError: () => showToast(t("admin:adminIntakes.toast.error"), "error"),
      },
    );
  };

  return (
    <AdminSubmissionQueue<AdminIntakeDTO>
      items={query.intakes}
      itemKey={(intake) => intake.id}
      renderItem={(intake) => (
        <AdminIntakeRow
          intake={intake}
          pending={pending}
          onMarkReviewed={() => markReviewed(intake)}
        />
      )}
      isLoading={query.isLoading}
      isError={query.isError}
      errorText={t("admin:adminIntakes.error")}
      emptyText={emptyText ?? t("admin:adminIntakes.empty")}
      hasNextPage={Boolean(query.hasNextPage)}
      isFetchingNextPage={query.isFetchingNextPage}
      onLoadMore={() => void query.fetchNextPage()}
      loadMoreLabel={t("admin:adminIntakes.loadMore")}
      loadingMoreLabel={t("admin:adminIntakes.loadingMore")}
    />
  );
}
