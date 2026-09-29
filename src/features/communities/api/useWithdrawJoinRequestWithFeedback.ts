import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../shared/api/client";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useWithdrawJoinRequest } from "./useCommunityJoin";

/**
 * PRD-148. Withdraw the caller's own pending join request and tell them how
 * it went. Shared by the detail hero and the gate card, so both surfaces say
 * the same thing about the same outcome.
 *
 * `withdraw(onSettled)` takes the caller's close-the-confirm callback: the
 * confirm dialog stays mounted until the DELETE settles, so its `pending`
 * state renders and a second tap cannot fire a second request.
 */
export function useWithdrawJoinRequestWithFeedback(slug: string) {
  const { t } = useTranslation();
  const format = useFormat();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const withdrawMutation = useWithdrawJoinRequest(slug);

  // A 409 means a decision landed first, so both surfaces that show the
  // pending state are now stale. `useWithdrawJoinRequest` refreshes them only
  // on success; refreshing here too is what takes the pending line and its
  // Withdraw button down, so a second tap cannot hit the same 409 again.
  // `["community", slug]` is a prefix of the detail key, which also carries
  // the language.
  const refreshDecidedRequest = () => {
    void queryClient.invalidateQueries({
      queryKey: ["community-gate-card", slug],
    });
    void queryClient.invalidateQueries({ queryKey: ["community", slug] });
  };

  const onSuccess = () =>
    showToast(t("communities:detail.withdraw.doneToast"), "success");

  // The server answers 409 ONLY when a decision landed first, and it says
  // which. An approved applicant is already a member, and a declined one
  // needs to know a reapply date now exists, so each gets its own line. The
  // generic error is kept for a genuine failure.
  const onError = (error: Error) => {
    if (error instanceof ApiError && error.status === 409) {
      refreshDecidedRequest();
      const body = error.data as
        { code?: string; reapplyAfter?: string } | undefined;
      if (body?.code === "JOIN_REQUEST_ALREADY_ANSWERED") {
        showToast(
          t("communities:detail.withdraw.alreadyDeclinedToast", {
            date: body.reapplyAfter
              ? format.date(new Date(body.reapplyAfter))
              : "",
          }),
          "info",
        );
        return;
      }
      showToast(
        t("communities:detail.withdraw.alreadyApprovedToast"),
        "success",
      );
      return;
    }
    showToast(t("communities:common.error"), "error");
  };

  const withdraw = (onSettled: () => void) => {
    withdrawMutation.mutate(undefined, { onSuccess, onError, onSettled });
  };

  return { withdraw, mutation: withdrawMutation };
}
