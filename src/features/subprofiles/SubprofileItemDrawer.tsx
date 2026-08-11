import { useId, useState } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "./api/subprofiles.adapters";
import { SubprofileItemDrawerFields } from "./SubprofileItemDrawerFields";
import { useDrawerDismiss } from "./useDrawerDismiss";
import styles from "./SubprofileEditor.module.css";

interface SubprofileItemDrawerProps {
  section: SubprofileSectionView;
  /** Baseline draft — either a copy of the row being edited, or
   *  `emptyItem(section.section)` for a new item (see `SubprofileSectionEditor`). */
  item: SubprofileItemView;
  isNew: boolean;
  /** Whether this section supports a spotlight item at all (false for `links`). */
  canFeature: boolean;
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
 * list until Save; Cancel/Escape/scrim-click discard the draft untouched.
 * `SubprofileSectionEditor` applies the cross-item feature exclusivity when
 * it commits the saved draft into `rows`, then persists via `replaceSection`.
 */
export function SubprofileItemDrawer({
  section,
  item,
  isNew,
  canFeature,
  onSave,
  onClose,
}: SubprofileItemDrawerProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(item);
  const dialogRef = useDrawerDismiss(onClose);
  const titleId = useId();

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
        if (e.target === e.currentTarget) onClose();
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
          <button
            type="button"
            className={styles.smallBtn}
            onClick={onClose}
            aria-label={t("shared:modal.close")}
          >
            <FiX size={16} aria-hidden />
          </button>
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
    </div>,
    document.body,
  );
}
