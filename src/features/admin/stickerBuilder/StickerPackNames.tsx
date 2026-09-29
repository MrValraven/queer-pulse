import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { AdminStickerPackResponse } from "../../../shared/contracts/contracts";
import { StickerPackNameEditor } from "./StickerPackNameEditor";

/**
 * The pack's two names in the workspace header: the English name as the page
 * heading, then the optional Portuguese name on a quieter line below it. Each
 * one is edited in place (see `StickerPackNameEditor`).
 *
 * The Portuguese line's accessible name starts with the text it shows, so a
 * member using voice control can say what they see. A saved name adds a
 * visually hidden "Edit" after it; the empty line already reads as the action.
 */
export function StickerPackNames({
  pack,
  onRename,
  onRenamePt,
}: {
  pack: AdminStickerPackResponse;
  onRename: (name: string) => void;
  /** Saves the Portuguese name, or clears it with `null`. */
  onRenamePt: (namePt: string | null) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <StickerPackNameEditor
        packId={pack.id}
        value={pack.name}
        variant="title"
        displayText={pack.name}
        buttonLabel={t("admin:stickerPacks.header.renameLabel", {
          name: pack.name,
        })}
        inputLabel={t("admin:stickerPacks.header.nameInputLabel")}
        hint={t("admin:stickerPacks.header.renameHint")}
        onSave={(name) => {
          if (name !== null) onRename(name);
        }}
      />
      <StickerPackNameEditor
        packId={pack.id}
        value={pack.namePt}
        variant="secondary"
        displayText={
          pack.namePt
            ? t("admin:stickerPacks.header.namePtValue", {
                namePt: pack.namePt,
              })
            : t("admin:stickerPacks.header.namePtEmpty")
        }
        hiddenEditLabel={
          pack.namePt
            ? t("admin:stickerPacks.header.namePtEditSuffix")
            : undefined
        }
        inputLabel={t("admin:stickerPacks.header.namePtLabel")}
        hint={t("admin:stickerPacks.header.namePtHint")}
        lang="pt"
        onSave={onRenamePt}
      />
    </>
  );
}
