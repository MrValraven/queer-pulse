import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { AdminSubmissionQueue } from "./AdminSubmissionQueue";
import { AdminInquiryRow } from "./AdminInquiryRow";
import { useAdminInquiryMutations } from "./api/useAdminInquiryMutations";
import type { useAdminInquiries } from "./api/useAdminInquiries";
import type { AdminInquiryDTO, InquiryStatus } from "./api/adminInquiries.api";

export type AdminInquiriesQuery = ReturnType<typeof useAdminInquiries>;

/** Renders one already-fetched inquiry list. Like `AdminIntakeList`, the query
 *  is owned by the page so the waiting view and the browse view share a cache. */
export function AdminInquiryList({
  query,
  emptyText,
}: {
  query: AdminInquiriesQuery;
  emptyText?: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { setStatus, pending } = useAdminInquiryMutations();

  const changeStatus = (id: string, status: InquiryStatus) => {
    setStatus(
      { id, status },
      {
        onSuccess: () =>
          showToast(
            status === "handled"
              ? t("admin:adminIntakes.toast.handled")
              : t("admin:adminIntakes.toast.reopened"),
            "success",
          ),
        onError: () => showToast(t("admin:adminIntakes.toast.error"), "error"),
      },
    );
  };

  return (
    <AdminSubmissionQueue<AdminInquiryDTO>
      items={query.inquiries}
      itemKey={(inquiry) => inquiry.id}
      renderItem={(inquiry) => (
        <AdminInquiryRow
          inquiry={inquiry}
          pending={pending}
          onSetStatus={(status) => changeStatus(inquiry.id, status)}
        />
      )}
      isLoading={query.isLoading}
      isError={query.isError}
      errorText={t("admin:adminIntakes.inquiryError")}
      emptyText={emptyText ?? t("admin:adminIntakes.inquiryEmpty")}
      hasNextPage={Boolean(query.hasNextPage)}
      isFetchingNextPage={query.isFetchingNextPage}
      onLoadMore={() => void query.fetchNextPage()}
      loadMoreLabel={t("admin:adminIntakes.loadMore")}
      loadingMoreLabel={t("admin:adminIntakes.loadingMore")}
    />
  );
}
