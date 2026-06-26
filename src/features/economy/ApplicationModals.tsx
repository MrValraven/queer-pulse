import { useEffect, useRef, useState } from "react";
import {
  FiCheck,
  FiDownload,
  FiCopy,
  FiAlertTriangle,
  FiTrendingUp,
  FiCalendar,
} from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { FileIcon, ModalShell, Sending, SuccessPanel, useSubmitFlow } from "./ModalKit";
import {
  type Application,
  type ActionKind,
  type Recruiter,
  type ThreadEntry,
  type NegotiationAngle,
  negotiationAngles,
  NEGOTIATION_LEVERS,
  NEGOTIATION_PRINCIPLES,
  withdrawnPatch,
  followedUpPatch,
  submittedDraftPatch,
  acceptedOfferPatch,
  declinedOfferPatch,
  offerRevertPatch,
} from "./applicationStatus.data";
import { SubmissionModal, CompanyModal, NoteModal } from "./ApplicationDetailModals";
import styles from "./ApplicationModals.module.css";

// Shared modal primitives now live in ./ModalKit. Re-exported so existing
// importers of ./ApplicationModals (e.g. ApplicationDetailModals) keep working.
export { FileIcon, ModalShell };

function recipientOf(app: Application): Recruiter {
  return app.recruiter ?? { name: app.companyName, role: "Hiring team", initials: app.logo, tint: "coral" };
}

