import { useState } from "react";
import type { IconType } from "react-icons";
import { ImageSlot } from "../../shared/components/ui";
import styles from "./EditorItemRow.module.css";

/**
 * The 44px thumbnail slot at the start of an `EditorItemRow`: the item's own
 * image when it has one, else the section's icon, tinted, in a wash square,
 * so image and non-image rows in the same list still line up their titles at
 * the same offset (S1). Extracted out of `EditorItemRow` to keep that
 * component under the 200-line cap.
 *
 * Owns its own failed-image tracking, mirroring `ImageSlot`'s own
 * `failedSrc` pattern: a dead link falls back to the same section-icon
 * placeholder a missing `imageUrl` gets, keyed by the url itself so it self
 * corrects the moment the caller passes a different `imageUrl`.
 */
export function EditorItemRowThumbnail({
  imageUrl,
  sectionIcon: SectionIcon,
}: {
  imageUrl: string | undefined;
  sectionIcon: IconType;
}) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | undefined>(
    undefined,
  );
  const shouldShowImage = !!imageUrl && imageUrl !== failedImageUrl;

  return shouldShowImage ? (
    <ImageSlot
      src={imageUrl}
      alt=""
      width={44}
      height={44}
      radius={10}
      srcSize={96}
      className={styles.thumb}
      onLoadError={() => setFailedImageUrl(imageUrl)}
    />
  ) : (
    <span className={styles.thumbPlaceholder} aria-hidden>
      <SectionIcon size={18} />
    </span>
  );
}
