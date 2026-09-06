import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { AdminModal } from "./ui";
import { useDeleteGlossaryTerm } from "./api/useAdminResourceGuideMutations";
import type { AdminGlossaryTermDTO } from "./api/adminResourceGuides.api";
import styles from "./AdminGlossaryPage.module.css";

/**
 * Confirms deleting one term. Deletion is admin-only on the backend (the
 * `@Delete` handler drops the class-level `resource_curator` grant), so a
 * curator sees this action fail rather than silently vanish a definition other
 * pages cross-reference.
 */
export function AdminGlossaryDeleteModal({
  term,
  onClose,
}: {
  term: AdminGlossaryTermDTO;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const deleteTerm = useDeleteGlossaryTerm();

  function confirmDelete() {
    deleteTerm.mutate(term.id, {
      onSuccess: () => {
        showToast(
          t("admin:adminGlossary.toast.deleted", { term: term.term }),
          "info",
        );
        onClose();
      },
      onError: (error) =>
        showToast(
          describeError(
            t("admin:adminGlossary.error.delete"),
            error,
            t("shared:apiError.tryAgainTail"),
          ),
          "error",
        ),
    });
  }

  return (
    <AdminModal
      eyebrow={term.slug}
      title={t("admin:adminGlossary.delete.title")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            disabled={deleteTerm.isPending}
          >
            {t("admin:adminGlossary.delete.confirmCta")}
          </Button>
        </>
      }
    >
      <p className={styles.deleteBody}>
        {t("admin:adminGlossary.delete.body", { term: term.term })}
      </p>
    </AdminModal>
  );
}