type MsgVariant = "message" | "followup" | "conversation";
const MSG_COPY: Record<MsgVariant, { title: string; em: string; sub: string; preset: string }> = {
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
function ThreadView({ entries, fromIndex }: { entries: ThreadEntry[]; fromIndex: number }) {
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
  return props.app.thread?.length ? <ConversationModal {...props} /> : <ColdMessageModal {...props} />;
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
  const [msg, setMsg] = useState(variant === "followup" ? MSG_COPY.followup.preset : "");
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
        The full history with {to.name.split(" ")[0]} — every message and milestone, in order.
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
          Your message to {to.name.split(" ")[0]} is on its way. They'll reply straight to your inbox.
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
            <button type="button" className={styles.back} onClick={onClose} disabled={sending}>
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

/** Build and download a calendar invite for the interview. */
function downloadIcs(app: Application) {
  const i = app.interview;
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//QueerPulse//Applications//EN",
    "BEGIN:VEVENT",
    `SUMMARY:${i?.title ?? app.title} — ${app.companyName}`,
    "DTSTART:20260611T150000Z",
    "DTEND:20260611T160000Z",
    `LOCATION:${i?.location ?? ""}`,
    `DESCRIPTION:${i?.notes ?? ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${app.companyName.replace(/\s+/g, "-")}-interview.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** A pre-filled Google Calendar "create event" link. */
function googleCalUrl(app: Application) {
  const i = app.interview;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${i?.title ?? app.title} — ${app.companyName}`,
    dates: "20260611T150000Z/20260611T160000Z",
    details: i?.notes ?? "",
    location: i?.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Confirm interview details and add to a calendar (Google or .ics). */
export function CalendarModal({ app, onClose }: { app: Application; onClose: () => void }) {
  const i = app.interview;
  const [method, setMethod] = useState<null | "ics" | "google">(null);
  const { submit, sending, done } = useSubmitFlow();

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel title="Saved to your" em="calendar." onClose={onClose}>
          {method === "google"
            ? "We've opened Google Calendar — just hit save. We'll also remind you the morning of."
            : "The invite (.ics) has downloaded — open it to add the event. We'll also remind you the morning of."}
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>Interview</div>
          <h2 className={styles.title}>{i?.title}</h2>
          <p className={styles.sub}>{i?.notes}</p>
          <div className={styles.panel}>
            <div className={styles.rows}>
              <div className={styles.row}>
                <span className={styles.rowK}>When</span>
                <span className={styles.rowV}>{i?.when}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowK}>Where</span>
                <span className={styles.rowV}>{i?.location}</span>
              </div>
              {i?.attendees.map((p) => (
                <div key={p} className={styles.row}>
                  <span className={styles.rowK}>With</span>
                  <span className={styles.rowV}>{p}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.foot}>
            <button type="button" className={styles.back} onClick={onClose} disabled={sending}>
              ← Close
            </button>
            <div className={styles.calBtns}>
              <Button
                size="lg"
                variant="ghost"
                disabled={sending}
                onClick={() => {
                  setMethod("ics");
                  downloadIcs(app);
                  submit();
                }}
              >
                {sending && method === "ics" ? (
                  <Sending label="Adding…" />
                ) : (
                  <>
                    <FiDownload size={15} style={{ marginRight: 6 }} aria-hidden /> .ics file
                  </>
                )}
              </Button>
              <Button
                size="lg"
                disabled={sending}
                onClick={() => {
                  setMethod("google");
                  window.open(googleCalUrl(app), "_blank", "noopener,noreferrer");
                  submit();
                }}
              >
                {sending && method === "google" ? (
                  <Sending label="Adding…" />
                ) : (
                  <>
                    <FiCalendar size={15} style={{ marginRight: 6 }} aria-hidden /> Google Calendar →
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </ModalShell>
  );
}

const WITHDRAW_REASONS = [
  "Accepted another role",
  "No longer a fit",
  "Pay or terms didn't work",
  "Process took too long",
  "Prefer not to say",
];

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

/** A single selectable strategy card in the planner. */
function AngleCard({
  angle,
  selected,
  onSelect,
}: {
  angle: NegotiationAngle;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={[styles.angle, selected && styles.angleOn].filter(Boolean).join(" ")}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className={styles.angleRadio} aria-hidden />
      <span className={styles.angleText}>
        <span className={styles.angleName}>{angle.name}</span>
        <span className={styles.angleBlurb}>{angle.blurb}</span>
      </span>
    </button>
  );
}

/** The negotiation planner — context, leverage, strategies, and a draft you can send. */
export function NegotiationPlanner({ app, onClose }: { app: Application; onClose: () => void }) {
  const { showToast } = useToast();
  const o = app.offer;
  const angles = negotiationAngles(app);
  const [angleId, setAngleId] = useState(angles[0].id);
  const [draft, setDraft] = useState(angles[0].draft);
  const [levers, setLevers] = useState<string[]>(["Base salary"]);
  const { submit, sending, done } = useSubmitFlow();

  const pickAngle = (a: NegotiationAngle) => {
    setAngleId(a.id);
    setDraft(a.draft);
  };
  const toggleLever = (l: string) =>
    setLevers((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]));

  if (done) {
    return (
      <ModalShell onClose={onClose} success wide>
        <SuccessPanel title="Counter" em="sent." onClose={onClose}>
          Your reply is on its way to {app.companyName}. Asking is normal and expected — you've done
          this exactly right.
        </SuccessPanel>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose} wide>
      <div className={styles.eyebrow}>Offer negotiation</div>
      <h2 className={styles.title}>
        Ask for what it's <em>worth.</em>
      </h2>
      <p className={styles.sub}>
        Negotiating is expected — most offers have room. Here's your leverage, your levers, and five
        ways to make the ask.
      </p>

      {o && (
        <>
          <div className={styles.panel}>
            <div className={styles.rows}>
              <div className={styles.row}>
                <span className={styles.rowK}>On the table</span>
                <span className={styles.rowV}>{o.salary}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowK}>Holiday</span>
                <span className={styles.rowV}>{o.holiday}</span>
              </div>
            </div>
          </div>
          <div className={styles.market}>
            <FiTrendingUp className={styles.marketIcon} size={18} aria-hidden />
            <span>{o.market}</span>
          </div>
        </>
      )}

      <div className={styles.eyebrow}>What matters most to you</div>
      <div className={styles.levers}>
        {NEGOTIATION_LEVERS.map((l) => (
          <button
            key={l}
            type="button"
            className={[styles.lever, levers.includes(l) && styles.leverOn].filter(Boolean).join(" ")}
            onClick={() => toggleLever(l)}
            aria-pressed={levers.includes(l)}
          >
            {l}
          </button>
        ))}
      </div>

      <ul className={styles.list} style={{ marginBottom: 24 }}>
        {NEGOTIATION_PRINCIPLES.map((t) => (
          <li key={t} className={styles.listItem}>
            <FiCheck className={styles.tick} size={16} aria-hidden /> {t}
          </li>
        ))}
      </ul>

      <div className={styles.eyebrow}>Pick your angle</div>
      <div className={styles.angles}>
        {angles.map((a) => (
          <AngleCard key={a.id} angle={a} selected={a.id === angleId} onSelect={() => pickAngle(a)} />
        ))}
      </div>

      <div className={styles.field}>
        <label htmlFor="neg-draft">Your draft reply — edit it to sound like you</label>
        <textarea
          id="neg-draft"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          style={{ minHeight: 150 }}
        />
      </div>

      <div className={styles.foot}>
        <button
          type="button"
          className={styles.back}
          disabled={sending}
          onClick={() => {
            navigator.clipboard?.writeText(draft);
            showToast("Draft copied to clipboard", "success");
          }}
        >
          <FiCopy size={13} style={{ marginRight: 5, verticalAlign: "-2px" }} aria-hidden /> Copy draft
        </button>
        <Button size="lg" disabled={sending || !draft.trim()} onClick={() => submit()}>
          {sending ? <Sending label="Sending…" /> : "Send reply →"}
        </Button>
      </div>
    </ModalShell>
  );
}

/** Respond to an offer: accept or decline — both change card state. */
export function OfferRespondModal({
  app,
  onClose,
  onPatch,
}: {
  app: Application;
  onClose: () => void;
  onPatch: (id: string, patch: Partial<Application>) => void;
}) {
  const UNDO_SECONDS = 8;
  const o = app.offer;
  const [outcome, setOutcome] = useState<null | "accept" | "decline">(null);
  const [pending, setPending] = useState<null | "accept" | "decline">(null);
  const [left, setLeft] = useState(UNDO_SECONDS);
  const timer = useRef<number | undefined>(undefined);
  const tick = useRef<number | undefined>(undefined);
  // Snapshot the pre-decision card so the action stays reversible.
  const snapshot = useRef(offerRevertPatch(app));
  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      window.clearInterval(tick.current);
    },
    [],
  );

  const choose = (kind: "accept" | "decline") => {
    setPending(kind);
    timer.current = window.setTimeout(() => {
      onPatch(app.id, kind === "accept" ? acceptedOfferPatch() : declinedOfferPatch());
      setOutcome(kind);
      setLeft(UNDO_SECONDS);
      tick.current = window.setInterval(() => {
        setLeft((s) => {
          if (s <= 1) window.clearInterval(tick.current);
          return s - 1;
        });
      }, 1000);
    }, 1000);
  };

  const undo = () => {
    window.clearInterval(tick.current);
    onPatch(app.id, snapshot.current);
    setOutcome(null);
    setPending(null);
  };

  if (outcome) {
    const accepted = outcome === "accept";
    const canUndo = left > 0;
    return (
      <ModalShell onClose={onClose} success>
        <SuccessPanel
          title="Offer"
          em={accepted ? "accepted." : "declined."}
          onClose={onClose}
          footer={
            <div className={styles.undoBar}>
              {canUndo ? (
                <>
                  <span className={styles.undoText}>
                    Changed your mind? You can undo for {left}s.
                  </span>
                  <button type="button" className={styles.undoBtn} onClick={undo}>
                    Undo
                  </button>
                </>
              ) : (
                <span className={styles.undoText}>This is now confirmed.</span>
              )}
            </div>
          }
        >
          {accepted
            ? `Congratulations — ${app.companyName} will send your contract within two working days.`
            : `We've thanked ${app.companyName} warmly on your behalf. The door stays open for the future.`}
        </SuccessPanel>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      <div className={styles.eyebrow}>Your offer · respond by {o?.respondBy}</div>
      <h2 className={styles.title}>
        {app.companyName} <em>said yes.</em>
      </h2>
      <p className={styles.sub}>Here's everything on the table. Take your time — then choose.</p>
      <div className={styles.panel}>
        <div className={styles.rows}>
          <div className={styles.row}>
            <span className={styles.rowK}>Salary</span>
            <span className={styles.rowV}>{o?.salary}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowK}>Holiday</span>
            <span className={styles.rowV}>{o?.holiday}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowK}>Start</span>
            <span className={styles.rowV}>{o?.start}</span>
          </div>
        </div>
      </div>
      <ul className={styles.list} style={{ marginBottom: 24 }}>
        {o?.terms.map((t) => (
          <li key={t} className={styles.listItem}>
            <FiCheck className={styles.tick} size={16} aria-hidden /> {t}
          </li>
        ))}
      </ul>
      <div className={styles.foot}>
        <button
          type="button"
          className={styles.back}
          disabled={pending !== null}
          onClick={() => choose("decline")}
        >
          {pending === "decline" ? <Sending label="Declining…" /> : "Decline politely"}
        </button>
        <Button size="lg" variant="jade" disabled={pending !== null} onClick={() => choose("accept")}>
          {pending === "accept" ? <Sending label="Accepting…" /> : "Accept offer →"}
        </Button>
      </div>
    </ModalShell>
  );
}

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
          Nicely done — your application to {app.companyName} is in. It's now in your Active tab.
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
            <div className={styles.progressFill} style={{ width: `${d?.percent ?? 0}%` }} />
          </div>
          <p className={styles.progressL}>
            {d?.percent}% done · {d?.remaining.length} things left
          </p>
          <div className={styles.field}>
            <label htmlFor="rs-cover">Cover letter</label>
            <textarea id="rs-cover" placeholder="A few honest lines on why this role." required />
          </div>
          <div className={styles.field}>
            <label htmlFor="rs-avail">Availability</label>
            <input id="rs-avail" type="text" placeholder="e.g. Two weeks' notice" required />
          </div>
          <div className={styles.foot}>
            <button type="button" className={styles.back} onClick={onClose} disabled={sending}>
              ← Save &amp; close
            </button>
            <Button size="lg" type="submit" disabled={sending}>
              {sending ? <Sending label="Submitting…" /> : "Submit application →"}
            </Button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}

