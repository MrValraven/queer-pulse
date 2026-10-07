import type { ReactNode } from "react";
import type { ListingPreviewRegion } from "./listingPreviewRegions.data";
import previewStyles from "./ListingLivePreview.module.css";
import styles from "../ListBusinessPage.module.css";

/** A titled excerpt block. Hidden while empty, except when its field is the
 *  highlighted one: then it shows a placeholder line, so the outline has
 *  somewhere to land. */
export function ExcerptSection({
  region,
  title,
  isHighlighted,
  placeholder,
  children,
}: {
  region: ListingPreviewRegion;
  title: string;
  isHighlighted: boolean;
  placeholder: string;
  /** The block's content, or null while the field is empty. */
  children: ReactNode | null;
}) {
  if (children === null && !isHighlighted) return null;
  return (
    <div className={styles.pdSec} data-preview-region={region}>
      <h3>{title}</h3>
      {children ?? (
        <p className={previewStyles.placeholderLine}>{placeholder}</p>
      )}
    </div>
  );
}
