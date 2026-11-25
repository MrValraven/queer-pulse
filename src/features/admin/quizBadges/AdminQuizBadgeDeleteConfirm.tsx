import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../../shared/components/feedback/useToast";
import { ConfirmDialog } from "../../../shared/components/ui";
import type { QuizBadgeDefinitionDTO } from "../../../shared/contracts/quizWinBadges";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { quizWinBadgeErrorText } from "../../quizshow/winBadges/quizWinBadgeErrors";
import { quizBadgeTextIn } from "../../quizshow/winBadges/quizWinBadgeText";
import { focusHeadingOnceFocusDrops } from "../ui/adminListPageHelpers";
import { quizBadgesAdminKeys } from "./api/quizBadgesAdminKeys";
import { useDeleteQuizBadge } from "./api/useQuizBadgeLibrary";

/**
 * Asks before deleting a badge nobody holds. A refusal toasts its reason and
 * reloads the library, so the row shows what the server holds now (a win
 * given since the list loaded takes Delete badge away). After a delete,
 * focus moves to the page heading named by `headingId`. Mount it inside
 * `<AnimatePresence>`.
 */
export function AdminQuizBadgeDeleteConfirm({
  definition,
  headingId,
  onClose,
}: {
  definition: QuizBadgeDefinitionDTO;
  headingId: string;
  onClose: () => void;
}) {
  const { t, language } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const deleteBadge = useDeleteQuizBadge();

  const confirmDelete = async () => {
    if (deleteBadge.isPending) return;
    try {
      await deleteBadge.mutateAsync({ definitionId: definition.id });
    } catch (error) {
      onClose();
      showToast(quizWinBadgeErrorText(error, t, fmt), "error");
      void queryClient.invalidateQueries({
        queryKey: quizBadgesAdminKeys.root,
      });
      return;
    }
    onClose();
    showToast(t("quizshow:winBadges.admin.library.deleted"), "success");
    focusHeadingOnceFocusDrops(headingId);
  };

  return (
    <ConfirmDialog
      open
      tone="destructive"
      initialFocus="cancel"
      loading={deleteBadge.isPending}
      title={t("quizshow:winBadges.admin.library.deleteTitle", {
        name: quizBadgeTextIn(definition.name, language),
      })}
      description={t("quizshow:winBadges.admin.library.deleteBody")}
      confirmLabel={t("quizshow:winBadges.admin.library.delete")}
      cancelLabel={t("quizshow:winBadges.admin.library.keep")}
      onConfirm={() => void confirmDelete()}
      onClose={onClose}
    />
  );
}
