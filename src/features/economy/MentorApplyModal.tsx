import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from "./ModalKit";
import { APPLY_FOCUS_AREAS } from "./mentorProfile.data";
import styles from "./ApplicationModals.module.css";

export function MentorApplyModal({
  mentorName,
  onClose,
}: {
  mentorName: string;
  onClose: () => void;
}) {
  const [focus, setFocus] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const { sending, done, submit } = useSubmitFlow();
  const valid = !!focus && message.trim().length >= 30;

  const toggle = (area: string) =>
    setFocus((cur) => (cur === area ? null : area));

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title="Request"
          em="sent."
          onClose={onClose}
          closeLabel="Done"
        >
          Your request to work with <strong>{mentorName}</strong> on{" "}
          <strong>{focus}</strong> is on its way. She reviews applications for
          the '26 cohort personally and usually replies within a week. You'll
          get a notification here.
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>Apply to mentor with</div>
          <h2 className={styles.title}>
            Request a session with <em>{mentorName.split(" ")[0]}.</em>
          </h2>
          <p className={styles.sub}>
            Tell her where you'd like to focus and a little about your work.
            There's no upfront cost — mentees get a free Sustainer membership
            for the year.
          </p>

          <div className={styles.field}>
            <label>Focus area *</label>
            <div className={styles.levers}>
              {APPLY_FOCUS_AREAS.map((area) => (
                <button
                  key={area}
                  type="button"
                  className={[styles.lever, focus === area && styles.leverOn]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => toggle(area)}
                  aria-pressed={focus === area}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="ma-msg">
              A note to {mentorName.split(" ")[0]} *
            </label>
            <textarea
              id="ma-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What are you working on, and what would make this mentorship worth her time and yours?"
            />
          </div>
          <p className={styles.note}>
            {message.trim().length < 30
              ? `${30 - message.trim().length} more characters to send.`
              : "Specific beats polished. She mentors people with a concrete thing to make."}
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
              {sending ? <Sending label="Sending request…" /> : "Send request"}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
