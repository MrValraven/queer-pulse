import { FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { absoluteFileUrl, formatBytes } from "./adminMedia.format";
import { AdminMediaReferenceBadge } from "./AdminMediaReferences";
import {
  ADMIN_MEDIA_KINDS,
  type AdminMediaKind,
  type AdminMediaObject,
  type AdminMediaUploader,
} from "./api/adminMedia.api";
import styles from "./AdminMediaPage.module.css";

/**
 * One object tile in the media grid: thumbnail, kind badge, and a size · uploader
 * line. The whole card opens the inspection drawer; the uploader name is a
 * nested `role="button"` span (the repo's sanctioned clickable-inside-a-button
 * pattern) that `stopPropagation`s so tapping it filters the grid to that member
 * instead of opening the drawer.
 */
export function AdminMediaCard({
  object,
  onOpen,
  onFilterByUploader,
}: {
  object: AdminMediaObject;
  onOpen: (object: AdminMediaObject) => void;
  onFilterByUploader: (uploader: AdminMediaUploader) => void;
}) {
  const { t } = useTranslation();
  const uploader = object.uploader;

  return (
    <FadeIn>
      <button
        type="button"
        className={styles.card}
        onClick={() => onOpen(object)}
      >
        <img
          className={styles.thumb}
          src={absoluteFileUrl(object.fileUrl)}
          alt=""
          loading="lazy"
        />
        <span className={styles.badgeRow}>
          <span className={styles.kindBadge}>
            {ADMIN_MEDIA_KINDS.includes(object.kind as AdminMediaKind)
              ? t(`admin:media.kinds.${object.kind}`)
              : object.kind}
          </span>
          <AdminMediaReferenceBadge references={object.references} />
        </span>
        <span className={styles.meta}>
          {formatBytes(object.size)}
          {" · "}
          {uploader ? (
            <span
              role="button"
              tabIndex={0}
              className={styles.uploaderChip}
              onClick={(event) => {
                event.stopPropagation();
                onFilterByUploader(uploader);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onFilterByUploader(uploader);
                }
              }}
            >
              {uploader.displayName}
            </span>
          ) : (
            t("admin:media.unowned")
          )}
        </span>
      </button>
    </FadeIn>
  );
}
