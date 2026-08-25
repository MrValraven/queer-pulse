import { Button, Modal } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import tabStyles from "../pieceTabs.module.css";

export interface RestoreVersionModalProps {
  versionLabel: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Confirms rolling the draft back to an earlier version. The reassurance
 * copy matters here: restoring is NOT destructive server-side (it snapshots
 * "Before restore" first — see the Wave E backend review), so the modal says
 * so plainly rather than reading like a scary irreversible action.
 */
export function RestoreVersionModal({
  versionLabel,
  isPending,
  onClose,
  onConfirm,
}: RestoreVersionModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      title={t("magazine:write.versions.restoreModal.title", {
        label: versionLabel,
      })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("magazine:write.versions.restoreModal.cancel")}
          </Button>
          <Button variant="plum" onClick={onConfirm} disabled={isPending}>
            {isPending
              ? t("magazine:write.versions.restoreModal.restoring")
              : t("magazine:write.versions.restoreModal.confirm")}
          </Button>
        </>
      }
    >
      <p className={tabStyles.tiny}>
        {t("magazine:write.versions.restoreModal.body")}
      </p>
    </Modal>
  );
}
