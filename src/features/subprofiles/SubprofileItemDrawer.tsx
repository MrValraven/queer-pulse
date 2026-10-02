import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { FiClock, FiX } from "react-icons/fi";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  SubprofileItemView,
  SubprofileSectionView,
  SubprofileView,
} from "./api/subprofiles.adapters";
import { SubprofileItemDrawerFields } from "./SubprofileItemDrawerFields";
import { useDrawerDismiss } from "./useDrawerDismiss";
import { SECTION_DRAWER_TITLE_KEYS } from "./subprofileEditor.data";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { ItemRevisionHistoryModal } from "./rights/ItemRevisionHistoryModal";
import { ItemDrawerSettings } from "./ItemDrawerSettings";
import { ItemDrawerFooter } from "./ItemDrawerFooter";
import { itemDrawerSaveState } from "./itemDrawerSave";
import styles from "./SubprofileEditor.module.css";

interface SubprofileItemDrawerProps {
  /** The persona whose item this is — threaded down to the "History" modal,
   *  which needs it to fetch/restore this item's revisions (Task 10). */
  subprofileId: string;
  section: SubprofileSectionView;
  /** Baseline draft — either a copy of the row being edited, or
   *  `emptyItem(section.section)` for a new item (see `SubprofileSectionEditor`). */
  item: SubprofileItemView;
  isNew: boolean;
  /** Whether this section supports a spotlight item at all (false for `links`). */
  canFeature: boolean;
  /** The persona's display name, threaded down for the "Protect this work"
   *  section's authorship record (only rendered for a saved item, see below). */
  authorName: string;
  onSave: (item: SubprofileItemView) => void;
  onClose: () => void;
}

/**
 * The item drawer (Task 5): a wide bottom-anchored `.drawer` sheet (global
 * classes from `persona-editor.css`, portaled to `document.body`) that rises
 * from the bottom edge. Its body splits in two on a wide screen: what the
 * piece IS (title, description, details — one readable column, in
 * `SubprofileItemDrawerFields`) beside how it's SHOWN and who shares it
 * (spotlight, collaborators, authorship record — the tinted
 * `ItemDrawerSettings` rail). On a phone the rail follows the fields. The
 * footer says in words why Save is or isn't ready (`ItemDrawerFooter`), and
 * `⌘/Ctrl + Enter` saves from any field.
 *
 * Edits a LOCAL draft copy — nothing reaches the section's working `rows`
 * list until Save. Cancel discards outright (an explicit choice), while the
 * accidental dismissals (scrim tap, Escape, the header close) ask first once
 * anything has been typed: on a phone a stray tap outside the sheet used to
 * throw away a finished poem or a six-field gig with no way back.
 * `SubprofileSectionEditor` applies the cross-item feature exclusivity when
 * it commits the saved draft into `rows`, then persists via `replaceSection`.
 */
