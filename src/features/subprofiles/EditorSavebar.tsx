import { FiEye, FiEyeOff } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { PendingChangesList } from "./PendingChangesList";

/**
 * Sticky-bottom `.savebar` pill (global class, `persona-editor.css`), now the
 * ONE global save for the whole editor. It reads the shared editor context: a
 * live itemized `pending` list of everything changed across all panes, a single
 * "Save all" that fans out to every dirty area's mutation, and "Discard all".
 * When nothing is dirty it falls back to the neutral status note. It also still
 * owns the docked-preview show/hide toggle (flips `.ed`'s `data-preview`).
 */
export function EditorSavebar({
  previewOpen,
  onTogglePreview,
}: {
  previewOpen: boolean;
  onTogglePreview: () => void;
}) {
  const { t } = useTranslation();
  const { pending, dirty, saving, canSave, saveAll, discardAll } =
    useSubprofileEditorContext();

  const previewToggle = (
    <Button
      variant="ghost"
      size="sm"
      onClick={onTogglePreview}
      aria-pressed={previewOpen}
    >
      {previewOpen ? (
        <FiEyeOff size={16} aria-hidden />
      ) : (
        <FiEye size={16} aria-hidden />
      )}
      {previewOpen
        ? t("subprofiles:editorSavebar.hidePreview")
        : t("subprofiles:editorSavebar.showPreview")}
    </Button>
  );

  if (!dirty) {
    return (
      <div className="savebar">
        <span>{t("subprofiles:editorSavebar.status")}</span>
        {previewToggle}
      </div>
    );
  }

  return (
    <div className="savebar savebar-dirty">
      <div className="savebar-changes">
        <span className="savebar-heading">{t("subprofiles:pending.heading")}</span>
        <PendingChangesList pending={pending} />
      </div>
      <div className="savebar-actions">
        {previewToggle}
        <Button variant="ghost" size="sm" onClick={discardAll} disabled={saving}>
          {t("subprofiles:pending.discardAll")}
        </Button>
        <Button
          variant="primary"
          onClick={() => void saveAll()}
          disabled={saving || !canSave}
        >
          {saving
            ? t("subprofiles:pending.saving")
            : t("subprofiles:pending.saveAll", { count: pending.length })}
        </Button>
      </div>
    </div>
  );
}
