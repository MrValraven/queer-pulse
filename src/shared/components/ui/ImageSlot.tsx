import { useState, type CSSProperties } from "react";
import { imagePixelRatio, resolveAvatarSrc } from "../../lib/avatarUrl";
import { useTranslation } from "../../i18n/useTranslation";
import {
  cropFocalPosition,
  cropToImgStyle,
  type CropRect,
} from "./cropGeometry";
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
  /** Explicit pixel width to request from resizable (Google/Unsplash) image
   *  hosts. Defaults to a numeric `width` times the device pixel ratio; for a
   *  non-numeric width (`"100%"`, a `clamp()`) it falls back to the viewport
   *  width times that ratio, capped at `FLUID_SLOT_CAP_PX`. Pass it explicitly
   *  when you know the slot's real rendered width and want to stop over-asking. */
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
  /** Saved crop treated as a FOCAL REGION rather than an exact frame: the image
   *  still `object-fit: cover`s the slot, but the visible window is panned
   *  towards the centre of what the member framed. Use this (not `crop`) for
   *  any slot whose box aspect doesn't match the crop's — a full-bleed banner,
   *  a card's cover strip — where `crop` would distort. Ignored when `crop` is
   *  also passed, which is the stricter, exact-frame rendering. */
  focus?: CropRect;
  /** Extra inline style merged onto the `<img>` itself, applied AFTER the
   *  `crop`/`focus` positioning above so it can override it. For callers that
   *  drive the framing from a CSS custom property rather than from React state
   *  — the persona banner's owner reposition control writes its live drag
   *  position straight onto the DOM node, so a value like
   *  `` `50% var(--pp-cover-y, 40%)` `` has to reach the image. Leave it unset
   *  everywhere else; `crop`/`focus` are the declarative way in. */
  imgStyle?: CSSProperties;
}

/**
 * Ceiling on the width requested for a slot whose CSS width is fluid
 * (`"100%"`, a `clamp()`), where the real rendered width is unknowable at
 * render time. A fluid slot is usually a card cover or a full-bleed hero, so
 * the viewport width is the honest upper bound; the cap keeps a 4K window at
 * 2× from asking for an 8000px file that no slot on the page ever shows.
 */
const FLUID_SLOT_CAP_PX = 2560;

/** Fallback for the viewport width off-DOM (tests) — a mid-size laptop. */
const FALLBACK_VIEWPORT_PX = 1280;

/**
 * Device pixels to ask a resizable host for, given the slot's CSS width.
 *
 * The old default was `width × 2` for a numeric width and a flat **256** for
 * everything else. That 256 was the bug behind soft covers and hero banners:
 * every `width="100%"` slot on the platform is fluid, so every one of them
 * silently asked a resizable host for a 256px render and then stretched it
 * across a card or the whole viewport.
 */
function defaultSrcSize(width: number | string): number {
  const ratio = imagePixelRatio();
  if (typeof width === "number") return Math.round(width * ratio);
  const viewport =
    typeof window === "undefined" ? FALLBACK_VIEWPORT_PX : window.innerWidth;
  return Math.round(Math.min(viewport, FLUID_SLOT_CAP_PX) * ratio);
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
  focus,
  imgStyle,
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
  const positionStyle: CSSProperties | undefined = crop
    ? { position: "absolute", objectFit: "fill", ...cropToImgStyle(crop) }
    : focus
      ? // Focal mode keeps the stylesheet's `object-fit: cover` and only moves
        // WHICH part of the image survives the crop the box forces.
        { objectPosition: cropFocalPosition(focus) }
      : undefined;
  const cropImgStyle: CSSProperties | undefined =
    positionStyle || imgStyle ? { ...positionStyle, ...imgStyle } : undefined;
  const borderRadius = shape === "circle" ? "50%" : radius;
  // Only resizable hosts (Google/OAuth, Unsplash) are rewritten; every other
  // src — our own `/files/<key>` uploads, magazine art — passes through
  // unchanged, so asking generously here costs nothing on those.
  const resolvedSrc = resolveAvatarSrc(src, srcSize ?? defaultSrcSize(width));
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
