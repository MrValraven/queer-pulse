import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from "./ModalKit";
import styles from "./ApplicationModals.module.css";

export function BarterQuestionModal({
  name,
  firstName,
  onClose,
}: {
  name: string;
  firstName: string;
  onClose: () => void;
}) {
  const [question, setQuestion] = useState("");
  const { sending, done, submit } = useSubmitFlow();
  const valid = question.trim().length >= 10;

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title="Question"
          em="sent."
          onClose={onClose}
          closeLabel="Done"
        >
          Your question is on its way to <strong>{name}</strong>. No swap is
          agreed until you both say yes — this is just a chat to see if it could
          work. You'll get a notification here when they reply.
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>Before you propose</div>
          <h2 className={styles.title}>
            Ask <em>{firstName}</em> a question.
          </h2>
          <p className={styles.sub}>
            Not ready to propose a swap yet? Ask what you need to know first —
            timing, what they're after, how it'd work. Friendly and
            low-pressure.
          </p>

          <div className={styles.field}>
            <label htmlFor="bq-msg">Your question *</label>
            <textarea
              id="bq-msg"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={`Hi ${firstName} — quick question before I propose a swap…`}
            />
          </div>
          <p className={styles.note}>
            {question.trim().length < 10
              ? `${10 - question.trim().length} more characters to send.`
              : "Keep it on QueerPulse until you both agree to take it further."}
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
              {sending ? <Sending label="Sending…" /> : "Send question"}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
