import { useState } from "react";
import { ImageSlot } from "../../shared/components/ui/ImageSlot";
import type { CropRect } from "../../shared/components/ui/cropGeometry";
import type { AccentKey } from "./api/subprofiles.api";
import { accentStyle } from "./subprofilePresence.data";
import styles from "./PersonaPortraitArt.module.css";

export interface PersonaPortraitArtProps {
  /** The persona's picture (cover or avatar), or null when it has none. When
   *  null, or when the file fails to load, the accent tint with a monogram
   *  shows instead. */
  imageUrl: string | null;
  /** Saved crop, treated as a focal region: the picture still covers the box
   *  and is panned towards what the member framed. */
  imageFocus?: CropRect;
  /** Accent colour of the persona; tints the fallback and colours the monogram. */
  accent: AccentKey;
  /** Text the monogram is drawn from. Only its first character is used, so a
   *  display name can be passed as is. */
  monogram: string;
  /** Pixel width to request from resizable image hosts. Pass it when the real
   *  rendered width is known (a wall tile), otherwise the viewport is assumed. */
  imageSrcSize?: number;
  /** Where the monogram sits. "center" (default) is the portrait card; "corner"
   *  is the wall tile, with the name overlaid at the bottom. */
  monogramPlacement?: "center" | "corner";
  /** Layout hook for the consumer. The art fills its parent and is 4:5 unless
   *  the consumer sets `--portrait-art-ratio` (use `auto` inside a box that
   *  already has a height). `--portrait-art-monogram-size` and
   *  `--portrait-art-monogram-opacity` retune the monogram. */
  className?: string;
}

/**
 * The picture slot shared by the wall tiles and the portrait cards of the
 * personas directory: a persona image, or the accent tint with a large italic
 * monogram that scales with the slot's own width (container query units).
 * Purely decorative (aria-hidden); the surrounding card names the persona.
 */
export function PersonaPortraitArt({
  imageUrl,
  imageFocus,
  accent,
  monogram,
  imageSrcSize,
  monogramPlacement = "center",
  className,
}: PersonaPortraitArtProps) {
  // The src that failed to load, so a broken link falls back to the monogram
  // and a different src gets a fresh try without an effect to reset it.
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const hasImage = imageUrl !== null && imageUrl !== failedImageUrl;
  const monogramLetter = Array.from(monogram.trim())[0]?.toUpperCase() ?? "";
  const rootClassName = [styles.art, className].filter(Boolean).join(" ");

  return (
    <div aria-hidden className={rootClassName} style={accentStyle(accent)}>
      {hasImage ? (
        <ImageSlot
          className={styles.image}
          src={imageUrl}
          focus={imageFocus}
          srcSize={imageSrcSize}
          width="100%"
          height="100%"
          radius={0}
          onLoadError={() => setFailedImageUrl(imageUrl)}
        />
      ) : (
        <span
          className={
            monogramPlacement === "corner"
              ? `${styles.monogram} ${styles.monogramCorner}`
              : styles.monogram
          }
        >
          {monogramLetter}
        </span>
      )}
    </div>
  );
}
