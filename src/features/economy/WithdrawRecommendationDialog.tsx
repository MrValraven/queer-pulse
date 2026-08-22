import { ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useWithdrawRecommendation } from "./api/useWithdrawRecommendation";

/**
 * Confirm step for taking your own landlord recommendation back down
 * (`DELETE /landlords/:slug/recommendations/mine`). A recommendation is a
 * public rating of a named real person, so removal is destructive enough to
 * deserve a confirm rather than a one-tap button.
 *
 * It owns the mutation so the calling page keeps only the open/closed flag.
 * The dialog stays open, and the recommendation stays on screen, until the
 * server answers: success closes it and toasts, failure closes it and reports
 * the real reason. Nothing is removed ahead of the response.
 */
export function WithdrawRecommendationDialog({
  slug,
  landlordName,
  isOpen,
  onClose,
}: {
  slug: string;
  landlordName: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const withdrawRecommendation = useWithdrawRecommendation(slug);

  function handleConfirm() {
    withdrawRecommendation.mutate(undefined, {
      onSuccess: () => {
        onClose();
        showToast(
          t("economy:landlordPage.toast.recommendationWithdrawn"),
          "success",
        );
      },
      onError: (error) => {
        onClose();
        showToast(
          describeError(
            t("economy:landlordPage.toast.withdrawFailed"),
            error,
            t("shared:apiError.tryAgainTail"),
          ),
          "error",
        );
      },
    });
  }

  return (
    <ConfirmDialog
      open={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={t("economy:landlordPage.withdraw.confirmTitle")}
      description={t("economy:landlordPage.withdraw.confirmBody", {
        name: landlordName,
      })}
      tone="destructive"
      loading={withdrawRecommendation.isPending}
      confirmLabel={t("economy:landlordPage.withdraw.confirmCta")}
    />
  );
}
