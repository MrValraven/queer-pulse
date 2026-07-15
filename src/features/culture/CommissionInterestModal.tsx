import { useState } from "react";
import { Button, Avatar } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useCreateCommissionInterest } from "./api/useCreateCommissionInterest";
import { ModalShell, SuccessPanel, Sending } from "./CultureModalKit";
import type { Commission } from "./culture.data";
import styles from "./CultureModals.module.css";

/**
 * Express-interest flow for a commission. Confirms intent, then shows a
 * plum-panel "we'll connect you if the creator wants to move forward" state.
 * Calls onSent so the card keeps its sent state after closing.
 *
 * The commission board's projects are curated editorial content
 * (`culture.data.tsx`), but this submission is real member data — it calls
 * `POST /commissions/interest` in live mode (see `useCreateCommissionInterest`),
 * demo mode keeps the prototype's simulated success.
 */
export function CommissionInterestModal({
  commission,
  onClose,
  onSent,
}: {
  commission: Commission;
  onClose: () => void;
  onSent: () => void;
}) {
  const { showToast } = useToast();
  const [message, setMessage] = useState("");
  const mutation = useCreateCommissionInterest();
  const sending = mutation.isPending;
  const done = mutation.isSuccess;

  function submit() {
    mutation.mutate(
      {
        commissionTitle: commission.title,
        commissionCategory: commission.cat,
        recipientName: commission.who.name,
        message: message.trim() || undefined,
      },
      {
        onError: () =>
          showToast("Couldn't send your interest — please try again.", "error"),
      },
    );
  }

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title="Interest"
          em="sent."
          steps={[
            <>{commission.who.name} can see your note and profile.</>,
            "If they want to move forward, we'll introduce you by email.",
            "No pressure either way — collaborations here are always a yes from both sides.",
          ]}
          onClose={() => {
            onSent();
            onClose();
          }}
        >
          We'll connect you with {commission.who.name} if they'd like to take it
          further.
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>Express interest</div>
          <h2 className={styles.title}>
            Reach out to <em>{commission.who.name.split(" ")[0]}</em>
          </h2>
          <p className={styles.sub}>
            Tell them a little about you and why this project speaks to you.
            They'll only see this if you send.
          </p>

          <div className={styles.panel}>
            <Avatar
              initials={commission.who.initials}
              tint={commission.who.tint}
              size={40}
            />
            <div>
              <div className={styles.panelCat}>{commission.catLabel}</div>
              <div className={styles.panelTitle}>{commission.title}</div>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="ci-msg">Your message (optional)</label>
            <textarea
              id="ci-msg"
              placeholder="What you'd bring, what you've made before, or just hello…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className={styles.foot}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={sending}
              onClick={() => submit()}
            >
              {sending ? <Sending label="Sending…" /> : "Send interest"}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
