import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiCheck, FiAtSign } from "react-icons/fi";
import { EmptyState, FadeIn } from "../../shared/components/ui";
import { useFocusOnMount } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import {
  MENTION_TAB_DEFS,
  type Mention,
  type MentionActionType,
  type MentionTabId,
} from "./mentions.data";
import { useMentions } from "./api/useMentions";
import { MentionsListSkeleton } from "./MentionsSkeleton";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import styles from "./MentionsPanel.module.css";
import type { TFunction } from "../../shared/i18n/types";

const avClass: Record<Mention["tint"], string | undefined> = {
  coral: styles.avCoral,
  jade: styles.avJade,
  plum: styles.avPlum,
};

/** Action-type → display label, resolved via `t` at render (never the stored
 * `type`, which stays a stable English enum — i18n sweep §5.1). */
function actionLabel(type: MentionActionType, t: TFunction): string {
  const key: Record<MentionActionType, string> = {
    reply: "notifications:mentions.actions.reply",
    openThread: "notifications:mentions.actions.openThread",
    markRead: "notifications:mentions.actions.markRead",
    openArticle: "notifications:mentions.actions.openArticle",
    rsvp: "notifications:mentions.actions.rsvp",
    openPost: "notifications:mentions.actions.openPost",
  };
  return t(key[type]);
}

