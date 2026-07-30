import { useState, type CSSProperties, type HTMLAttributes } from "react";
import { resolveAvatarSrc } from "../../lib/avatarUrl";
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
  ...rest
}: AvatarProps) {
  const { t } = useTranslation();
  const [imgFailed, setImgFailed] = useState(false);
  const circleStyle: CSSProperties = {
    width: size,
    height: size,
    fontSize: size * 0.34,
  };

  const px = Math.round(size * 2);
  // For Unsplash images, request a face-aware crop at 2× the render size
  // so small avatars don't get an off-center or blurry crop. Google/OAuth
  // avatars get their size directive bumped the same way (see resolveAvatarSrc).
  const resolvedSrc = src?.includes("unsplash.com")
    ? (() => {
        const url = new URL(src);
        url.searchParams.set("w", String(px));
        url.searchParams.set("h", String(px));
        url.searchParams.set("fit", "crop");
        url.searchParams.set("crop", "faces");
        url.searchParams.set("auto", "format");
        url.searchParams.set("q", "80");
        return url.toString();
      })()
    : resolveAvatarSrc(src, px);

  return (
    <div
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      {...rest}
    >
      <div
        className={[styles.avatar, styles[tint]].join(" ")}
        style={circleStyle}
      >
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
