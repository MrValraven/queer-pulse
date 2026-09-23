import { FiFileText } from "react-icons/fi";
import {
  documentExtensionOf,
  resolveMyMediaUrl,
  type MyMediaItem,
} from "./api/myMedia.api";
import styles from "./MyUploadsPane.module.css";

/** The card's square preview: an image for photo uploads, or a document tile
 *  (icon + extension) for a PDF/CSV/TXT/XLSX upload, which an `<img>` would
 *  otherwise render as a broken image. A `listing-menu` upload can be either
 *  kind, so this keys off the storage key's extension for the answer. */
export function MyUploadThumb({ item }: { item: MyMediaItem }) {
  const documentExtension = documentExtensionOf(item.key);

  if (documentExtension) {
    return (
      <div className={styles.docThumb} aria-hidden>
        <FiFileText className={styles.docIcon} aria-hidden />
        <span className={styles.docExtension}>{documentExtension}</span>
      </div>
    );
  }

  return (
    <img
      className={styles.thumb}
      src={resolveMyMediaUrl(item.fileUrl)}
      alt=""
      loading="lazy"
    />
  );
}
