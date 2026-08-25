import { useState, type CSSProperties, type HTMLAttributes } from "react";
import { imagePixelRatio, resolveAvatarSrc } from "../../lib/avatarUrl";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./Avatar.module.css";

export type AvatarTint = "default" | "coral" | "jade" | "plum" | "auth";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  initials: string;
  tint?: AvatarTint;
  size?: number;
  verified?: boolean;
  /** Optional photo; falls back to initials when absent. */
  src?: string;
  /**
   * The person's full name, used as the image's `alt` text so a screen reader
   * announces *who* the avatar shows rather than the meaningless initials. When
   * a visible name label already sits beside the avatar, omit this (and `alt`)
   * so the image is treated as decorative (`alt=""`) instead of double-reading.
   */
  name?: string;
  alt?: string;
}

export function Avatar({
  initials,
  tint = "default",
  size = 40,
  verified = false,
  src,
  name,
  alt,
  className,
  style,
  ...rest
}: AvatarProps) {
  const { t } = useTranslation();
  const [imgFailed, setImgFailed] = useState(false);
  // Size the OUTER wrapper (not the inner circle) via CSS custom properties, so
  // the inner circle can fill `width:100%` and inherit the wrapper's radius +
  // font-size. A previous version pinned the inner circle's px size with an
  // inline style, which no class could override — so any skin that resized the
  // wrapper via CSS (`.pp-av`: workshop/practice/table) left a full-size circle
  // overflowing the shrunk wrapper and overlapping neighbouring content. Passing
  // size as a variable lets those `.pp-av` rules resize the whole avatar cleanly.
  const wrapStyle = {
    ...style,
    "--avatar-size": `${size}px`,
    "--avatar-font": `${Math.round(size * 0.34)}px`,
  } as CSSProperties;

  // The render size in DEVICE pixels. This was a hardcoded `× 2`, which under-
  // asks on a 3× phone (where an avatar circle is the one image a member looks
  // at closely) and over-asks on a 1× display.
  const px = Math.round(size * imagePixelRatio());
  // One resolver for every host. Unsplash gets a face-aware square crop at the
  // device-pixel size so small avatars aren't off-centre or blurry; Google/OAuth
  // avatars get their size directive bumped. This used to build the Unsplash URL
  // inline with an unguarded `new URL(src)`, which THREW during render on a
  // malformed src that happened to contain "unsplash.com" — `resolveAvatarSrc`
  // guards the parse and returns the input untouched instead.
  const resolvedSrc = resolveAvatarSrc(src, px, { isFaceCrop: true });

  return (
    <div
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      style={wrapStyle}
      {...rest}
    >
      <div className={[styles.avatar, styles[tint]].join(" ")}>
        {resolvedSrc && !imgFailed ? (
          <img
            src={resolvedSrc}
            // Prefer an explicit alt, then the person's name. Never the
            // initials — read aloud, "M R" is noise. With neither, the avatar
            // is decorative (a visible name label sits beside it) → alt="".
            alt={alt ?? name ?? ""}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
          />
        ) : (
          initials
        )}
      </div>
      {verified && (
        <span
          className={styles.verifiedBadge}
          title={t("shared:avatar.verified")}
        >
          <svg width={9} height={9} viewBox="0 0 24 24" fill="none" aria-hidden>
            <polyline
              points="20 6 9 17 4 12"
              style={{ stroke: "var(--paper)" }}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </div>
  );
}

interface AvatarStackProps extends HTMLAttributes<HTMLDivElement> {
  avatars: Array<{ initials: string; tint?: AvatarTint; src?: string }>;
  size?: number;
}

export function AvatarStack({
  avatars,
  size = 36,
  className,
  ...rest
}: AvatarStackProps) {
  return (
    <div
      className={[styles.stack, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {avatars.map((avatar, index) => (
        <Avatar
          // Stable key: photo URL is unique per avatar (so Avatar's internal
          // imgFailed state can't bleed to the wrong row on reorder/filter);
          // photo-less entries render no <img> so an index tiebreak is harmless.
          key={avatar.src ?? `${avatar.initials}-${index}`}
          initials={avatar.initials}
          tint={avatar.tint}
          src={avatar.src}
          size={size}
          style={{
            marginLeft: index === 0 ? 0 : -10,
            zIndex: avatars.length - index,
          }}
        />
      ))}
    </div>
  );
}
