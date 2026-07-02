import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiCheck, FiAtSign } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { EmptyState, FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { MENTION_TABS, MENTION_DAYS, type Mention } from "./mentions.data";
import { MentionsListSkeleton } from "./MentionsSkeleton";
import styles from "./MentionsPage.module.css";

const avClass: Record<Mention["tint"], string | undefined> = {
  coral: styles.avCoral,
  jade: styles.avJade,
  plum: styles.avPlum,
};

function ReplyComposer({
  name,
  onSend,
}: {
  name: string;
  onSend: (body: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <form
      className={styles.composer}
      onSubmit={(e) => {
        e.preventDefault();
        const body = value.trim();
        if (!body) return;
        onSend(body);
        setValue("");
      }}
    >
      <textarea
        className={styles.rcInput}
        rows={1}
        placeholder={`Reply to ${name.split(" ")[0]}…`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
      />
      <button className={styles.rcSend} type="submit" disabled={!value.trim()}>
        Reply
      </button>
    </form>
  );
}

function MentionRow({
  m,
  unread,
  onRead,
}: {
  m: Mention;
  unread: boolean;
  onRead: () => void;
}) {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [going, setGoing] = useState(false);
  const [composing, setComposing] = useState(false);
  const [replies, setReplies] = useState<string[]>([]);

  function runAction(label: string) {
    if (label === "Reply") {
      setComposing((c) => !c);
    } else if (label === "RSVP") {
      setGoing((g) => {
        const next = !g;
        showToast(
          next ? `You're going · ${m.name}'s invite` : "RSVP withdrawn",
          next ? "success" : "info",
        );
        return next;
      });
    } else if (label === "Mark read") {
      onRead();
    } else if (label.startsWith("Open")) {
      navigate(m.whereTo ?? routes.forum);
    } else {
      showToast(`${label} · ${m.name}`, "info");
    }
  }

  function addReply(body: string) {
    setReplies((prev) => [...prev, body]);
    onRead();
    setComposing(false);
  }

  return (
    <div className={`${styles.row} ${unread ? styles.unread : ""}`}>
      <div className={styles.headRow}>
        <div className={`${styles.av} ${avClass[m.tint]}`}>{m.initials}</div>
        <div className={styles.who}>
          <Link to={routes.members}>{m.name}</Link>
          <span> · {m.context}</span>
        </div>
        <div className={`${styles.when} ${m.fresh ? styles.fresh : ""}`}>
          {m.when}
        </div>
      </div>
      <div className={styles.content}>{m.content}</div>
      <div className={styles.where}>
        In{" "}
        {m.whereTo ? (
          <Link to={m.whereTo}>{m.whereText}</Link>
        ) : (
          <span>{m.whereText}</span>
        )}
      </div>
      {replies.map((body, i) => (
        <div key={i} className={styles.sentReply}>
          <span className={styles.srAuthor}>You</span>
          {body}
        </div>
      ))}
      {m.actions.length > 0 && (
        <div className={styles.actions}>
          {m.actions.map((a) => {
            const isGoing = a.label === "RSVP" && going;
            return (
              <button
                type="button"
                key={a.label}
                className={[
                  styles.action,
                  a.primary && styles.primary,
                  isGoing && styles.going,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => runAction(a.label)}
              >
                {isGoing ? (
                  <>
                    <FiCheck aria-hidden /> Going
                  </>
                ) : (
                  a.label
                )}
              </button>
            );
          })}
          {!unread && m.unread && <span className={styles.when}>Read</span>}
        </div>
      )}
      {composing && <ReplyComposer name={m.name} onSend={addReply} />}
    </div>
  );
}

/** Whether a mention belongs to the currently selected tab. */
function matchesTab(m: Mention, tabIndex: number, isUnread: boolean): boolean {
  const ctx = m.context.toLowerCase();
  switch (MENTION_TABS[tabIndex]?.label) {
    case "Unread":
      return isUnread;
    case "In posts":
      return (
        ctx.includes("post") || ctx.includes("reply") || ctx.includes("thread")
      );
    case "In articles":
      return ctx.includes("article");
    case "In events":
      return ctx.includes("event") || ctx.includes("invite");
    default:
      return true;
  }
}

/** IDs of mentions that start unread. */
const INITIAL_UNREAD = MENTION_DAYS.flatMap((g) => g.items)
  .filter((m) => m.unread)
  .map((m) => m.id);

export function MentionsPage() {
  const loading = useSimulatedLoad();
  const { showToast } = useToast();
  const [tab, setTab] = useState(0);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  let rowIndex = 0;

  const unreadCount = INITIAL_UNREAD.filter((id) => !readIds.has(id)).length;

  function markRead(id: string) {
    setReadIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }
  function markAllRead() {
    if (unreadCount === 0) return;
    setReadIds(new Set(INITIAL_UNREAD));
    showToast("All marked as read", "success");
  }

  const filteredDays = MENTION_DAYS.map((group) => ({
    ...group,
    items: group.items.filter((m) =>
      matchesTab(m, tab, !!m.unread && !readIds.has(m.id)),
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <AppShell unreadCount={unreadCount}>
      <div className={styles.page}>
        <header className={styles.head}>
          <div className={styles.eyebrow}>Mentions · @tomas-mendes</div>
          <h1 className={styles.h1}>
            When somebody <em>tagged you in.</em>
          </h1>
          <p className={styles.lead}>
            Posts, replies, and articles that @-mention you. Distinct from
            Notifications — this is just the mentions thread.
          </p>
        </header>

        <div className={styles.tabs}>
          {MENTION_TABS.map((t, i) => (
            <button
              type="button"
              key={t.label}
              className={`${styles.tab} ${tab === i ? styles.active : ""}`}
              onClick={() => setTab(i)}
            >
              {t.label} <span className={styles.tabCount}>{t.count}</span>
            </button>
          ))}
        </div>

        <div className={styles.markRow}>
          <p>
            {unreadCount > 0 ? (
              <>
                <b>{unreadCount} unread</b> · oldest from 14 hours ago
              </>
            ) : (
              <b>All caught up</b>
            )}
          </p>
          <button
            type="button"
            className={styles.markBtn}
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            Mark all read
          </button>
        </div>

        {loading ? (
          <MentionsListSkeleton count={3} />
        ) : filteredDays.length === 0 ? (
          <EmptyState
            compact
            icon={<FiAtSign />}
            title="No mentions here"
            description="Nothing in this view right now. When someone tags you, it’ll show up here — no need to go looking."
          />
        ) : (
          filteredDays.map((group) => (
            <div key={group.day}>
              <div className={styles.day}>{group.day}</div>
              <div className={styles.list}>
                {group.items.map((m) => (
                  <FadeIn key={m.id} delay={Math.min(rowIndex++, 8) * 60}>
                    <MentionRow
                      m={m}
                      unread={!!m.unread && !readIds.has(m.id)}
                      onRead={() => markRead(m.id)}
                    />
                  </FadeIn>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
