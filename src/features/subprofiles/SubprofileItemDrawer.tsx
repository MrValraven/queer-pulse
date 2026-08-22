import { useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FiClock, FiX } from "react-icons/fi";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  SubprofileItemView,
  SubprofileSectionView,
  SubprofileView,
} from "./api/subprofiles.adapters";
import { SubprofileItemDrawerFields } from "./SubprofileItemDrawerFields";
import { useDrawerDismiss } from "./useDrawerDismiss";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { ProtectWorkSection } from "./rights/ProtectWorkSection";
import { ItemRevisionHistoryModal } from "./rights/ItemRevisionHistoryModal";
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
 * from the bottom edge and lays its fields two-up on desktop, finally
 * exposing the Phase-0 rich fields per section on top of the base
 * `SECTION_META` fields every section already showed. Field rendering lives
 * in `SubprofileItemDrawerFields` (moved here from the retired
 * `SubprofileItemEditor`) to keep this shell under the line cap.
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
  const { reseedSection } = useSubprofileEditorContext();
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

  function patch(p: Partial<SubprofileItemView>) {
    setDraft((cur) => ({ ...cur, ...p }));
  }

  function toggleFeature() {
    setDraft((cur) => ({ ...cur, isFeatured: !cur.isFeatured }));
  }

  const titleKey = isNew ? "subprofiles:itemDrawer.addTitle" : "subprofiles:itemDrawer.editTitle";

  return createPortal(
    <div
      className="scrim bottom"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
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
          <SubprofileItemDrawerFields
            draft={draft}
            fields={section.fields}
            onPatch={patch}
          />
          {canFeature && (
            <button
              type="button"
              className={`${
                draft.isFeatured
                  ? `${styles.featureBtn} ${styles.featureBtnActive}`
                  : styles.featureBtn
              } pe-field-wide`}
              onClick={toggleFeature}
              aria-pressed={draft.isFeatured}
            >
              {t(
                draft.isFeatured
                  ? "subprofiles:itemEditor.unfeature"
                  : "subprofiles:itemEditor.feature",
              )}
            </button>
          )}
          {/* Owner-only "Protect this work" (Task 5): only meaningful once the
              item has a real, server-assigned `createdAt`. Guard on `isNew`,
              the drawer's own new-vs-existing signal, not on `createdAt`
              itself: an unsaved draft's `createdAt` is just a client-stamped
              placeholder from `emptyItem`, so guarding on the field's
              truthiness alone would wrongly show this for a brand-new item. */}
          {!isNew && (
            <ProtectWorkSection item={draft} authorName={authorName} />
          )}
        </div>

        <div className="drawer-foot">
          <Button variant="ghost" onClick={onClose}>
            {t("subprofiles:itemDrawer.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={() => onSave(draft)}
            disabled={
              section.section === "gallery"
                ? !draft.imageUrl?.trim()
                : !draft.title.trim()
            }
          >
            {t("subprofiles:itemDrawer.saveItem")}
          </Button>
        </div>
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
        />
      )}
    </div>,
    document.body,
  );
}
