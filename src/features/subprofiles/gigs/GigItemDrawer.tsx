import { useId, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { FiClock, FiX } from "react-icons/fi";
import { ConfirmDialog } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "../api/subprofiles.adapters";
import { ItemDrawerFooter } from "../ItemDrawerFooter";
import { ItemDrawerSettings } from "../ItemDrawerSettings";
import editorStyles from "../SubprofileEditor.module.css";
import { useDrawerDismiss } from "../useDrawerDismiss";
import { GigDrawerFields } from "./GigDrawerFields";
import { GigDrawerHistory } from "./GigDrawerHistory";
import { GigLivePreview } from "./GigLivePreview";
import { useGigDrawerDraft } from "./useGigDrawerDraft";
import styles from "./GigDrawer.module.css";

/**
 * Props of the gig drawer: the same shape as `SubprofileItemDrawer`, minus
 * the tattoo parts.
 */
export interface GigItemDrawerProps {
  /** The persona whose gig this is, threaded to the History modal. */
  subprofileId: string;
  section: SubprofileSectionView;
  /** Baseline draft: a copy of the row being edited, or
   *  `emptyItem(section.section)` for a new gig. */
  item: SubprofileItemView;
  isNew: boolean;
  /** Whether this section supports a spotlight item at all. */
  canFeature: boolean;
  /** The persona's display name, for the "Protect this work" record. */
  authorName: string;
  onSave: (item: SubprofileItemView) => void;
  onClose: () => void;
}

/**
 * The gig drawer: a bottom sheet (global `.drawer` shell from
 * `persona-editor.css`, portaled to `document.body`) built for a gig. From
 * 900px wide it is two columns: the form (name, date and doors, venue and
 * city, status, ticket and event links, poster) beside an aside holding the
 * live preview and then the settings rail (spotlight, collaborators,
 * protect). At phone width it is one column: the preview first (it folds
 * itself behind a toggle there), then the form, then the settings rail, then
 * the sticky footer.
 *
 * It edits a LOCAL draft; nothing reaches the section until Save. Cancel
 * discards at once, while the accidental dismissals (scrim tap, Escape, the
 * header close) ask first once anything has changed. The footer names the
 * Save blocker in words (title, date, ticket link, in that order) and
 * Cmd/Ctrl+Enter saves from any field. `SubprofileSectionEditor` commits the
 * saved draft with `commitGigDraft`.
 */
export function GigItemDrawer({
  subprofileId,
  section,
  item,
  isNew,
  canFeature,
  authorName,
  onSave,
  onClose,
}: GigItemDrawerProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);
  const { draft, patch, isDraftDirty, missingRequiredKey, save } =
    useGigDrawerDraft({ item, isNew, onSave });

  /** Dismissals that can happen by accident: ask before throwing work away. */
  function requestClose() {
    if (isDraftDirty) {
      setIsConfirmingDiscard(true);
      return;
    }
    onClose();
  }

  const dialogRef = useDrawerDismiss(requestClose);

  function handleShortcut(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey)) return;
    event.preventDefault();
    save();
  }

  return createPortal(
    <div
      className="scrim bottom"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- WAI-ARIA modal dialog: Cmd/Ctrl+Enter from any field inside saves it. */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleShortcut}
      >
        <div className="drawer-head">
          <h2 id={titleId}>
            {t(
              isNew
                ? "subprofiles:gigEditor.drawer.addTitle"
                : "subprofiles:gigEditor.drawer.editTitle",
            )}
          </h2>
          <div className={editorStyles.headActions}>
            {!isNew && (
              <button
                type="button"
                className={editorStyles.smallBtn}
                onClick={() => setIsHistoryOpen(true)}
              >
                <FiClock size={14} aria-hidden />
                {t("subprofiles:history.button")}
              </button>
            )}
            <button
              type="button"
              className={editorStyles.smallBtn}
              onClick={requestClose}
              aria-label={t("shared:modal.close")}
            >
              <FiX size={16} aria-hidden />
            </button>
          </div>
        </div>

        <div className="drawer-body">
          <div className={`drawer-main ${styles.main}`}>
            <GigDrawerFields draft={draft} onPatch={patch} />
          </div>
          <div className={styles.aside}>
            <GigLivePreview draft={draft} />
            <ItemDrawerSettings
              draft={draft}
              canFeature={canFeature}
              isNew={isNew}
              authorName={authorName}
              onPatch={patch}
            />
          </div>
        </div>

        <ItemDrawerFooter
          isNew={isNew}
          isDirty={isDraftDirty}
          missingRequiredKey={missingRequiredKey}
          saveNewLabelKey="subprofiles:gigEditor.add"
          saveChangesLabelKey="subprofiles:gigEditor.save"
          onCancel={onClose}
          onSave={save}
        />
      </div>

      {/* Both of these portal themselves to document.body through the shared
          Modal primitive, so nesting them here is harmless, and the modal
          stack keeps Escape from closing the drawer underneath them. */}
      <ConfirmDialog
        open={isConfirmingDiscard}
        tone="destructive"
        title={t("subprofiles:itemDrawer.discardTitle")}
        description={t("subprofiles:itemDrawer.discardBody")}
        confirmLabel={t("subprofiles:itemDrawer.discardConfirm")}
        cancelLabel={t("subprofiles:itemDrawer.discardKeep")}
        onConfirm={() => {
          setIsConfirmingDiscard(false);
          onClose();
        }}
        onClose={() => setIsConfirmingDiscard(false)}
      />
      {isHistoryOpen && (
        <GigDrawerHistory
          subprofileId={subprofileId}
          itemId={item.id}
          section={section.section}
          onCloseHistory={() => setIsHistoryOpen(false)}
          onCloseDrawer={onClose}
        />
      )}
    </div>,
    document.body,
  );
}
