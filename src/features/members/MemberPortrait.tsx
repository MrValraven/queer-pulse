import { useState } from "react";
import type { AvatarTint } from "../../shared/components/ui";
import { imagePixelRatio, resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import styles from "./MemberPortrait.module.css";

/** Roughly the widest the portrait column gets on any card (the 30% column of
 *  a single full-width directory card), in CSS pixels, with some headroom. The
 *  photo is requested at this width times the device pixel ratio so it stays
 *  crisp without fetching a full-size original. */
const PORTRAIT_REQUEST_WIDTH_PX = 320;

/**
 * A member's photo filling its box edge to edge, or their initials on the
 * avatar tint when there is no photo (or it fails to load). The box takes its
 * size from the parent: the split member-card layouts stretch it to the card's
 * full height in the left column.
 *
 * Pass `alt` only when no visible name sits beside the portrait; with a name
 * label next to it the image is decorative and should not be read twice.
 */
export function MemberPortrait({
  initials,
  tint = "default",
  src,
  alt = "",
  className,
}: {
  initials: string;
  tint?: AvatarTint;
  src?: string;
  alt?: string;
  className?: string;
}) {
  const [hasImageFailed, setHasImageFailed] = useState(false);
  const resolvedSrc = resolveAvatarSrc(
    src,
    Math.round(PORTRAIT_REQUEST_WIDTH_PX * imagePixelRatio()),
  );
  const isShowingPhoto = !!resolvedSrc && !hasImageFailed;
  return (
    <div
      className={[styles.portrait, styles[tint], className]
        .filter(Boolean)
        .join(" ")}
    >
      {isShowingPhoto ? (
        <img
          className={styles.photo}
          src={resolvedSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setHasImageFailed(true)}
        />
      ) : (
        <span className={styles.initials} aria-hidden>
          {initials}
        </span>
      )}
    </div>
  );
}
