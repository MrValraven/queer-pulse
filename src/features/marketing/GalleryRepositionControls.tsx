import { useEffect, useRef } from "react";
import { FiCheck, FiMonitor, FiMove, FiSmartphone } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  LISTING_PHOTO_FRAMING_ERROR_KEYS,
  type ListingPhotoFramingError,
} from "./api/listingPhotoFraming.api";
import styles from "./GalleryRepositionControls.module.css";

export type GalleryPreviewViewport = "desktop" | "phone";

export interface GalleryRepositionControlsProps {
  isEditing: boolean;
  viewport: GalleryPreviewViewport;
  onViewportChange: (viewport: GalleryPreviewViewport) => void;
  /** True once a photo moved since the last save. */
  isDirty: boolean;
  isSaving: boolean;
  /** The cause of the last failed save, or null. */
  error: ListingPhotoFramingError | null;
  onStart: () => void;
  onSave: () => void;
  onCancel: () => void;
}

/** The two preview widths of the toggle, in display order. */
const VIEWPORT_OPTIONS = [
  {
    value: "desktop",
    Icon: FiMonitor,
    labelKey: "marketing:directory.detail.reposition.viewDesktop",
  },
  {
    value: "phone",
    Icon: FiSmartphone,
    labelKey: "marketing:directory.detail.reposition.viewPhone",
  },
] as const;

/**
 * Save and Cancel fold away with the toolbar when edit mode ends, which would
 * drop focus to the page body. The "Reposition photos" button mounts again in
 * the same commit, so it takes focus back on that switch. The first render is
 * skipped, so the page never pulls focus on load.
 */
function useFocusEntryOnEditEnd(isEditing: boolean) {
  const entryButtonRef = useRef<HTMLButtonElement>(null);
  const wasEditingRef = useRef(isEditing);
  useEffect(() => {
    const wasEditing = wasEditingRef.current;
    wasEditingRef.current = isEditing;
    if (wasEditing && !isEditing) entryButtonRef.current?.focus();
  }, [isEditing]);
  return entryButtonRef;
}

/**
 * The edit-mode controls above a listing gallery: the "Reposition photos"
 * entry button, then, once editing, a toolbar with the hint, the
 * Desktop/Phone preview toggle, Cancel and Save positions, and a line naming
 * why a save failed. Every part folds in and out through `Collapse`.
 */
export function GalleryRepositionControls({
  isEditing,
  viewport,
  onViewportChange,
  isDirty,
  isSaving,
  error,
  onStart,
  onSave,
  onCancel,
}: GalleryRepositionControlsProps) {
  const { t } = useTranslation();
  const entryButtonRef = useFocusEntryOnEditEnd(isEditing);
  return (
    <div className={styles.controls}>
      <Collapse isOpen={!isEditing}>
        <div className={styles.entry}>
          <Button
            ref={entryButtonRef}
            variant="soft"
            size="sm"
            onClick={onStart}
          >
            <FiMove aria-hidden="true" />
            {t("marketing:directory.detail.reposition.open")}
          </Button>
        </div>
      </Collapse>
      <Collapse isOpen={isEditing}>
        <div
          className={styles.toolbar}
          role="region"
          aria-label={t("marketing:directory.detail.reposition.toolbarAria")}
        >
          <p className={styles.hint}>
            {t("marketing:directory.detail.reposition.hint")}
          </p>
          <div className={styles.actions}>
            <div
              className={styles.viewGroup}
              role="group"
              aria-label={t("marketing:directory.detail.reposition.viewAria")}
            >
              {VIEWPORT_OPTIONS.map(({ value, Icon, labelKey }) => (
                <Button
                  key={value}
                  variant="ghost"
                  size="sm"
                  className={styles.segment}
                  aria-pressed={viewport === value}
                  onClick={() => onViewportChange(value)}
                >
                  <Icon aria-hidden="true" />
                  {t(labelKey)}
                </Button>
              ))}
            </div>
            <div className={styles.saveGroup}>
              <Button
                variant="ghost"
                size="sm"
                disabled={isSaving}
                onClick={onCancel}
              >
                {t("marketing:directory.detail.reposition.cancel")}
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!isDirty || isSaving}
                onClick={onSave}
              >
                <FiCheck aria-hidden="true" />
                {isSaving
                  ? t("marketing:directory.detail.reposition.saving")
                  : t("marketing:directory.detail.reposition.save")}
              </Button>
            </div>
          </div>
          <Collapse isOpen={error !== null} className={styles.errorRow}>
            <p className={styles.error} role="alert">
              {error !== null
                ? t(LISTING_PHOTO_FRAMING_ERROR_KEYS[error.reason], {
                    status: error.status ?? "",
                  })
                : null}
            </p>
          </Collapse>
        </div>
      </Collapse>
    </div>
  );
}