/** Routes an action kind to the right modal. */
export function ApplicationModal({
  action,
  app,
  onClose,
  onPatch,
}: {
  action: ActionKind;
  app: Application;
  onClose: () => void;
  onPatch: (id: string, patch: Partial<Application>) => void;
}) {
  switch (action) {
    case "message":
      return <MessageModal app={app} variant="message" onClose={onClose} onPatch={onPatch} />;
    case "followup":
      return <MessageModal app={app} variant="followup" onClose={onClose} onPatch={onPatch} />;
    case "conversation":
      return <MessageModal app={app} variant="conversation" onClose={onClose} onPatch={onPatch} />;
    case "calendar":
      return <CalendarModal app={app} onClose={onClose} />;
    case "company":
      return <CompanyModal app={app} onClose={onClose} />;
    case "submission":
      return <SubmissionModal app={app} onClose={onClose} />;
    case "note":
      return <NoteModal app={app} onClose={onClose} />;
    case "negotiate":
      return <NegotiationPlanner app={app} onClose={onClose} />;
    case "resume":
      return <ResumeModal app={app} onClose={onClose} onPatch={onPatch} />;
    case "offer":
      return <OfferRespondModal app={app} onClose={onClose} onPatch={onPatch} />;
    case "withdraw":
      return <WithdrawModal app={app} onClose={onClose} onPatch={onPatch} />;
  }
}
