import { useState, type FormEvent } from "react";
import {
  Avatar,
  Button,
  FormField,
  Sending,
  type AvatarTint,
} from "../../shared/components/ui";
import { EMAIL_RE, REASONS } from "./connectModal.data";
import styles from "./ConnectModal.module.css";

type FormMember = {
  first: string;
  last: string;
  role: string;
  initials: string;
  tint?: AvatarTint;
  photo?: string;
};

/** The reach-out form. Owns its field state; tells the parent when a valid
 *  message is submitted so the parent can simulate delivery. */
export function ConnectForm({
  member,
  sending,
  onSubmit,
  onClose,
}: {
  member: FormMember;
  sending: boolean;
  onSubmit: (message: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const canSend =
    name.trim().length > 0 &&
    EMAIL_RE.test(email.trim()) &&
    message.trim().length > 0;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSend || sending) return;
    onSubmit(message.trim());
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.toRow}>
        <Avatar
          initials={member.initials}
          tint={member.tint}
          size={56}
          src={member.photo}
          alt={`${member.first} ${member.last}`}
        />
        <div>
          <div className={styles.toName}>
            {member.first} {member.last}
          </div>
          <div className={styles.toRole}>{member.role}</div>
        </div>
      </div>

      <h1 className={styles.title}>
        Say <em>hello.</em>
      </h1>
      <p className={styles.sub}>
        Your message goes directly. No notifications, no read receipts, no
        algorithm watching. Just a real message.
      </p>

      <FormField label="Your name" required>
        <input
          id="connect-name"
          type="text"
          placeholder="How you'd like to be known"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={sending}
        />
      </FormField>
      <FormField label="Your email" required>
        <input
          id="connect-email"
          type="email"
          placeholder="So they can write back"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={sending}
        />
      </FormField>
      <FormField label="What's this about?">
        <select
          id="connect-about"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          disabled={sending}
        >
          <option value="">Pick a reason, or leave it open</option>
          {REASONS.map((reasonOption) => (
            <option key={reasonOption}>{reasonOption}</option>
          ))}
        </select>
      </FormField>
      <FormField label="Your message" required>
        <textarea
          id="connect-msg"
          placeholder="Write naturally. There's no template."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={sending}
        />
      </FormField>

      <div className={styles.note}>
        Messages from people not yet in the network are held briefly and
        reviewed by the team before delivery. This keeps the room safe.
      </div>

      <div className={styles.foot}>
        <button
          type="button"
          className={styles.back}
          onClick={onClose}
          disabled={sending}
        >
          ← Cancel
        </button>
        <Button size="lg" type="submit" disabled={!canSend || sending}>
          {sending ? <Sending label="Sending…" /> : "Send →"}
        </Button>
      </div>
    </form>
  );
}
