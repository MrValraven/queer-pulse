import { useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiDisc } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { tintForId } from "../studio/api/studio.adapters";
import type { AdminStudioPickDTO } from "./api/studioDiscoveryAdmin.api";
import { StudioAdminFeaturedBackdrop } from "./StudioAdminFeaturedBackdrop";
import { StudioAdminFeaturedPick } from "./StudioAdminFeaturedPick";
import { StudioAdminNoteDialog } from "./StudioAdminNoteDialog";
import { StudioAdminPickDialog } from "./StudioAdminPickDialog";
import { useStudioAdminShelfActions } from "./useStudioAdminShelfActions";
import { STUDIO_ADMIN_SHELF_ADD_KEY } from "./studioAdmin.model";
import css from "./StudioAdminShelves.module.css";

/** The featured slot as the hero of the tab: the release Studio home leads
 *  with, washed in its own blurred cover (or its tint when it has none),
 *  with Replace, Edit note and Remove pick. Empty, it says Studio home
 *  shows the newest release until one is chosen. It holds one pick, so
 *  nothing here reorders. After a set or replace, focus lands on the new
 *  card's Replace button, or on the heading if that never mounts. */
export function StudioAdminFeaturedShelf({
  pick,
}: {
  pick: AdminStudioPickDTO | null;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { shelfLabel, isBusy, removePick, noteTarget, openNote, closeNote } =
    useStudioAdminShelfActions("featured");
  const [isPicking, setIsPicking] = useState(false);
  const replaceButtonRef = useRef<HTMLButtonElement | null>(null);
  // The id of the pick just set, until its card's Replace button has focus.
  const focusPendingPickIdRef = useRef<string | null>(null);
  const takenReleaseIds = useMemo(
    () => (pick ? [pick.release.id] : []),
    [pick],
  );
  const coverUrl = pick?.release.coverUrl ?? null;
  const swap = {
    initial: { opacity: 0, y: reducedMotion ? 0 : 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reducedMotion ? 0 : -4 },
    transition: { duration: reducedMotion ? 0 : 0.22 },
  };

  /** The new card's Replace button takes the focus the dialog held. The
   *  old card's button, still mounted while it fades, is passed over. */
  function attachReplaceButton(button: HTMLButtonElement | null) {
    replaceButtonRef.current = button;
    const pendingPickId = focusPendingPickIdRef.current;
    const cardPickId = button
      ?.closest("[data-pick-id]")
      ?.getAttribute("data-pick-id");
    if (!button || pendingPickId === null || cardPickId !== pendingPickId)
      return;
    focusPendingPickIdRef.current = null;
    requestAnimationFrame(() => button.focus());
  }

  /** Once the old card has gone, a focus still pending lands on the
   *  heading, the way Remove pick hands it back. */
  function focusHeadingIfPending() {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (focusPendingPickIdRef.current === null) return;
        focusPendingPickIdRef.current = null;
        (replaceButtonRef.current ?? headingRef.current)?.focus();
      }),
    );
  }

  return (
    <section
      className={css.featured}
      data-filled={pick !== null || undefined}
      aria-labelledby={headingId}
    >
      <span
        className={css.featuredWash}
        data-tint={pick && !coverUrl ? tintForId(pick.release.id) : undefined}
        aria-hidden
      />
      <StudioAdminFeaturedBackdrop coverUrl={coverUrl} />
      <h2
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className={css.featuredEyebrow}
      >
        {shelfLabel}
      </h2>
      <AnimatePresence
        mode="wait"
        initial={false}
        onExitComplete={focusHeadingIfPending}
      >
        {pick ? (
          <m.div
            key={pick.id}
            className={css.featuredBody}
            data-pick-id={pick.id}
            {...swap}
          >
            <StudioAdminFeaturedPick
              pick={pick}
              shelfLabel={shelfLabel}
              isBusy={isBusy}
              replaceButtonRef={attachReplaceButton}
              onReplace={() => setIsPicking(true)}
              onEditNote={() => openNote(pick)}
              onRemove={() =>
                removePick(pick, () =>
                  requestAnimationFrame(() => headingRef.current?.focus()),
                )
              }
            />
          </m.div>
        ) : (
          <m.div key="empty" className={css.featuredBody} {...swap}>
            <span className={css.featuredPlaceholder} aria-hidden>
              <FiDisc />
            </span>
            <div className={css.featuredInfo}>
              <p className={css.featuredEmptyLine}>
                {t("admin:studioAdmin.featured.emptyBody")}
              </p>
              <div className={css.featuredActions}>
                <Button variant="primary" onClick={() => setIsPicking(true)}>
                  {t(STUDIO_ADMIN_SHELF_ADD_KEY.featured)}
                </Button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isPicking && (
          <StudioAdminPickDialog
            shelf="featured"
            takenReleaseIds={takenReleaseIds}
            currentFeatured={pick}
            onAdded={(addedPick) => {
              focusPendingPickIdRef.current = addedPick.id;
            }}
            onClose={() => setIsPicking(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {noteTarget && (
          <StudioAdminNoteDialog pick={noteTarget} onClose={closeNote} />
        )}
      </AnimatePresence>
    </section>
  );
}
