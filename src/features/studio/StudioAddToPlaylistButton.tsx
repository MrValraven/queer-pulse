import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiPlusCircle } from "react-icons/fi";
import { StudioAddToPlaylistPicker } from "./StudioAddToPlaylistPicker";
import type { StudioLikeSubject } from "./useStudioLike";

/** The trigger every "Add to playlist" surface uses (release hero, track
 *  hero, player bar). With no track to add it stays focusable and says so
 *  through aria-disabled. Focus returns here when the picker closes. */
export function StudioAddToPlaylistButton({
  trackIds,
  subjectTitle,
  label,
  ariaLabel,
  className,
  likeSubject,
}: {
  trackIds: string[];
  subjectTitle: string;
  /** Visible text; omit for an icon-only control and pass ariaLabel. */
  label?: string;
  ariaLabel?: string;
  className?: string;
  /** A single track's like: the picker then offers Liked songs first. */
  likeSubject?: StudioLikeSubject;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isBlocked = trackIds.length === 0;
  return (
    <>
      <button
        type="button"
        className={className}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-disabled={isBlocked || undefined}
        onClick={() => {
          if (!isBlocked) setIsOpen(true);
        }}
      >
        <FiPlusCircle aria-hidden />
        {/* A text space keeps the icon off the label in any parent, flex or
            not, the way the sibling Save buttons do. */}
        {label && " "}
        {label && <span>{label}</span>}
      </button>
      <AnimatePresence>
        {isOpen && (
          <StudioAddToPlaylistPicker
            key="picker"
            trackIds={trackIds}
            subjectTitle={subjectTitle}
            likeSubject={likeSubject}
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
