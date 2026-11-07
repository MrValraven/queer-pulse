import { ConfirmDialog } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";

/**
 * Delete confirmation for one desk piece. Spells out what leaves with the
 * piece (the draft, its versions, its reader comments) and that the pitch it
 * was commissioned from returns to the inbox, because the backend does both
 * and an editor should know before confirming rather than after.
 */
export function DeletePieceDialog({
  title,
  loading,
  onClose,
  onConfirm,
}: {
  title: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      open
      tone="destructive"
      loading={loading}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("magazine:desk.deletePiece.title", { title })}
      description={t("magazine:desk.deletePiece.description")}
      confirmLabel={t("magazine:desk.deletePiece.confirm")}
    />
  );
}
