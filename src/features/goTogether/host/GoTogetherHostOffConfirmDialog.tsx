import { ConfirmDialog } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";

export interface GoTogetherHostOffConfirmDialogProps {
  open: boolean;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Confirms switching Go together off on a gathering whose config is saved as
 * enabled (PRD-416). Members waiting for a group are told there is no group
 * this time, and switching it back on later starts fresh: nobody is revived.
 * Cancel leaves the switch on.
 */
export function GoTogetherHostOffConfirmDialog({
  open,
  isPending,
  onCancel,
  onConfirm,
}: GoTogetherHostOffConfirmDialogProps) {
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      open={open}
      onClose={onCancel}
      onConfirm={onConfirm}
      loading={isPending}
      tone="destructive"
      initialFocus="cancel"
      title={t("goTogether:host.offConfirm.title")}
      description={t("goTogether:host.offConfirm.description")}
      confirmLabel={t("goTogether:host.offConfirm.confirm")}
      cancelLabel={t("goTogether:host.offConfirm.cancel")}
    />
  );
}
