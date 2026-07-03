import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from "./ModalKit";
import type { Workshop } from "./workshops.data";
import styles from "./ApplicationModals.module.css";

export function WorkshopReserveModal({
  workshop,
  onClose,
}: {
  workshop: Workshop;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState(workshop.tiers[0]?.label ?? "");
  const [note, setNote] = useState("");
  const { sending, done, submit } = useSubmitFlow();
  const title = `${workshop.title} ${workshop.titleEm}`;
  const valid = name.trim().length > 1 && /.+@.+\..+/.test(email) && !!tier;
  const chosen = workshop.tiers.find((t) => t.label === tier);

  return (
    <ModalShell
      onClose={onClose}
      success={done}
      ariaLabel={`Reserve a spot in ${title}`}
    >
      {done ? (
        <SuccessPanel
          title="Seat"
          em="held."
          onClose={onClose}
          closeLabel="Done"
        >
          Your spot in <strong>{title}</strong> is held for 48 hours. We've
          emailed {name.split(" ")[0]} a payment link at the{" "}
          <strong>{chosen?.amount}</strong> rate — pay whenever you're ready, no
          rush. See you {workshop.startDate}.
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>{workshop.format}</div>
          <h2 className={styles.title}>
            Reserve a spot in <em>{title}</em>
          </h2>
          <p className={styles.sub}>
            {workshop.spotsTotal - workshop.spotsFilled} of{" "}
            {workshop.spotsTotal} seats left. Reserving holds your place — no
            payment yet.
          </p>

          <div className={styles.field}>
            <label htmlFor="wr-name">Your name *</label>
            <input
              id="wr-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you?"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="wr-email">Email *</label>
            <input
              id="wr-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Where we send the payment link"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="wr-tier">What you'll pay *</label>
            <select
              id="wr-tier"
              value={tier}
              onChange={(e) => setTier(e.target.value)}
            >
              {workshop.tiers.map((t) => (
                <option key={t.label} value={t.label}>
                  {t.label} — {t.amount}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="wr-note">Anything the tutor should know</label>
            <textarea
              id="wr-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Access needs, experience level, a question…"
            />
          </div>
          <p className={styles.note}>
            Pick whichever rate is right for you. No proof, no questions — the
            sliding scale is how this stays open to everyone.
          </p>

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              Cancel
            </button>
            <Button
              variant="primary"
              size="lg"
              disabled={!valid || sending}
              onClick={() => valid && submit()}
            >
              {sending ? <Sending label="Holding…" /> : "Hold my spot"}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
