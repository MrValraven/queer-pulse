import { useId, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiPlus } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminStudioSpotlightArtistDTO } from "./api/studioSpotlightAdmin.api";
import {
  EMPTY_ADMIN_SPOTLIGHT,
  isNewStarsFull,
  newStarArtistIds,
} from "./studioAdminSpotlight.model";
import { StudioAdminNewStarRow } from "./StudioAdminNewStarRow";
import { StudioAdminSpotlightNoteDialog } from "./StudioAdminSpotlightNoteDialog";
import { StudioAdminSpotlightPicker } from "./StudioAdminSpotlightPicker";
import { useStudioAdminNewStarsActions } from "./useStudioAdminNewStarsActions";
import { focusNeighbourControl } from "./useStudioAdminReorderRow";
import css from "./StudioAdminSpotlight.module.css";

/** New stars: up to 12 artists in order, each with a drag handle, Move up,
 *  Move down, Edit note and Remove artist. Add artist sits by the count, or
 *  in the empty card while the list is empty. */
export function StudioAdminNewStars({
  stars,
}: {
  stars: AdminStudioSpotlightArtistDTO[];
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const fullHintId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const actions = useStudioAdminNewStarsActions(stars);
  const [isAdding, setIsAdding] = useState(false);
  const isFull = isNewStarsFull(stars);
  const isEmpty = stars.length === 0;
  const takenArtistIds = useMemo(
    () => newStarArtistIds({ ...EMPTY_ADMIN_SPOTLIGHT, newStars: stars }),
    [stars],
  );

  // The first add takes the empty card's button away, so focus moves to
  // the heading.
  function focusHeading() {
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function removeStar(star: AdminStudioSpotlightArtistDTO) {
    const removedIndex = stars.indexOf(star);
    actions.remove(star, () =>
      focusNeighbourControl({
        list: listRef.current,
        index: removedIndex,
        findControl: (row) =>
          row.querySelector<HTMLElement>("[data-spotlight-remove]"),
        fallback: headingRef.current,
      }),
    );
  }

  return (
    <section className={css.section} aria-labelledby={headingId}>
      <div className={css.head}>
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className={css.heading}
        >
          {t("admin:studioAdmin.spotlight.newStarsTitle")}
        </h2>
        <div className={css.headEnd}>
          <p className={css.count}>
            {t("admin:studioAdmin.spotlight.count", { count: stars.length })}
          </p>
          <Collapse isOpen={!isEmpty}>
            <Button
              variant="soft"
              size="sm"
              aria-disabled={isFull || undefined}
              aria-describedby={isFull ? fullHintId : undefined}
              onClick={() => {
                if (!isFull) setIsAdding(true);
              }}
            >
              <FiPlus aria-hidden />{" "}
              {t("admin:studioAdmin.spotlight.addArtist")}
            </Button>
          </Collapse>
        </div>
      </div>
      <Collapse isOpen={isFull}>
        <p id={fullHintId} className={css.fullHint}>
          {t("studio:errors.spotlightSlotFull")}
        </p>
      </Collapse>
      <Collapse isOpen={isEmpty}>
        <div className={css.emptyCard}>
          <p className={css.empty}>
            {t("admin:studioAdmin.spotlight.newStarsEmpty")}
          </p>
          <Button variant="soft" onClick={() => setIsAdding(true)}>
            <FiPlus aria-hidden /> {t("admin:studioAdmin.spotlight.addArtist")}
          </Button>
        </div>
      </Collapse>
      <ol ref={listRef} className={css.list} aria-labelledby={headingId}>
        <AnimatePresence initial={false}>
          {stars.map((star, index) => (
            <StudioAdminNewStarRow
              key={star.id}
              star={star}
              index={index}
              count={stars.length}
              isBusy={actions.isBusy}
              onMove={(targetIndex) => actions.move(star, targetIndex)}
              onDropAt={(draggedId) => {
                const dragged = stars.find(
                  (candidate) => candidate.id === draggedId,
                );
                if (dragged) actions.move(dragged, index);
              }}
              onEditNote={() => actions.openNote(star)}
              onRemove={() => removeStar(star)}
            />
          ))}
        </AnimatePresence>
      </ol>
      <p className="visuallyHidden" role="status">
        {actions.statusMessage}
      </p>
      <AnimatePresence>
        {isAdding && (
          <StudioAdminSpotlightPicker
            slot="new_stars"
            takenArtistIds={takenArtistIds}
            onSaved={isEmpty ? focusHeading : undefined}
            onClose={() => setIsAdding(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {actions.noteTarget && (
          <StudioAdminSpotlightNoteDialog
            spotlightArtist={actions.noteTarget}
            onClose={actions.closeNote}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
