import { ConfirmDialog } from "../../shared/components/ui";
import { intlLocale } from "../../shared/i18n/locale";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPlaylistPersonView } from "./api/studio.adapters";

/** Names the editors a credit change removes before it is sent again with
 *  the owner's consent. Their tracks stay. Mount inside AnimatePresence. */
export function StudioPlaylistCreditChangeConfirm({
  editors,
  isBusy,
  onConfirm,
  onCancel,
}: {
  editors: StudioPlaylistPersonView[];
  isBusy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t, language } = useTranslation();
  const names = new Intl.ListFormat(intlLocale(language), {
    style: "long",
    type: "conjunction",
  }).format(editors.map((editor) => editor.name));
  return (
    <ConfirmDialog
      open
      tone="destructive"
      loading={isBusy}
      title={t("studio:playlist.creditChange.title")}
      description={
        editors.length > 0
          ? t("studio:playlist.creditChange.body", {
              names,
              count: editors.length,
            })
          : t("studio:playlist.creditChange.bodyUnnamed")
      }
      confirmLabel={t("studio:playlist.creditChange.confirmCta")}
      onClose={() => {
        if (!isBusy) onCancel();
      }}
      onConfirm={onConfirm}
    />
  );
}
