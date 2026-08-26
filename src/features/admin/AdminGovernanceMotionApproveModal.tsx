import { useState } from "react";
import {
  Button,
  DatePicker,
  FormField,
  Modal,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAdminGovernanceMotionApprove } from "../governance/api/useGovernanceProposals";
import type { GovernanceProposalDTO } from "../governance/api/governanceProposals.api";
import styles from "./AdminGovernancePage.module.css";

/**
 * Approving a screened motion means opening it for voting, so the reviewer
 * has to say when that vote runs. Both ends come from the shared
 * `DatePicker` rather than raw `datetime-local` inputs, so the field is
 * keyboard-typeable, locale-aware, and consistent with every other date in
 * the admin console.
 */
export function AdminGovernanceMotionApproveModal({
  motion,
  onClose,
}: {
  motion: GovernanceProposalDTO;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const approve = useAdminGovernanceMotionApprove();
  const [opensAt, setOpensAt] = useState<string | null>(null);
  const [closesAt, setClosesAt] = useState<string | null>(null);

  const isWindowOrdered =
    !!opensAt &&
    !!closesAt &&
    new Date(closesAt).getTime() > new Date(opensAt).getTime();
  const canSubmit = isWindowOrdered && !approve.isPending;

  const submit = () => {
    if (!opensAt || !closesAt) {
      showToast(t("admin:governance.motions.approve.validation"), "error");
      return;
    }
    if (!isWindowOrdered) {
      showToast(t("admin:governance.motions.approve.orderError"), "error");
      return;
    }
    approve.mutate(
      {
        motionId: motion.id,
        body: {
          opensAt: new Date(opensAt).toISOString(),
          closesAt: new Date(closesAt).toISOString(),
        },
      },
      {
        onSuccess: () => {
          onClose();
          showToast(t("admin:governance.motions.approve.saved"), "success");
        },
        onError: () =>
          showToast(t("admin:governance.motions.approve.error"), "error"),
      },
    );
  };

  const opensLabel = t("admin:governance.motions.approve.opensAt");
  const closesLabel = t("admin:governance.motions.approve.closesAt");

  return (
    <Modal
      eyebrow={t("admin:governance.motions.approve.eyebrow")}
      title={t("admin:governance.motions.approve.title")}
      sub={t("admin:governance.motions.approve.sub")}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            disabled={approve.isPending}
          >
            {t("admin:governance.motions.approve.cancel")}
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={submit}
            disabled={!canSubmit}
          >
            {approve.isPending
              ? t("admin:governance.motions.approve.saving")
              : t("admin:governance.motions.approve.save")}
          </Button>
        </>
      }
    >
      <p className={styles.cardSub}>{motion.title}</p>
      <div className={styles.editGrid}>
        <FormField label={opensLabel} required>
          <DatePicker
            mode="datetime"
            label={opensLabel}
            value={opensAt}
            onChange={setOpensAt}
          />
        </FormField>
        <FormField label={closesLabel} required>
          <DatePicker
            mode="datetime"
            label={closesLabel}
            value={closesAt}
            onChange={setClosesAt}
          />
        </FormField>
      </div>
    </Modal>
  );
}
