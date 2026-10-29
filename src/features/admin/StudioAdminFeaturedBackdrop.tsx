import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useStudioAdminCoverReveal } from "./useStudioAdminCoverReveal";
import css from "./StudioAdminShelves.module.css";

/** The featured cover itself, blurred and faint behind the hero card, so
 *  the wash takes the colours of the art. A new cover crossfades over the
 *  old one; without a cover the card keeps its tint wash. Decorative. */
export function StudioAdminFeaturedBackdrop({
  coverUrl,
}: {
  coverUrl: string | null;
}) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence initial={false}>
      {coverUrl && (
        <m.span
          key={coverUrl}
          className={css.featuredBackdrop}
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.4 }}
        >
          <StudioAdminFeaturedBackdropImage coverUrl={coverUrl} />
        </m.span>
      )}
    </AnimatePresence>
  );
}

function StudioAdminFeaturedBackdropImage({ coverUrl }: { coverUrl: string }) {
  const { isCoverLoaded, onCoverLoad } = useStudioAdminCoverReveal(coverUrl);
  return (
    <img
      className={css.featuredBackdropImage}
      src={coverUrl}
      alt=""
      aria-hidden
      decoding="async"
      data-loaded={isCoverLoaded || undefined}
      onLoad={onCoverLoad}
    />
  );
}
