import { useId, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button, ConfirmDialog } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { LeadDTO } from "./api/leads.types";
import { useDeleteLead } from "./api/useLeadMutations";
import { leadFieldErrorOf, type LeadFieldError } from "./leadForm.model";
import { LeadRefusalLine } from "./LeadRefusalLine";
import styles from "./AdminLead.module.css";

/**
 * Delete lead, at the foot of the page: a bordered danger zone that says
 * the lead and its whole history go for good, and a confirm dialog that
 * opens with focus on Cancel. Once deleted, the list opens and a toast
 * names the lead. A refusal shows inside the dialog.
 */
export function LeadDeleteSection({ lead }: { lead: LeadDTO }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const headingId = useId();
  const deleteLead = useDeleteLead();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [refusal, setRefusal] = useState<LeadFieldError | null>(null);

  const openConfirm = () => {
    setRefusal(null);
    setIsConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (!deleteLead.isPending) setIsConfirmOpen(false);
  };

  const confirmDelete = () => {
    if (deleteLead.isPending) return;
    const name = lead.name;
    setRefusal(null);
    deleteLead.mutate(
      { leadId: lead.id },
      {
        onSuccess: () => {
          showToast(t("admin:leads.toast.deleted", { name }), "success");
          void navigate(routes.adminLeads, { replace: true });
        },
        onError: (cause) => setRefusal(leadFieldErrorOf(cause)),
      },
    );
  };

  return (
    <section className={styles.dangerZone} aria-labelledby={headingId}>
      <div className={styles.dangerText}>
        <h2 id={headingId} className={styles.dangerHeading}>
          {t("admin:leads.delete.heading")}
        </h2>
        <p className={styles.dangerBody}>{t("admin:leads.delete.body")}</p>
      </div>
      <Button variant="danger" onClick={openConfirm}>
        <FiTrash2 aria-hidden />
        {t("admin:leads.delete.cta")}
      </Button>
      <AnimatePresence>
        {isConfirmOpen && (
          <ConfirmDialog
            open
            tone="destructive"
            initialFocus="cancel"
            loading={deleteLead.isPending}
            title={t("admin:leads.delete.confirmTitle", { name: lead.name })}
            description={t("admin:leads.delete.confirmBody", {
              name: lead.name,
            })}
            confirmLabel={t("admin:leads.delete.confirmCta")}
            onClose={closeConfirm}
            onConfirm={confirmDelete}
          >
            <LeadRefusalLine error={refusal} />
          </ConfirmDialog>
        )}
      </AnimatePresence>
    </section>
  );
}
