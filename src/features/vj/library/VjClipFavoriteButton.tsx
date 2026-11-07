import { m } from "motion/react";
import { useState } from "react";
import { FiStar } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import type { VjClipDTO } from "../../../shared/contracts/vj";
import { useToast } from "../../../shared/components/feedback/useToast";
import { IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useVjClipFavorite } from "../api/useVjClipFavorite";
import { vjErrorKeyOf, vjErrorValuesOf } from "../vjErrors";
import styles from "./VjClips.module.css";

/** A short, settled spring for the star's pop when it flips. */
const STAR_SPRING = { type: "spring", stiffness: 520, damping: 22 } as const;

/**
 * The favorite star for one clip, a real toggle (`aria-pressed`). It flips at
 * once through the optimistic write; a refusal puts it back and a toast names
 * the reason. `className` lands on the wrapper, so a caller can place it (the
 * card pins it over the thumbnail's corner).
 */
export function VjClipFavoriteButton({
  clip,
  className,
}: {
  clip: VjClipDTO;
  className?: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { reducedMotion } = useMotionPrefs();
  const favorite = useVjClipFavorite();
  // The star pops only after a press here (the flip and any rollback), so a
  // grid of stars never animates as it loads.
  const [hasPressed, setHasPressed] = useState(false);
  const isFavorite = clip.isFavorite;

  const toggle = () => {
    setHasPressed(true);
    favorite.mutate(
      { clipId: clip.id, isFavorite: !isFavorite },
      {
        onError: (cause) => {
          showToast(t(vjErrorKeyOf(cause), vjErrorValuesOf(cause)), "error");
        },
      },
    );
  };

  return (
    <span className={className}>
      <IconButton
        size="sm"
        className={styles.starButton}
        aria-pressed={isFavorite}
        aria-label={t(isFavorite ? "vj:favorite.remove" : "vj:favorite.add", {
          title: clip.title,
        })}
        tooltip={t(
          isFavorite ? "vj:favorite.tooltipRemove" : "vj:favorite.tooltipAdd",
        )}
        tooltipPlacement="floating-top"
        onClick={toggle}
      >
        <m.span
          // A new key remounts the glyph, so each flip pops from small.
          key={isFavorite ? "on" : "off"}
          className={styles.starGlyph}
          initial={hasPressed && !reducedMotion ? { scale: 0.55 } : false}
          animate={{ scale: 1 }}
          transition={reducedMotion ? { duration: 0 } : STAR_SPRING}
        >
          <FiStar
            aria-hidden="true"
            focusable="false"
            fill={isFavorite ? "currentColor" : "none"}
          />
        </m.span>
      </IconButton>
    </span>
  );
}
