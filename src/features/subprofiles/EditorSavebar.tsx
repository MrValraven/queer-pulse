import { useState, type CSSProperties } from "react";
import { FiEye, FiEyeOff, FiSmartphone } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useMediaQuery } from "../../shared/hooks";
import { useVisualViewportInset } from "../../shared/hooks/useVisualViewportInset";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { mediaMax } from "../../shared/theme/breakpoints";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { PendingChangesList } from "./PendingChangesList";
import { MobilePersonaPreview } from "./MobilePersonaPreview";
import { PendingCountLabel } from "./EditorSavebarSummary";
import { EditorSavebarPhone } from "./EditorSavebarPhone";
import { metaBlockReasonKey } from "./editorSavebarBlockReason";

/** Phones: the SAME 760px viewport cut `SubprofileEditorShell` mounts
 *  `EditorPaneSwitcher` behind. The phone row hands Preview to that switcher,
 *  so the two must agree or a band of widths would lose Preview altogether. */
const PHONE_QUERY = mediaMax("lg");

/**
 * Sticky-bottom `.savebar` pill (global class, `persona-editor.css`), now the
 * ONE global save for the whole editor. It reads the shared editor context: a
 * live itemized `pending` list of everything changed across all panes, a single
 * "Save all" that fans out to every dirty area's mutation, and "Discard all".
 * When nothing is dirty it falls back to the neutral status note. It also still
 * owns the docked-preview show/hide toggle (flips `.ed`'s `data-preview`).
 *
 * Phones (≤760px) get `EditorSavebarPhone` instead: one compact row, with the
 * itemized list folded behind a "{count} unsaved" toggle and Preview moved up
 * into the pane switcher. The idle bar is not rendered there at all: with
 * Preview gone it would hold only "No unsaved changes", a sticky strip over
 * the form on the smallest screen that says nothing actionable. The dirty row
 * appears on the first edit, and a save confirms itself with a toast.
 */
export function EditorSavebar({
  previewOpen,
  onTogglePreview,
}: {
  previewOpen: boolean;
  onTogglePreview: () => void;
}) {
  const { t } = useTranslation();
  const { meta, pending, dirty, saving, canSave, saveAll, discardAll } =
    useSubprofileEditorContext();
  // The docked preview column is `display:none` ≤860px, so on phones/tablets we
  // offer the same live preview in a bottom sheet instead (Task 4).
  const isMobile = useMediaQuery("(max-width: 860px)");
  const isPhone = useMediaQuery(PHONE_QUERY);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  // The savebar is `position: sticky; bottom: 0`. On iOS the on-screen keyboard
  // overlays the layout viewport, so a bottom-pinned bar hides behind it, so lift
  // it by the keyboard's overlap. 0px (and no transform) whenever no keyboard.
  const keyboardInset = useVisualViewportInset();
  const savebarStyle: CSSProperties | undefined = keyboardInset
    ? { transform: `translateY(${-keyboardInset}px)` }
    : undefined;

  // When the save is blocked despite having changes, `canSave` is false because
  // of a meta gate: say WHICH one and where to fix it, so the disabled Save
  // button isn't a silent dead end.
  const blockReasonKey = dirty && !canSave ? metaBlockReasonKey(meta) : null;

  if (isPhone) {
    return dirty ? (
      <EditorSavebarPhone
        style={savebarStyle}
        blockReasonKey={blockReasonKey}
      />
    ) : null;
  }

  // The docked preview is hidden by CSS ≤860px (its column collapses), which
  // makes this toggle a no-op there; the `.savebar-preview-toggle` wrapper is
  // hidden by the same container query so it isn't a dead control. See
  // `persona-editor.css`.
  const previewToggle = (
    <span className="savebar-preview-toggle">
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
    </span>
  );

  // Tablet preview entry point (761px to 860px; phones returned above and use
  // the switcher's button): the docked column and its toggle are hidden
  // ≤860px, so this opens the same preview tree in a sheet.
  const mobilePreviewButton = isMobile && (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setMobilePreviewOpen(true)}
    >
      <FiSmartphone size={16} aria-hidden />
      {t("subprofiles:editorSavebar.mobilePreview")}
    </Button>
  );

  const mobilePreview = mobilePreviewOpen && (
    <MobilePersonaPreview onClose={() => setMobilePreviewOpen(false)} />
  );

  if (!dirty) {
    return (
      <>
        <div className="savebar" style={savebarStyle}>
          <span>{t("subprofiles:editorSavebar.status")}</span>
          {mobilePreviewButton}
          {previewToggle}
        </div>
        {mobilePreview}
      </>
    );
  }

  return (
    <>
      <div className="savebar savebar-dirty" style={savebarStyle}>
        <div className="savebar-changes">
          <span className="savebar-heading">
            {t("subprofiles:pending.heading")}
          </span>
          <PendingChangesList pending={pending} />
        </div>
        <div className="savebar-actions">
          {blockReasonKey && (
            <span className="savebar-block" role="status">
              {t(blockReasonKey)}
            </span>
          )}
          {mobilePreviewButton}
          {previewToggle}
          <Button
            variant="ghost"
            size="sm"
            onClick={discardAll}
            disabled={saving}
          >
            {t("subprofiles:pending.discardAll")}
          </Button>
          <Button
            variant="primary"
            onClick={() => void saveAll()}
            disabled={saving || !canSave}
          >
            {saving ? (
              t("subprofiles:pending.saving")
            ) : (
              <PendingCountLabel
                i18nKey="subprofiles:pending.saveAll"
                count={pending.length}
              />
            )}
          </Button>
        </div>
      </div>
      {mobilePreview}
    </>
  );
}
