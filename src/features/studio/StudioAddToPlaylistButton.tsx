import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiPlusCircle } from "react-icons/fi";
import { Button, IconButton } from "../../shared/components/ui";
import { StudioAddToPlaylistPicker } from "./StudioAddToPlaylistPicker";
import type { StudioLikeSubject } from "./useStudioLike";

/** The trigger every "Add to playlist" surface uses (release hero, track
 *  hero, player bar). With no track to add it stays focusable and says so
 *  through aria-disabled. Focus returns here when the picker closes. With
 *  a label it is a quiet Button, else an IconButton; the caller's
 *  className rides on either, so each surface keeps its own look. */
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
  const open = () => {
    if (!isBlocked) setIsOpen(true);
  };
  return (
    <>
      {label ? (
        <Button
          variant="quiet"
          className={className}
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-disabled={isBlocked || undefined}
          onClick={open}
        >
          <FiPlusCircle aria-hidden />
          {/* A text space keeps the icon off the label in any parent, flex
              or not, the way the sibling Save buttons do. */}{" "}
          <span>{label}</span>
        </Button>
      ) : (
        <IconButton
          className={className}
          aria-label={ariaLabel ?? subjectTitle}
          aria-haspopup="dialog"
          aria-disabled={isBlocked || undefined}
          onClick={open}
        >
          <FiPlusCircle aria-hidden />
        </IconButton>
      )}
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
