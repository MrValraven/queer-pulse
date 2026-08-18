import { useState, type CSSProperties } from "react";
import { resolveAvatarSrc } from "../../lib/avatarUrl";
import { useTranslation } from "../../i18n/useTranslation";
import { cropToImgStyle, type CropRect } from "./cropGeometry";
import styles from "./ImageSlot.module.css";

export type ImageSlotTint = "default" | "coral" | "jade" | "plum";

interface ImageSlotProps {
  /** Real image source; when absent a tinted placeholder frame is shown. */
  src?: string;
  alt?: string;
  tint?: ImageSlotTint;
  shape?: "rounded" | "circle";
  radius?: number;
  width?: number | string;
  height?: number | string;
  /** Explicit pixel width to request from resizable (Google) image hosts.
   *  Defaults to 2× a numeric `width`, else 256. Set this on a full-width slot
   *  (`width="100%"`) whose 256 default would otherwise fetch a blurry crop. */
  srcSize?: number;
  /** Caption shown in the empty placeholder frame. */
  placeholder?: string;
  /** Initials shown (e.g. for avatar-style slots) when there is no image. */
  initials?: string;
  className?: string;
  style?: CSSProperties;
  /** Defaults to "lazy" (unchanged for existing call sites). Set to "eager" for
   *  an above-the-fold/LCP-candidate image — `loading="lazy"` on an LCP image
   *  delays it unnecessarily (see web.dev's Optimize LCP guidance). */
  loading?: "lazy" | "eager";
  /** Passthrough for the DOM `fetchpriority` attribute (React 19 exposes it as
   *  the camelCase `fetchPriority` prop). Pair with `loading="eager"` on the
   *  one genuine above-the-fold hero per page — never on a grid/list thumbnail. */
  fetchPriority?: "high" | "auto";
  /** Sub-rect of the source image to display (normalized 0-1 fractions), e.g.
   *  from the photo-reframe crop editor. Only meaningful for our own storage-key
   *  images; only pass it when the caller actually has a saved crop. Absent =
   *  today's unchanged `object-fit: cover` rendering. */
  crop?: CropRect;
}

/**
 * Tinted image placeholder that mirrors the design bundle's `<image-slot>` web
 * component. Renders a real image when `src` is provided, otherwise a captioned
 * tinted frame.
 */
export function ImageSlot({
  src,
  alt = "",
  tint = "default",
  shape = "rounded",
  radius = 16,
  width = "100%",
  height = 200,
  srcSize,
  placeholder,
  initials,
  className,
  style,
  loading = "lazy",
  fetchPriority,
  crop,
}: ImageSlotProps) {
  const { t } = useTranslation();
  // Tracks the most recent `src` that failed to load (a 404/broken hotlink),
  // so a real image swaps to the same empty-state placeholder as a missing
  // `src` instead of leaking the browser's native broken-image glyph + alt
  // text. Keyed by the failing src itself (not a plain boolean) so it
  // self-corrects the moment the caller passes a different `src` — no effect
  // needed to reset it.
  const [failedSrc, setFailedSrc] = useState<string | undefined>(undefined);
  const showImage = !!src && src !== failedSrc;
  // Present only when a crop rect is passed: positions the <img> as an
  // absolutely-placed sub-rect inside the (already overflow-hidden,
  // position-relative) `.slot` box, overriding the default cover fit so the
  // crop math isn't re-cropped by the browser. Absent = no inline style at
  // all, i.e. today's `.slot img { object-fit: cover }` behavior.
  const cropImgStyle: CSSProperties | undefined = crop
    ? { position: "absolute", objectFit: "fill", ...cropToImgStyle(crop) }
    : undefined;
  const borderRadius = shape === "circle" ? "50%" : radius;
  // Only Google/OAuth avatar URLs are rewritten (for a crisp 2× crop); every
  // other src — Unsplash covers, magazine art — passes through unchanged.
  const resolvedSrc = resolveAvatarSrc(
    src,
    srcSize ?? (typeof width === "number" ? Math.round(width * 2) : 256),
  );
  const cls = [
    styles.slot,
    styles[tint],
    shape === "circle" && styles.circle,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} style={{ width, height, borderRadius, ...style }}>
      {showImage ? (
        <img
          src={resolvedSrc}
          alt={alt}
          loading={loading}
          fetchPriority={fetchPriority}
          decoding="async"
          referrerPolicy="no-referrer"
          style={cropImgStyle}
          onError={() => setFailedSrc(src)}
        />
      ) : initials ? (
        <span className={styles.initials} style={{ fontSize: 22 }}>
          {initials}
        </span>
      ) : (
        <span className={styles.caption}>
          {placeholder ?? t("shared:imageSlot.placeholder")}
        </span>
      )}
    </div>
  );
}
