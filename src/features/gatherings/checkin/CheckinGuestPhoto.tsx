import { useState } from "react";
import {
  imagePixelRatio,
  resolveAvatarSrc,
} from "../../../shared/lib/avatarUrl";
import type { AttendeeRow } from "../api/events.adapters";

interface CheckinGuestPhotoProps {
  attendee: AttendeeRow;
  /** The rendered size in CSS pixels, used to ask the image host for a
   *  sharp enough render. The box itself is sized by `className`. */
  size: number;
  className?: string;
  /** The photo's text alternative. Left out, the photo is decorative
   *  because the guest's name is printed beside it. */
  alt?: string;
}

/**
 * A guest's profile photo on the Check-in tab, or their initials in the
 * row's own tint when there is no photo or it fails to load. The tint stays
 * on the box under a photo too, so a slow image fades in over a coloured
 * square.
 */
export function CheckinGuestPhoto({
  attendee,
  size,
  className,
  alt = "",
}: CheckinGuestPhotoProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const photoSrc = resolveAvatarSrc(
    attendee.avatarUrl,
    Math.round(size * imagePixelRatio()),
    { isFaceCrop: true },
  );
  const hasPhoto = Boolean(photoSrc) && photoSrc !== failedSrc;
  const isDecorative = !hasPhoto || alt === "";

  return (
    <span
      className={className}
      style={{ background: attendee.background, color: attendee.color }}
      aria-hidden={isDecorative || undefined}
    >
      {hasPhoto && photoSrc ? (
        <img
          src={photoSrc}
          alt={alt}
          width={size}
          height={size}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(photoSrc)}
        />
      ) : (
        attendee.initials
      )}
    </span>
  );
}
