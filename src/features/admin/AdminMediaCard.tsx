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
 * One object tile in the media grid: thumbnail, kind badge, and a size ·
 * uploader line. The whole card opens the inspection drawer; the uploader name
 * filters the grid to that member.
 *
 * Those are two controls, so the card is a `<div>` with the drawer action as
 * an overlay button and the uploader as a real `<button>` layered above it.
 * The uploader used to be a `role="button"` span nested inside the card's own
 * `<button>`, described here as the repo's sanctioned pattern: it is not. That
 * rule is about not nesting a `<button>` inside a router `<Link>`. A focusable
 * element inside a `<button>` is invalid either way, and it left the uploader's
 * name folded into the card button's own accessible name.
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
      <div className={styles.card}>
        <button
          type="button"
          className={styles.cardOpen}
          onClick={() => onOpen(object)}
          aria-label={t("admin:media.openAriaLabel", { key: object.key })}
        />
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
            <button
              type="button"
              className={styles.uploaderChip}
              aria-label={t("admin:media.uploaderFilterAriaLabel", {
                name: uploader.displayName,
              })}
              onClick={() => onFilterByUploader(uploader)}
            >
              {uploader.displayName}
            </button>
          ) : (
            t("admin:media.unowned")
          )}
        </span>
      </div>
    </FadeIn>
  );
}
