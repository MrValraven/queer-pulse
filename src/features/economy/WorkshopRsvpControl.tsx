import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useWorkshopsActions } from "../../app/providers/useWorkshops";
import type { WorkshopWithRsvp } from "./api/workshops.adapters";
import styles from "./WorkshopPage.module.css";

/**
 * The reserve / waitlist control, and the state that goes with it.
 *
 * Four states, all driven off one `WorkshopRsvpState` from the provider:
 *
 *  - **holding a spot** — confirmation plus a way to give it back
 *  - **queued** — same, for the waitlist
 *  - **full** — the CTA books a place in the queue instead of a seat
 *  - **open** — the plain reserve CTA
 *
 * The host never sees any of this: `WorkshopSidebar` renders the attendee count
 * for them instead. Hosts can't book their own workshop (the backend 403s), and
 * offering a control that is going to fail is exactly what `isHost` exists to
 * prevent — the same rule `WorkshopHostControls` follows for edit/delete.
 */
export function WorkshopRsvpControl({
  workshop,
}: {
  workshop: WorkshopWithRsvp;
}) {
  const { t } = useTranslation();
  const { getRsvp, rsvpWorkshop, cancelRsvp, isPending } =
    useWorkshopsActions();
  const [failed, setFailed] = useState(false);

  const seed = {
    status: workshop.myRsvpStatus ?? null,
    spotsFilled: workshop.spotsFilled,
    spotsTotal: workshop.spotsTotal,
  };
  const { status, spotsFilled, spotsTotal } = getRsvp(workshop.id, seed);
  const busy = isPending(workshop.id);
  const full = spotsFilled >= spotsTotal;

  const book = async () => {
    setFailed(false);
    if (!(await rsvpWorkshop(workshop.id, seed))) setFailed(true);
  };

  const release = async () => {
    setFailed(false);
    if (!(await cancelRsvp(workshop.id, seed))) setFailed(true);
  };

  return (
    <div className={styles.cta}>
      {status !== null && (
        <p className={styles.rsvpState}>
          <b>
            {status === "going"
              ? t("economy:workshopRsvp.holdingTitle")
              : t("economy:workshopRsvp.waitlistTitle")}
          </b>
          {status === "going"
            ? t("economy:workshopRsvp.holdingNote")
            : t("economy:workshopRsvp.waitlistNote")}
        </p>
      )}

      {status === null ? (
        <Button variant="primary" disabled={busy} onClick={() => void book()}>
          {busy
            ? t("economy:workshopRsvp.savingLabel")
            : full
              ? t("economy:workshopRsvp.joinWaitlistCta")
              : t("economy:workshopRsvp.reserveCta")}
        </Button>
      ) : (
        <Button variant="ghost" disabled={busy} onClick={() => void release()}>
          {busy
            ? t("economy:workshopRsvp.savingLabel")
            : status === "going"
              ? t("economy:workshopRsvp.releaseCta")
              : t("economy:workshopRsvp.leaveWaitlistCta")}
        </Button>
      )}

      {failed && (
        <p className={styles.rsvpError} role="alert">
          {t("economy:workshopRsvp.failedNote")}
        </p>
      )}
    </div>
  );
}