export function SubprofileItemDrawer({
  subprofileId,
  section,
  item,
  isNew,
  canFeature,
  authorName,
  onSave,
  onClose,
}: SubprofileItemDrawerProps) {
  const { t } = useTranslation();
  const { reseedSection, getEditVersion, adoptEditVersion, markEditConflict } =
    useSubprofileEditorContext();
  const [draft, setDraft] = useState(item);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);
  const titleId = useId();

  // `draft` always starts as a copy of `item` and is only ever updated by
  // spreading over it, so key order is stable and a serialized compare is an
  // honest "has anything been typed yet".
  const isDraftDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(item),
    [draft, item],
  );

  /** Dismissals that can happen by accident: ask before throwing work away. */
  function requestClose() {
    if (isDraftDirty) {
      setIsConfirmingDiscard(true);
      return;
    }
    onClose();
  }

  const dialogRef = useDrawerDismiss(requestClose);

  // A restore rewrites the saved item server-side, which the drawer's local
  // `draft` state has no way to pick up, so a restore closes the history
  // modal AND this drawer together, rather than leaving a stale draft on
  // screen. It also carries the freshly-refetched persona (see
  // `useRestoreItemRevision`, `null` in demo mode where there is nothing to
  // reseed) straight into `reseedSection`, so the section list + docked
  // preview reflect the restore immediately and a later "Save all" reads the
  // restored rows as the baseline instead of PUTting the stale pre-restore
  // ones back over it.
  function closeHistoryAndDrawer(subprofile: SubprofileView | null) {
    if (subprofile) reseedSection(section.section, subprofile);
    setHistoryOpen(false);
    onClose();
  }

  // ENG-451: a restore refused because someone saved the persona meanwhile.
  // The conflict alert and its Reload live in the savebar, which this sheet
  // covers, so the modal and the drawer both close to put the alert in view.
  // Save stays off until the reload, so the drawer's draft could not be kept.
  function markConflictAndClose() {
    markEditConflict();
    setHistoryOpen(false);
    onClose();
  }

  function patch(p: Partial<SubprofileItemView>) {
    setDraft((cur) => ({ ...cur, ...p }));
  }

  // A gallery photo is its image; everything else needs a title.
  const missingRequiredKey =
    section.section === "gallery"
      ? draft.imageUrl?.trim()
        ? null
        : "subprofiles:itemDrawer.status.needsPhoto"
      : draft.title.trim()
        ? null
        : "subprofiles:itemDrawer.status.needsTitle";
  const canSave =
    itemDrawerSaveState({
      isNew,
      isDirty: isDraftDirty,
      isMissingRequired: missingRequiredKey !== null,
    }) === "dirty";

  function save() {
    if (canSave) onSave(draft);
  }

  function handleShortcut(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey)) return;
    event.preventDefault();
    save();
  }

  const sectionTitleKeys = SECTION_DRAWER_TITLE_KEYS[section.section];
  const titleKey = isNew
    ? (sectionTitleKeys?.add ?? "subprofiles:itemDrawer.addTitle")
    : (sectionTitleKeys?.edit ?? "subprofiles:itemDrawer.editTitle");

  return createPortal(
    <div
      className="scrim bottom"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- WAI-ARIA modal dialog: ⌘/Ctrl+Enter from any field inside saves it. */}
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
          <h2 id={titleId}>{t(titleKey, { section: t(section.labelKey) })}</h2>
          <div className={styles.headActions}>
            {/* History (Task 10): same !isNew guard as ProtectWorkSection below
                — an unsaved draft has no revisions to show yet. */}
            {!isNew && (
              <button
                type="button"
                className={styles.smallBtn}
                onClick={() => setHistoryOpen(true)}
              >
                <FiClock size={14} aria-hidden />
                {t("subprofiles:history.button")}
              </button>
            )}
            <button
              type="button"
              className={styles.smallBtn}
              onClick={requestClose}
              aria-label={t("shared:modal.close")}
            >
              <FiX size={16} aria-hidden />
            </button>
          </div>
        </div>

        <div className="drawer-body">
          <div className="drawer-main">
            <SubprofileItemDrawerFields
              draft={draft}
              fields={section.fields}
              onPatch={patch}
            />
          </div>
          <ItemDrawerSettings
            draft={draft}
            canFeature={canFeature}
            isNew={isNew}
            authorName={authorName}
            onPatch={patch}
          />
        </div>

        <ItemDrawerFooter
          isNew={isNew}
          isDirty={isDraftDirty}
          missingRequiredKey={missingRequiredKey}
          onCancel={onClose}
          onSave={save}
        />
      </div>

      {/* Both of these portal themselves to document.body via the shared
          `Modal` primitive, so nesting them here (inside this drawer's own
          portal) is harmless, and the modal stack keeps Escape from closing
          the drawer underneath them. */}
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
      {historyOpen && (
        <ItemRevisionHistoryModal
          subprofileId={subprofileId}
          itemId={item.id}
          section={section.section}
          onClose={() => setHistoryOpen(false)}
          onRestored={closeHistoryAndDrawer}
          editVersionControls={{
            getEditVersion,
            adoptEditVersion,
            markEditConflict: markConflictAndClose,
          }}
        />
      )}
    </div>,
    document.body,
  );
}
