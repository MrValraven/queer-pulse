import { useEffect, useRef, useState } from "react";
import { Avatar, Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell, Sending, SuccessPanel } from "./ModalKit";
import { useSubmitFlow } from "./modalFlow";
import type {
  Application,
  Recruiter,
  ThreadEntry,
} from "./applicationStatus.types";
import { followedUpPatch } from "./applicationStatus.patches";
import styles from "./ApplicationModals.module.css";

export type MsgVariant = "message" | "followup" | "conversation";

function recipientOf(app: Application, hiringTeamLabel: string): Recruiter {
  return (
    app.recruiter ?? {
      name: app.companyName,
      role: hiringTeamLabel,
      initials: app.logo,
      tint: "coral",
    }
  );
}

const MSG_COPY_KEYS: Record<
  MsgVariant,
  { titleKey: string; emKey: string; subKey: string; presetKey?: string }
> = {
  message: {
    titleKey: "economy:msg.message.title",
    emKey: "economy:msg.message.em",
    subKey: "economy:msg.message.sub",
  },
  followup: {
    titleKey: "economy:msg.followup.title",
    emKey: "economy:msg.followup.em",
    subKey: "economy:msg.followup.sub",
    presetKey: "economy:msg.followup.preset",
  },
  conversation: {
    titleKey: "economy:msg.conversation.title",
    emKey: "economy:msg.conversation.em",
    subKey: "economy:msg.conversation.sub",
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
  const { t } = useTranslation();
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
              {e.from === "you" ? t("economy:msg.you") : e.name} · {e.when}
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
  const { t } = useTranslation();
  const to = recipientOf(app, t("economy:msg.recipientHiringTeam"));
  const copy = MSG_COPY_KEYS[variant];
  const originalLen = app.thread?.length ?? 0;
  const [entries, setEntries] = useState<ThreadEntry[]>(app.thread ?? []);
  const [msg, setMsg] = useState(
    variant === "followup" ? t("economy:msg.followup.preset") : "",
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
        {t(copy.titleKey)} <em>{t(copy.emKey)}</em>
      </h2>
      <p className={styles.sub}>
        {t("economy:msg.historyWith", {
          firstName: to.name.split(" ")[0] ?? to.name,
        })}
      </p>
      <ThreadView entries={entries} fromIndex={originalLen} />
      <div className={styles.field}>
        <label htmlFor="conv-body">{t("economy:msg.yourReply")}</label>
        <textarea
          id="conv-body"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder={t("economy:msg.replyPlaceholder")}
          style={{ minHeight: 90 }}
        />
      </div>
      <div className={`${styles.foot} ${styles.footEnd}`}>
        <Button size="lg" disabled={sending || !msg.trim()} onClick={send}>
          {sending ? (
            <Sending label={t("economy:msg.sendingLabel")} />
          ) : (
            t("economy:msg.sendCta")
          )}
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
  const { t } = useTranslation();
  const to = recipientOf(app, t("economy:msg.recipientHiringTeam"));
  const copy = MSG_COPY_KEYS[variant];
  const [msg, setMsg] = useState(copy.presetKey ? t(copy.presetKey) : "");
  const { submit, sending, done } = useSubmitFlow();

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title={t("economy:msg.success.title")}
          em={t("economy:msg.success.em")}
          onClose={onClose}
        >
          {t("economy:msg.success.body", {
            firstName: to.name.split(" ")[0] ?? to.name,
          })}
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
            {t(copy.titleKey)} <em>{t(copy.emKey)}</em>
          </h2>
          <p className={styles.sub}>{t(copy.subKey)}</p>
          <div className={styles.field}>
            <label htmlFor="msg-body">
              {t("economy:msg.yourMessageLabel")}
            </label>
            <textarea
              id="msg-body"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder={t("economy:msg.messagePlaceholder")}
            />
          </div>
          <div className={styles.foot}>
            <button
              type="button"
              className={styles.back}
              onClick={onClose}
              disabled={sending}
            >
              {t("economy:msg.cancel")}
            </button>
            <Button size="lg" type="submit" disabled={sending || !msg.trim()}>
              {sending ? (
                <Sending label={t("economy:msg.sendingLabel")} />
              ) : (
                t("economy:msg.sendCta")
              )}
            </Button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}
