import { useEffect, useRef, useState } from "react";
import { Avatar, Button } from "../../shared/components/ui";
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from "./ModalKit";
import {
  type Application,
  type Recruiter,
  type ThreadEntry,
  followedUpPatch,
} from "./applicationStatus.data";
import styles from "./ApplicationModals.module.css";

export type MsgVariant = "message" | "followup" | "conversation";

function recipientOf(app: Application): Recruiter {
  return (
    app.recruiter ?? {
      name: app.companyName,
      role: "Hiring team",
      initials: app.logo,
      tint: "coral",
    }
  );
}

const MSG_COPY: Record<
  MsgVariant,
  { title: string; em: string; sub: string; preset: string }
> = {
  message: {
    title: "Message the",
    em: "recruiter.",
    sub: "Goes straight to their inbox — no read receipts, no algorithm in between.",
    preset: "",
  },
  followup: {
    title: "Send a",
    em: "follow-up.",
    sub: "A gentle nudge. We've drafted something warm — edit it however you like.",
    preset:
      "Hi — just a friendly note to check in on my application. I'm still very keen on the role and happy to share anything else that would help. No rush at all, and thank you for your time.",
  },
  conversation: {
    title: "Open the",
    em: "conversation.",
    sub: "Pick up the thread with them directly.",
    preset: "",
  },
};

/** The scrollable conversation history: chat bubbles + process events. */
function ThreadView({
  entries,
  fromIndex,
}: {
  entries: ThreadEntry[];
  fromIndex: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [entries.length]);
  return (
    <div className={styles.thread} ref={ref}>
      {entries.map((e, i) =>
        e.from === "system" ? (
          <div key={i} className={styles.event}>
            {e.text}
          </div>
        ) : (
          <div
            key={i}
            className={[
              styles.msg,
              e.from === "you" ? styles.msgYou : styles.msgThem,
              i >= fromIndex && styles.msgNew,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className={styles.msgMeta}>
              {e.from === "you" ? "You" : e.name} · {e.when}
            </div>
            <div className={styles.bubble}>{e.text}</div>
          </div>
        ),
      )}
    </div>
  );
}

/** Picks the chat experience when there's history, else the cold-message flow. */
export function MessageModal(props: {
  app: Application;
  variant: MsgVariant;
  onClose: () => void;
  onPatch: (id: string, patch: Partial<Application>) => void;
}) {
  return props.app.thread?.length ? (
    <ConversationModal {...props} />
  ) : (
    <ColdMessageModal {...props} />
  );
}

/** Live conversation: full history with the recruiter, plus a reply box. */
function ConversationModal({
  app,
  variant,
  onClose,
  onPatch,
}: {
  app: Application;
  variant: MsgVariant;
  onClose: () => void;
  onPatch: (id: string, patch: Partial<Application>) => void;
}) {
  const to = recipientOf(app);
  const copy = MSG_COPY[variant];
  const originalLen = app.thread?.length ?? 0;
  const [entries, setEntries] = useState<ThreadEntry[]>(app.thread ?? []);
  const [msg, setMsg] = useState(
    variant === "followup" ? MSG_COPY.followup.preset : "",
  );
  const [sending, setSending] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const patched = useRef(false);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const send = () => {
    const text = msg.trim();
    if (!text) return;
    setSending(true);
    timer.current = window.setTimeout(() => {
      setEntries((prev) => [...prev, { from: "you", when: "just now", text }]);
      setMsg("");
      setSending(false);
      if (variant === "followup" && !patched.current) {
        patched.current = true;
        onPatch(app.id, followedUpPatch());
      }
    }, 700);
  };

  return (
    <ModalShell onClose={onClose}>
      <div className={styles.toRow}>
        <Avatar initials={to.initials} tint={to.tint} size={52} />
        <div>
          <div className={styles.toName}>{to.name}</div>
          <div className={styles.toRole}>{to.role}</div>
        </div>
      </div>
      <h2 className={styles.title}>
        {copy.title} <em>{copy.em}</em>
      </h2>
      <p className={styles.sub}>
        The full history with {to.name.split(" ")[0]} — every message and
        milestone, in order.
      </p>
      <ThreadView entries={entries} fromIndex={originalLen} />
      <div className={styles.field}>
        <label htmlFor="conv-body">Your reply</label>
        <textarea
          id="conv-body"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Write a reply…"
          style={{ minHeight: 90 }}
        />
      </div>
      <div className={`${styles.foot} ${styles.footEnd}`}>
        <Button size="lg" disabled={sending || !msg.trim()} onClick={send}>
          {sending ? <Sending label="Sending…" /> : "Send →"}
        </Button>
      </div>
    </ModalShell>
  );
}

/** First contact with no prior history — composes and confirms with a success panel. */
function ColdMessageModal({
  app,
  variant,
  onClose,
  onPatch,
}: {
  app: Application;
  variant: MsgVariant;
  onClose: () => void;
  onPatch: (id: string, patch: Partial<Application>) => void;
}) {
  const to = recipientOf(app);
  const copy = MSG_COPY[variant];
  const [msg, setMsg] = useState(copy.preset);
  const { submit, sending, done } = useSubmitFlow();

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel title="Message" em="sent." onClose={onClose}>
          Your message to {to.name.split(" ")[0]} is on its way. They'll reply
          straight to your inbox.
        </SuccessPanel>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(() => {
              if (variant === "followup") onPatch(app.id, followedUpPatch());
            });
          }}
        >
          <div className={styles.toRow}>
            <Avatar initials={to.initials} tint={to.tint} size={52} />
            <div>
              <div className={styles.toName}>{to.name}</div>
              <div className={styles.toRole}>{to.role}</div>
            </div>
          </div>
          <h2 className={styles.title}>
            {copy.title} <em>{copy.em}</em>
          </h2>
          <p className={styles.sub}>{copy.sub}</p>
          <div className={styles.field}>
            <label htmlFor="msg-body">Your message</label>
            <textarea
              id="msg-body"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Write naturally."
            />
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
            <Button size="lg" type="submit" disabled={sending || !msg.trim()}>
              {sending ? <Sending label="Sending…" /> : "Send →"}
            </Button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}
