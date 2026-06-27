import { FiAlertTriangle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from "./ModalKit";
import { type Application, withdrawnPatch } from "./applicationStatus.data";
import { WITHDRAW_REASONS } from "./applicationModals.data";
import styles from "./ApplicationModals.module.css";

/** Confirm withdrawing an application — changes card state. */
export function WithdrawModal({
  app,
  onClose,
  onPatch,
}: {
  app: Application;
  onClose: () => void;
  onPatch: (id: string, patch: Partial<Application>) => void;
}) {
  const { submit, sending, done } = useSubmitFlow();

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel title="Application" em="withdrawn." onClose={onClose}>
          We've let {app.companyName} know politely. This role has moved to your Closed tab.
        </SuccessPanel>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(() => onPatch(app.id, withdrawnPatch()));
          }}
        >
          <div className={styles.eyebrow}>Withdraw</div>
          <h2 className={styles.title}>
            Step back from <em>{app.companyName}?</em>
          </h2>
          <p className={styles.sub}>
            This removes you from consideration for <b>{app.title}</b>. We'll send a brief, polite
            note on your behalf — you don't have to write anything.
          </p>
          <div className={styles.field}>
            <label htmlFor="wd-reason">Reason (only you see this)</label>
            <select id="wd-reason" defaultValue="">
              <option value="">Pick a reason, or leave it open</option>
              {WITHDRAW_REASONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className={styles.note}>
            <FiAlertTriangle size={13} style={{ marginRight: 5, verticalAlign: "-2px" }} aria-hidden />
            This can't be undone — you'd need to re-apply.
          </div>
          <div className={styles.foot}>
            <button type="button" className={styles.back} onClick={onClose} disabled={sending}>
              ← Keep it
            </button>
            <Button size="lg" type="submit" disabled={sending}>
              {sending ? <Sending label="Withdrawing…" /> : "Withdraw application"}
            </Button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}
