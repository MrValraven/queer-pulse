import { FiFile, FiFileText } from "react-icons/fi";
import { absoluteFileUrl } from "./adminMedia.format";
import type { AdminMediaObject } from "./api/adminMedia.api";
import styles from "./AdminMediaPage.module.css";

/**
 * The visual for one stored object, on a grid card or in the drawer head.
 *
 * An image renders as an `<img>`. Anything else (a listing menu PDF, or a key
 * whose extension maps to no image type, which arrives with a null
 * `contentType`) renders a document tile: a file icon, the extension and the
 * file name. Pointing an `<img>` at a PDF only ever draws a broken image.
 *
 * Decorative in both places: the card's open button and the drawer's meta
 * already name the key.
 */
export function AdminMediaPreview({
  object,
  variant,
  realContentType = null,
}: {
  object: AdminMediaObject;
  variant: "card" | "drawer";
  /** The drawer's head-checked stored type, once it has one. Either it or the
   *  declared type being an image shows the image; a disagreement between the
   *  two is the drawer meta's job to flag. */
  realContentType?: string | null;
}) {
  const isDrawer = variant === "drawer";
  const isImage =
    isImageType(object.contentType) ||
    (isDrawer && isImageType(realContentType));

  if (isImage) {
    return (
      <img
        className={isDrawer ? styles.drawerImage : styles.thumb}
        src={absoluteFileUrl(object.fileUrl)}
        alt=""
        loading={isDrawer ? undefined : "lazy"}
      />
    );
  }

  const fileName = object.key.split("/").pop() ?? object.key;
  const extensionStart = fileName.lastIndexOf(".");
  const extension =
    extensionStart > 0 ? fileName.slice(extensionStart + 1) : "";
  const FileIcon = extension ? FiFileText : FiFile;

  return (
    <span
      className={`${styles.documentTile} ${isDrawer ? styles.documentTileDrawer : styles.documentTileCard}`}
      aria-hidden="true"
    >
      <FileIcon className={styles.documentIcon} />
      {extension && (
        <span className={styles.documentExtension}>{extension}</span>
      )}
      <span className={styles.documentName}>{fileName}</span>
    </span>
  );
}

function isImageType(contentType: string | null): boolean {
  return contentType?.startsWith("image/") ?? false;
}
