import { FiEye, FiEyeOff } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";

/**
 * Sticky-bottom `.savebar` pill (global class, `persona-editor.css`). Every
 * pane it sits below (meta form, socials, each section, affiliations) still
 * saves via its OWN explicit button and OWN local `dirty` flag — per the
 * Phase 3 plan's Decision §2, this bar reflects state rather than owning an
 * aggregate save-all. None of those panes lifts its dirty/saving flag to a
 * shared signal today, so a truthful per-pane "saving…"/"unsaved" readout
 * isn't wireable yet without that follow-up (flagged in the Task 4 report) —
 * this renders a neutral, always-accurate "each section saves on its own"
 * note instead of a state it can't actually observe. The one thing it DOES
 * own outright: the docked-preview show/hide toggle, which flips `.ed`'s
 * `data-preview` attribute (wired by `SubprofileEditorPage`).
 */
export function EditorSavebar({
  previewOpen,
  onTogglePreview,
}: {
  previewOpen: boolean;
  onTogglePreview: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="savebar">
      <span>{t("subprofiles:editorSavebar.status")}</span>
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
    </div>
  );
}
