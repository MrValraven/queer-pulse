import { useId, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiEdit2, FiRefreshCw, FiStar, FiX } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Collapse } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useClearAdminStudioArtistOfTheMonth } from "./api/StudioAdminSpotlightMutations";
import type { AdminStudioSpotlightArtistDTO } from "./api/studioSpotlightAdmin.api";
import { studioAdminSaveErrorKeyOf } from "./studioAdmin.model";
import { isPickedBeforeThisMonth } from "./studioAdminSpotlight.model";
import { StudioAdminSpotlightNoteDialog } from "./StudioAdminSpotlightNoteDialog";
import {
  StudioAdminSpotlightHiddenLine,
  StudioAdminSpotlightIdentity,
  StudioAdminSpotlightNoteLine,
} from "./StudioAdminSpotlightParts";
import { StudioAdminSpotlightPicker } from "./StudioAdminSpotlightPicker";
import css from "./StudioAdminSpotlight.module.css";

const PICKED_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};
const PICKED_MONTH_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "long",
  year: "numeric",
};

/** Re-picking the current artist is allowed, so nobody is held back. */
const NO_TAKEN_ARTISTS: ReadonlySet<string> = new Set();

/** The Artist of the month slot: the pick with the day it was made (or, once
 *  the month turns, a line asking for a fresh pick), its note, and Change
 *  artist, Edit note and Remove artist. */
export function StudioAdminArtistOfTheMonth({
  spotlightArtist,
}: {
  spotlightArtist: AdminStudioSpotlightArtistDTO | null;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const clear = useClearAdminStudioArtistOfTheMonth();
  const [nowMs] = useState(() => Date.now());
  const [isPicking, setIsPicking] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  // The card keeps the last pick on screen while it folds away.
  const [shownArtist, setShownArtist] = useState(spotlightArtist);
  if (spotlightArtist !== null && spotlightArtist !== shownArtist)
    setShownArtist(spotlightArtist);
  const isSet = spotlightArtist !== null;
  const pickedAt = shownArtist ? new Date(shownArtist.createdAt) : null;
  const isStale =
    shownArtist !== null &&
    isPickedBeforeThisMonth(shownArtist.createdAt, nowMs);
  const name = shownArtist?.artist.name ?? "";
  // While Remove is on its way, the other two actions wait for it.
  const isRemoving = clear.isPending;

  function focusHeading() {
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function removeArtist() {
    if (!spotlightArtist || clear.isPending) return;
    const removedName = spotlightArtist.artist.name;
    clear.mutate(undefined, {
      onSuccess: () => {
        showToast(
          t("admin:studioAdmin.spotlight.removed", { name: removedName }),
          "success",
        );
        focusHeading();
      },
      onError: (cause) =>
        showToast(t(studioAdminSaveErrorKeyOf(cause)), "error"),
    });
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
          {t("admin:studioAdmin.spotlight.monthTitle")}
        </h2>
      </div>
      <Collapse isOpen={!isSet}>
        <div className={css.emptyCard}>
          <p className={css.empty}>
            {t("admin:studioAdmin.spotlight.monthEmpty")}
          </p>
          <Button variant="primary" onClick={() => setIsPicking(true)}>
            <FiStar aria-hidden /> {t("admin:studioAdmin.spotlight.pickArtist")}
          </Button>
        </div>
      </Collapse>
      <Collapse isOpen={isSet}>
        {shownArtist && pickedAt && (
          <div className={css.card}>
            <div className={css.cardBody}>
              <StudioAdminSpotlightIdentity artist={shownArtist.artist} />
              <Collapse isOpen={!isStale}>
                <p className={css.meta}>
                  {t("admin:studioAdmin.spotlight.pickedOn", {
                    date: fmt.date(pickedAt, PICKED_DATE_OPTIONS),
                  })}
                </p>
              </Collapse>
              <Collapse isOpen={isStale}>
                <p className={css.stale}>
                  {t("admin:studioAdmin.spotlight.stale", {
                    month: fmt.date(pickedAt, PICKED_MONTH_OPTIONS),
                  })}
                </p>
              </Collapse>
              <Collapse isOpen={!shownArtist.isListenable}>
                <StudioAdminSpotlightHiddenLine />
              </Collapse>
              <StudioAdminSpotlightNoteLine note={shownArtist.note} />
            </div>
            <div className={css.actions}>
              <Button
                variant={isStale ? "primary" : "ghost"}
                size="sm"
                aria-disabled={isRemoving || undefined}
                onClick={() => {
                  if (!isRemoving) setIsPicking(true);
                }}
              >
                <FiRefreshCw aria-hidden />{" "}
                {t("admin:studioAdmin.spotlight.changeArtist")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label={t("admin:studioAdmin.spotlight.editNoteAria", {
                  name,
                })}
                aria-disabled={isRemoving || undefined}
                onClick={() => {
                  if (!isRemoving) setIsEditingNote(true);
                }}
              >
                <FiEdit2 aria-hidden />{" "}
                {t("admin:studioAdmin.spotlight.editNote")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label={t("admin:studioAdmin.spotlight.removeAria", {
                  name,
                })}
                aria-disabled={isRemoving || undefined}
                aria-busy={isRemoving || undefined}
                onClick={removeArtist}
              >
                <FiX aria-hidden />{" "}
                {t("admin:studioAdmin.spotlight.removeArtist")}
              </Button>
            </div>
          </div>
        )}
      </Collapse>
      <AnimatePresence>
        {isPicking && (
          <StudioAdminSpotlightPicker
            slot="artist_of_the_month"
            takenArtistIds={NO_TAKEN_ARTISTS}
            onSaved={isSet ? undefined : focusHeading}
            onClose={() => setIsPicking(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isEditingNote && spotlightArtist && (
          <StudioAdminSpotlightNoteDialog
            spotlightArtist={spotlightArtist}
            onClose={() => setIsEditingNote(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
