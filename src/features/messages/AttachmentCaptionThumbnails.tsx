// src/features/messages/AttachmentCaptionThumbnails.tsx
import { FiFile, FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import type { StagedAttachmentItem } from "./AttachmentStagingTypes";
import styles from "./AttachmentCaptionThumbnails.module.css";

/** One item's accessible label for its thumbnail button. */
function thumbnailLabel(
  item: StagedAttachmentItem,
  index: number,
  count: number,
  t: TFunction,
): string {
  const position = { index: index + 1, count };
  if (item.kind === "document") {
    return t("messages:attachments.thumbnailDocument", {
      ...position,
      fileName: item.fileName,
    });
  }
  return item.kind === "gif"
    ? t("messages:attachments.thumbnailGif", position)
    : t("messages:attachments.thumbnailPhoto", position);
}

/**
 * The caption screen's multi-item strip (DES-198/DES-199): a row of square
 * tiles, one per staged item, tapping one switches the big stage + caption
 * field to it; each also carries its own remove badge. `AttachmentCaptionScreen`
 * only renders this at all once there are 2+ items. A single staged item's
 * remove affordance is the screen's own close button.
 */
export function AttachmentCaptionThumbnails({
  items,
  selectedId,
  onSelect,
  onRemove,
  onTileRef,
}: {
  items: StagedAttachmentItem[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  /** Registers/unregisters each tile's own DOM node by item id, so the
   *  caption screen can move focus to the neighbouring thumbnail once a
   *  remove finishes (see its own doc). */
  onTileRef?: (id: string, el: HTMLButtonElement | null) => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={styles.strip}
      role="group"
      aria-label={t("messages:attachments.thumbnailsLabel")}
    >
      {items.map((item, index) => (
        <div key={item.id} className={styles.tileWrap}>
          <button
            ref={(el) => onTileRef?.(item.id, el)}
            type="button"
            className={[styles.tile, item.id === selectedId && styles.selected]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={item.id === selectedId}
            aria-label={thumbnailLabel(item, index, items.length, t)}
            onClick={() => onSelect(item.id)}
          >
            {item.kind === "document" ? (
              <span className={styles.thumbDocument} aria-hidden>
                <FiFile />
              </span>
            ) : (
              <img className={styles.thumbImage} src={item.previewUrl} alt="" />
            )}
          </button>
          {item.status === "uploading" && (
            <span className={styles.uploadingRing} aria-hidden />
          )}
          <button
            type="button"
            className={styles.removeButton}
            aria-label={
              item.kind === "document"
                ? t("messages:attachments.removeDocument", {
                    fileName: item.fileName,
                  })
                : item.kind === "gif"
                  ? t("messages:attachments.removeGif")
                  : t("messages:attachments.removePhoto")
            }
            onClick={(event) => {
              event.stopPropagation();
              onRemove(item.id);
            }}
          >
            <FiX aria-hidden size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
