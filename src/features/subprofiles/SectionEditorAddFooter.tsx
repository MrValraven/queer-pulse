import type { RefObject } from "react";
import { FiPlus } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./SubprofileEditor.module.css";

/**
 * The section editor's footer: the Add button (opens the item drawer, or the
 * gallery picker for `gallery`) and the cap/full hint under it. Extracted out
 * of `SubprofileSectionEditor` to keep that component under the 200-line cap.
 *
 * The Add button carries `data-jump-target` whenever the caller says the list
 * still allows one more item, so a field jump can land on it, and it is also
 * where `SubprofileSectionEditor` moves focus after a Remove or Insert
 * examples empties the list (M2). `addButtonRef` gives the caller that
 * handle.
 */
export function SectionEditorAddFooter({
  isGallery,
  isGalleryFull,
  isAtMax,
  hasAddButton,
  sectionLabelKey,
  addButtonRef,
  onAdd,
}: {
  isGallery: boolean;
  isGalleryFull: boolean;
  isAtMax: boolean;
  hasAddButton: boolean;
  sectionLabelKey: string;
  addButtonRef: RefObject<HTMLButtonElement | null>;
  onAdd: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.sectionFoot}>
      <div>
        {!isGalleryFull && (
          <button
            ref={addButtonRef}
            type="button"
            className={styles.addBtn}
            onClick={onAdd}
            disabled={isAtMax}
            data-jump-target={hasAddButton || undefined}
            // The visible "Add" sits under a heading naming the section;
            // the name keeps it ("Add to Mixes"). Photos say what they add.
            aria-label={
              isGallery
                ? undefined
                : t("subprofiles:sectionEditor.addTo", {
                    section: t(sectionLabelKey),
                  })
            }
          >
            <FiPlus size={18} aria-hidden />{" "}
            {t(
              isGallery
                ? "subprofiles:gallery.addTitle"
                : "subprofiles:sectionEditor.add",
            )}
          </button>
        )}
        {isGalleryFull ? (
          <p className={styles.capHint}>{t("subprofiles:galleryFull")}</p>
        ) : (
          isAtMax && (
            <p className={styles.capHint}>
              {t("subprofiles:sectionEditor.capHint")}
            </p>
          )
        )}
      </div>
    </div>
  );
}
