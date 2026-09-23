import { useState } from "react";
import {
  imagePixelRatio,
  resolveAvatarSrc,
} from "../../../shared/lib/avatarUrl";

interface PersonaAvatarProps {
  initials: string;
  avatarUrl: string;
  /** Rendered size in CSS pixels, used to ask Unsplash for a crisp crop. */
  sizePx: number;
  className: string;
}

/** A persona's photo inside the showcase's own avatar box, so the box keeps
 * its tint, radius and size. Falls back to the initials if the photo fails.
 * Decorative: the persona's name always sits beside it. */
export function PersonaAvatar({
  initials,
  avatarUrl,
  sizePx,
  className,
}: PersonaAvatarProps) {
  const [hasImageFailed, setHasImageFailed] = useState(false);
  const imageSrc = resolveAvatarSrc(
    avatarUrl,
    Math.round(sizePx * imagePixelRatio()),
    { isFaceCrop: true },
  );
  return (
    <span className={className} aria-hidden="true">
      {hasImageFailed ? (
        initials
      ) : (
        <img
          src={imageSrc}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setHasImageFailed(true)}
        />
      )}
    </span>
  );
}
