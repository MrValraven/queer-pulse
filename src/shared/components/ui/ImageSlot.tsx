import type { CSSProperties } from "react";
import { resolveAvatarSrc } from "../../lib/avatarUrl";
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
  /** Caption shown in the empty placeholder frame. */
  placeholder?: string;
  /** Initials shown (e.g. for avatar-style slots) when there is no image. */
  initials?: string;
  className?: string;
  style?: CSSProperties;
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
  placeholder = "Image",
  initials,
  className,
  style,
}: ImageSlotProps) {
  const borderRadius = shape === "circle" ? "50%" : radius;
  // Only Google/OAuth avatar URLs are rewritten (for a crisp 2× crop); every
  // other src — Unsplash covers, magazine art — passes through unchanged.
  const resolvedSrc = resolveAvatarSrc(
    src,
    typeof width === "number" ? Math.round(width * 2) : 256,
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
      {src ? (
        <img src={resolvedSrc} alt={alt} referrerPolicy="no-referrer" />
      ) : initials ? (
        <span className={styles.initials} style={{ fontSize: 22 }}>
          {initials}
        </span>
      ) : (
        <span className={styles.caption}>{placeholder}</span>
      )}
    </div>
  );
}
