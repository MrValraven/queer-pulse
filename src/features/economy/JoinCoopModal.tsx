import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from "./ModalKit";
import type { FormingCoop } from "./housingCoop.data";
import styles from "./ApplicationModals.module.css";

const HOUSEHOLD_SIZES = [
  "Just me",
  "Me + partner(s)",
  "A household of 3–4",
  "A household of 5+",
];

export function JoinCoopModal({
  coop,
  onClose,
}: {
  coop: FormingCoop;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [household, setHousehold] = useState("");
  const [note, setNote] = useState("");
  const { sending, done, submit } = useSubmitFlow();
  const coopName = `${coop.name}${coop.nameEm ? ` ${coop.nameEm}` : ""}`;
  const valid = name.trim().length > 1 && !!household;

  return (
    <ModalShell
      onClose={onClose}
      success={done}
      ariaLabel={`Ask to join ${coopName}`}
    >
      {done ? (
        <SuccessPanel
          title="Request"
          em="sent."
          onClose={onClose}
          closeLabel="Done"
        >
          The organisers of <strong>{coopName}</strong> will see your interest
          and reach out to arrange a first conversation. No commitment yet — the
          early chats are about whether the fit is right, both ways.
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>{coop.phaseLabel}</div>
          <h2 className={styles.title}>
            Ask to join <em>{coopName}.</em>
          </h2>
          <p className={styles.sub}>
            {coop.location}. Tell them a little about who's joining — they'll
            follow up to set up a first conversation.
          </p>

          <div className={styles.field}>
            <label htmlFor="jc-name">Your name *</label>
            <input
              id="jc-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you?"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="jc-household">Who's joining *</label>
            <select
              id="jc-household"
              value={household}
              onChange={(e) => setHousehold(e.target.value)}
            >
              <option value="">Choose one…</option>
              {HOUSEHOLD_SIZES.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="jc-note">Anything you'd like them to know</label>
            <textarea
              id="jc-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What draws you to this co-op? Your situation, timeline, hopes…"
            />
          </div>
          <p className={styles.note}>
            Your request is shared only with this co-op's organisers. Joining a
            co-op is a long conversation, not a click — take your time.
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
              {sending ? <Sending label="Sending…" /> : "Send request"}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