function ReplyComposer({
  name,
  onSend,
}: {
  name: string;
  onSend: (body: string) => void;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const replyRef = useFocusOnMount<HTMLTextAreaElement>();
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
        ref={replyRef}
        className={styles.rcInput}
        rows={1}
        placeholder={t("notifications:mentions.composer.placeholder", {
          name: name.split(" ")[0],
        })}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className={styles.rcSend} type="submit" disabled={!value.trim()}>
        {t("notifications:mentions.actions.reply")}
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
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [going, setGoing] = useState(false);
  const [composing, setComposing] = useState(false);
  const [replies, setReplies] = useState<string[]>([]);

  function runAction(type: MentionActionType) {
    if (type === "reply") {
      setComposing((c) => !c);
    } else if (type === "rsvp") {
      setGoing((g) => {
        const next = !g;
        showToast(
          next
            ? t("notifications:mentions.row.rsvpGoingToast", { name: m.name })
            : t("notifications:mentions.row.rsvpWithdrawnToast"),
          next ? "success" : "info",
        );
        return next;
      });
    } else if (type === "markRead") {
      onRead();
    } else if (
      type === "openThread" ||
      type === "openArticle" ||
      type === "openPost"
    ) {
      navigate(m.whereTo ?? routes.forum);
    } else {
      showToast(
        t("notifications:mentions.row.genericToast", {
          label: actionLabel(type, t),
          name: m.name,
        }),
        "info",
      );
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
          <span className={styles.whoName}>
            <Link to={routes.members}>{m.name}</Link>
            <MemberStaffBadge slug={m.actorSlug} />
          </span>
          <span> · {m.context}</span>
        </div>
        <div className={`${styles.when} ${m.fresh ? styles.fresh : ""}`}>
          {m.when}
        </div>
      </div>
      <div className={styles.content}>{m.content}</div>
      <div className={styles.where}>
        {t("notifications:mentions.where.prefix")}{" "}
        {m.whereTo ? (
          <Link to={m.whereTo}>{m.whereText}</Link>
        ) : (
          <span>{m.whereText}</span>
        )}
      </div>
      {replies.map((body, replyIndex) => (
        <div key={replyIndex} className={styles.sentReply}>
          <span className={styles.srAuthor}>
            {t("notifications:deepLink.sentReply.you")}
          </span>
          {body}
        </div>
      ))}
      {m.actions.length > 0 && (
        <div className={styles.actions}>
          {m.actions.map((action) => {
            const isGoing = action.type === "rsvp" && going;
            return (
              <button
                type="button"
                key={action.type}
                className={[
                  styles.action,
                  action.primary && styles.primary,
                  isGoing && styles.going,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => runAction(action.type)}
              >
                {isGoing ? (
                  <>
                    <FiCheck aria-hidden />{" "}
                    {t("notifications:mentions.row.going")}
                  </>
                ) : (
                  actionLabel(action.type, t)
                )}
              </button>
            );
          })}
          {!unread && m.unread && (
            <span className={styles.when}>
              {t("notifications:mentions.row.read")}
            </span>
          )}
        </div>
      )}
      {composing && <ReplyComposer name={m.name} onSend={addReply} />}
    </div>
  );
}

/** The mentions experience, rendered inline under the Notifications page's
 * "Mentions" tab. Self-contained: owns its sub-tab + read state and pulls from
 * the same demo/live `useMentions` source. No page header — it lives beneath the
 * "Notifications" page title. */
export function MentionsPanel() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { data: mentionDays = [], isLoading: loading } = useMentions();
  const { showToast } = useToast();
  const [tab, setTab] = useState(0);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  let rowIndex = 0;

  const allMentions = useMemo(
    () => mentionDays.flatMap((group) => group.items),
    [mentionDays],
  );
  const unreadIds = useMemo(
    () =>
      allMentions
        .filter((mention) => mention.unread)
        .map((mention) => mention.id),
    [allMentions],
  );
  const unreadCount = unreadIds.filter((id) => !readIds.has(id)).length;

  // Tab badge counts derived from the live data, so they stay correct in demo
  // and live mode alike (and never show mock totals when the thread is empty).
  const tabCounts: Record<MentionTabId, number> = useMemo(
    () => ({
      all: allMentions.length,
      unread: allMentions.filter(
        (mention) => mention.unread && !readIds.has(mention.id),
      ).length,
      posts: allMentions.filter((mention) => mention.category === "post").length,
      articles: allMentions.filter((mention) => mention.category === "article")
        .length,
      events: allMentions.filter((mention) => mention.category === "event")
        .length,
    }),
    [allMentions, readIds],
  );

  function markRead(id: string) {
    setReadIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }
  function markAllRead() {
    if (unreadCount === 0) return;
    setReadIds(new Set(unreadIds));
    showToast(t("notifications:mentions.markAllReadToast"), "success");
  }

  const activeTabId = MENTION_TAB_DEFS[tab]?.id ?? "all";
  const filteredDays = mentionDays
    .map((group) => ({
      ...group,
      items: group.items.filter((m) => {
        const isUnread = !!m.unread && !readIds.has(m.id);
        switch (activeTabId) {
          case "unread":
            return isUnread;
          case "posts":
            return m.category === "post";
          case "articles":
            return m.category === "article";
          case "events":
            return m.category === "event";
          default:
            return true;
        }
      }),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className={styles.panel}>
      <div className={styles.tabs}>
        {MENTION_TAB_DEFS.map((tabDef, index) => (
          <button
            type="button"
            key={tabDef.id}
            className={`${styles.tab} ${tab === index ? styles.active : ""}`}
            onClick={() => setTab(index)}
          >
            {t(tabDef.labelKey)}{" "}
            <span className={styles.tabCount}>{tabCounts[tabDef.id]}</span>
          </button>
        ))}
      </div>

      <div className={styles.markRow}>
        <p>
          {unreadCount > 0 ? (
            <>
              <b>
                {t("notifications:mentions.unreadSummary", {
                  count: unreadCount,
                })}
              </b>{" "}
              {t("notifications:mentions.oldestFrom", {
                when: fmt.relativeTime(-14, "hour"),
              })}
            </>
          ) : (
            <b>{t("notifications:mentions.allCaughtUp")}</b>
          )}
        </p>
        <button
          type="button"
          className={styles.markBtn}
          onClick={markAllRead}
          disabled={unreadCount === 0}
        >
          {t("notifications:mentions.markAllRead")}
        </button>
      </div>

      {loading ? (
        <MentionsListSkeleton count={3} />
      ) : filteredDays.length === 0 ? (
        <EmptyState
          compact
          icon={<FiAtSign />}
          title={t("notifications:mentions.empty.title")}
          description={t("notifications:mentions.empty.description")}
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
  );
}
