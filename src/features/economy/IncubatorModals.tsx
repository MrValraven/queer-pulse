import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from "./ModalKit";
import styles from "./ApplicationModals.module.css";

/* ── Apply for cohort 3 ─────────────────────────────────────────────── */
export function CohortApplyModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pitch, setPitch] = useState("");
  const { sending, done, submit } = useSubmitFlow();
  const valid =
    name.trim().length > 1 &&
    /.+@.+\..+/.test(email) &&
    pitch.trim().length >= 30;

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title="Application"
          em="received."
          onClose={onClose}
          closeLabel="Done"
        >
          Thanks, <strong>{name.split(" ")[0]}</strong>. Cohort 3 applications
          are read by the programme team after the 30 July deadline — you'll
          hear back within three weeks, whatever we decide.
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>Incubator · Cohort 3</div>
          <h2 className={styles.title}>
            Apply to <em>build your thing.</em>
          </h2>
          <p className={styles.sub}>
            Six months of mentorship, peer accountability, and warm intros. No
            pitch deck required — just tell us what you're making and where
            you're at.
          </p>

          <div className={styles.field}>
            <label htmlFor="ca-name">Your name *</label>
            <input
              id="ca-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First and last"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="ca-email">Email *</label>
            <input
              id="ca-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="ca-pitch">What are you building? *</label>
            <textarea
              id="ca-pitch"
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="A couple of sentences on your idea, where you are, and what you most need help with."
            />
          </div>
          <p className={styles.note}>
            {pitch.trim().length < 30
              ? `${30 - pitch.trim().length} more characters in your pitch to submit.`
              : "Looks good. Decisions go out within three weeks of the deadline."}
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
              {sending ? <Sending label="Submitting…" /> : "Submit application"}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}

/* ── Become a mentor ────────────────────────────────────────────────── */
export function MentorSignupModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [expertise, setExpertise] = useState("");
  const [why, setWhy] = useState("");
  const { sending, done, submit } = useSubmitFlow();
  const valid =
    name.trim().length > 1 &&
    /.+@.+\..+/.test(email) &&
    expertise.trim().length > 1 &&
    why.trim().length >= 30;

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title="You're on the"
          em="list."
          onClose={onClose}
          closeLabel="Done"
        >
          Thank you, <strong>{name.split(" ")[0]}</strong>. The mentorship team
          will reach out to match you with a founder whose sector and stage fit
          what you offer. Mentors meet their match fortnightly across the
          cohort.
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>Incubator · Mentorship</div>
          <h2 className={styles.title}>
            Become a <em>mentor.</em>
          </h2>
          <p className={styles.sub}>
            Give a few hours a month to a queer founder finding their feet. We
            match on sector, stage, and the things you actually know.
          </p>

          <div className={styles.field}>
            <label htmlFor="ms-name">Your name *</label>
            <input
              id="ms-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First and last"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="ms-email">Email *</label>
            <input
              id="ms-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="ms-exp">Where can you help? *</label>
            <input
              id="ms-exp"
              type="text"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="e.g. Product, fundraising, legal, hiring"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="ms-why">Why mentor? *</label>
            <textarea
              id="ms-why"
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              placeholder="A sentence or two on what you'd bring and who you'd most like to support."
            />
          </div>
          <p className={styles.note}>
            {why.trim().length < 30
              ? `${30 - why.trim().length} more characters to submit.`
              : "We review every mentor before matching — expect to hear from us soon."}
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
              {sending ? <Sending label="Submitting…" /> : "Sign up to mentor"}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}

/* ── Request a mentoring session ─────────────────────────────────────── */
export function RequestSessionModal({
  mentorName,
  mentorRole,
  onClose,
}: {
  mentorName: string;
  mentorRole: string;
  onClose: () => void;
}) {
  const [when, setWhen] = useState("");
  const [message, setMessage] = useState("");
  const { sending, done, submit } = useSubmitFlow();
  const valid = when.trim().length > 1 && message.trim().length >= 20;

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title="Session"
          em="requested."
          onClose={onClose}
          closeLabel="Done"
        >
          Your request reached <strong>{mentorName.split(" ")[0]}</strong>.
          Mentors reply within a few days to confirm a time — keep an eye on
          your email, and the intro will come from there.
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>Incubator · {mentorRole}</div>
          <h2 className={styles.title}>
            Request a session with <em>{mentorName}.</em>
          </h2>
          <p className={styles.sub}>
            A short note goes a long way. Say what you're working on and when
            you'd like to meet —{mentorName.split(" ")[0]} will reply to set it
            up.
          </p>

          <div className={styles.field}>
            <label htmlFor="rs-when">Preferred time *</label>
            <input
              id="rs-when"
              type="text"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              placeholder="e.g. Weekday evenings, or Tue/Thu afternoons"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="rs-msg">
              What would you like to talk through? *
            </label>
            <textarea
              id="rs-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="A couple of sentences on where you are and what you'd most like help with."
            />
          </div>
          <p className={styles.note}>
            {message.trim().length < 20
              ? `${20 - message.trim().length} more characters so they have context.`
              : "Looks good. Mentors usually reply within a few days."}
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
