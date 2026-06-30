import { Button } from "../../shared/components/ui";
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from "./ModalKit";
import {
  type Application,
  submittedDraftPatch,
} from "./applicationStatus.data";
import styles from "./ApplicationModals.module.css";

/** Finish and submit a draft application — moves the card to Active. */
export function ResumeModal({
  app,
  onClose,
  onPatch,
}: {
  app: Application;
  onClose: () => void;
  onPatch: (id: string, patch: Partial<Application>) => void;
}) {
  const d = app.draft;
  const { submit, sending, done } = useSubmitFlow();

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel title="Application" em="sent." onClose={onClose}>
          Nicely done — your application to {app.companyName} is in. It's now in
          your Active tab.
        </SuccessPanel>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(() => onPatch(app.id, submittedDraftPatch()));
          }}
        >
          <div className={styles.eyebrow}>Resume draft · {d?.deadline}</div>
          <h2 className={styles.title}>
            Finish your <em>application.</em>
          </h2>
          <div className={styles.progress}>
            <div
              className={styles.progressFill}
              style={{ width: `${d?.percent ?? 0}%` }}
            />
          </div>
          <p className={styles.progressL}>
            {d?.percent}% done · {d?.remaining.length} things left
          </p>
          <div className={styles.field}>
            <label htmlFor="rs-cover">Cover letter</label>
            <textarea
              id="rs-cover"
              placeholder="A few honest lines on why this role."
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="rs-avail">Availability</label>
            <input
              id="rs-avail"
              type="text"
              placeholder="e.g. Two weeks' notice"
              required
            />
          </div>
          <div className={styles.foot}>
            <button
              type="button"
              className={styles.back}
              onClick={onClose}
              disabled={sending}
            >
              ← Save &amp; close
            </button>
            <Button size="lg" type="submit" disabled={sending}>
              {sending ? (
                <Sending label="Submitting…" />
              ) : (
                "Submit application →"
              )}
            </Button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}
