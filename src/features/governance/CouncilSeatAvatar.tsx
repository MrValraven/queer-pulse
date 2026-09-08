import { useState } from "react";
import { imagePixelRatio, resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import type { CouncilSeatView } from "./api/useGovernanceOverview";
import styles from "./GovernancePage.module.css";

/**
 * The circle beside an advisory-council seat: the member's photo when there is
 * one, and the seat's tinted monogram otherwise.
 *
 * Not the shared `<Avatar>`, and deliberately so: a seat's fallback colours are
 * the per-seat `background`/`color` pair an admin picked, while `Avatar` paints
 * its fallback from a fixed `tint` class on an inner element no caller can
 * reach. It still goes through `resolveAvatarSrc` for the device-pixel crop and
 * carries `referrerPolicy="no-referrer"` for the same reason every other avatar
 * does — a Google/OAuth photo 403s when it is sent a referrer.
 *
 * The photo is the absent case more often than not: `member.avatarUrl` arrives
 * null for anyone who has hidden their face, and a broken image at render time
 * falls back to the monogram rather than to a torn-image glyph on the platform's
 * accountability page.
 *
 * `alt=""` on purpose. The seat-holder's name is rendered beside this circle,
 * so a screen reader that also announced the image would read the same person
 * twice.
 */
export function CouncilSeatAvatar({ seat }: { seat: CouncilSeatView }) {
  const [isPhotoBroken, setIsPhotoBroken] = useState(false);
  // 44px is `.acAv`'s design size; the em-based rule scales it with the
  // reader's font size, and this only decides which crop to ask the host for.
  const photoSrc = resolveAvatarSrc(
    seat.avatarUrl ?? undefined,
    Math.round(44 * imagePixelRatio()),
    { isFaceCrop: true },
  );

  return (
    <div
      className={styles.acAv}
      style={{ background: seat.background, color: seat.color }}
    >
      {photoSrc && !isPhotoBroken ? (
        <img
          className={styles.acAvPhoto}
          src={photoSrc}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setIsPhotoBroken(true)}
        />
      ) : (
        seat.initials
      )}
    </div>
  );
}
