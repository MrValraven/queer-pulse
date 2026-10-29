import { AnimatePresence, m } from "motion/react";
import { FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button, Collapse } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_EXIT, STUDIO_FADE } from "./studioMotion";
import { useStudioChipScroller } from "./useStudioChipScroller";
import type { StudioLikedGenres } from "./useStudioLikedGenres";
import browseCss from "./StudioBrowse.module.css";
import likedCss from "./StudioLikedPage.module.css";

/** The row itself, mounted with its Collapse so the edge-fade observer arms
 *  on the chips it finds there. */
function StudioLikedGenreRow({ genres }: { genres: StudioLikedGenres }) {
  const { t } = useTranslation();
  const format = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const { listRef, edgeProps } = useStudioChipScroller(
    `${genres.options.map((option) => option.genre).join("|")}#${genres.activeGenre ?? ""}`,
  );
  const fade = reducedMotion ? { duration: 0.12 } : STUDIO_FADE;
  // The picked chip's X grows from no width; with reduced motion it only
  // fades, at its full width, so the chips beside it never slide.
  const iconHidden = reducedMotion ? { opacity: 0 } : { width: 0, opacity: 0 };
  const iconShown = reducedMotion
    ? { opacity: 1 }
    : { width: "auto", opacity: 1 };
  return (
    <div
      role="group"
      aria-label={t("studio:liked.page.genreFilterLabel")}
      className={likedCss.genres}
    >
      <ul ref={listRef} className={browseCss.chips} {...edgeProps}>
        <AnimatePresence initial={false}>
          {genres.options.map((option) => {
            const isActive = option.genre === genres.activeGenre;
            return (
              <m.li
                key={option.genre}
                layout={reducedMotion ? false : "position"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: STUDIO_EXIT }}
                transition={fade}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  aria-pressed={isActive}
                  className={likedCss.genreChip}
                  onClick={() => genres.toggleGenre(option.genre)}
                >
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <m.span
                        key="clear"
                        className={likedCss.genreChipIcon}
                        initial={iconHidden}
                        animate={iconShown}
                        exit={{ ...iconHidden, transition: STUDIO_EXIT }}
                        transition={fade}
                      >
                        <FiX aria-hidden />
                      </m.span>
                    )}
                  </AnimatePresence>
                  {option.label}
                  <span className={likedCss.genreCount}>
                    <RollingNumber
                      value={format.number(option.count)}
                      numericValue={option.count}
                    />
                  </span>
                </Button>
              </m.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}

/** Liked songs' genre chips, under the search and the order: one per genre
 *  the likes carry, each with its count, a picked one marked with an X and
 *  picked again to clear it. The row grows in once every page is read and
 *  two genres are on offer. */
export function StudioLikedGenreChips({
  genres,
}: {
  genres: StudioLikedGenres;
}) {
  return (
    <Collapse isOpen={genres.isOpen}>
      <StudioLikedGenreRow genres={genres} />
    </Collapse>
  );
}
