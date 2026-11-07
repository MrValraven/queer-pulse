import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiCheck, FiAtSign } from "react-icons/fi";
import {
  Avatar,
  EmptyState,
  FadeIn,
  LoadErrorState,
  Tabs,
} from "../../shared/components/ui";
import { useFocusOnMount } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { relativeAgo } from "../../shared/lib/relativeAgo";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { routes } from "../../app/routeMap";
import {
  MENTION_TAB_DEFS,
  type Mention,
  type MentionActionType,
  type MentionTabId,
} from "./mentions.data";
import { useMentions } from "./api/useMentions";
import { useMentionsReadState } from "./useMentionsReadState";
import { MentionsListSkeleton } from "./MentionsSkeleton";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { MentionExcerpt } from "./MentionExcerpt";
import { isMentionExcerptEmpty } from "./mentionExcerptIsEmpty";
import styles from "./MentionsPanel.module.css";
import pageStyles from "./NotificationsPage.module.css";
import type { TFunction } from "../../shared/i18n/types";

/** The two non-numeric idioms the "oldest unread" label needs. */
const MENTION_AGO_KEYS = {
  justNow: "notifications:mentions.ago.justNow",
  unknown: "notifications:mentions.ago.unknown",
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
        aria-label={t("notifications:mentions.composer.placeholder", {
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
  index,
  unread,
  onRead,
}: {
  m: Mention;
  /** Position in the whole thread, for the staggered entrance. */
  index: number;
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
      void navigate(m.whereTo ?? routes.forum);
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

  // A mention whose source text is gone has nothing left to answer, so the
  // row offers its other actions only.
  const hasSource = !isMentionExcerptEmpty(m.content);
  const visibleActions = m.actions.filter(
    (action) => hasSource || action.type !== "reply",
  );

  // The page's content-row look (NotificationsPage.module.css): a portrait
  // picture with the unread dot on its corner, the sentence first, the
  // quoted excerpt, then one quiet meta line. The FadeIn is the row itself,
  // so rows are siblings and a run of unread rows joins into one block.
  return (
    <FadeIn
      delay={Math.min(index, 8) * 60}
      className={[
        styles.row,
        pageStyles.contentRow,
        unread && pageStyles.unread,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={pageStyles.leadFrame}>
        <Avatar
          className={pageStyles.leadRect}
          initials={m.initials}
          tint={m.tint}
          size={80}
        />
        <span
          className={[pageStyles.leadDot, unread && pageStyles.leadDotVisible]
            .filter(Boolean)
            .join(" ")}
          aria-hidden
        />
      </div>
      <div className={pageStyles.body}>
        <div className={pageStyles.staffBadges}>
          <MemberStaffBadge slug={m.actorSlug} />
        </div>
        <div className={pageStyles.text}>
          {/* A matched Go together chat's mention actor carries no slug (no
              profile to open): the name renders as plain text, same as the
              notifications bell for the same case. */}
          {m.actorSlug ? (
            <Link
              to={`${routes.members}/${m.actorSlug}`}
              className={pageStyles.actorLink}
            >
              {m.name}
            </Link>
          ) : (
            <strong>{m.name}</strong>
          )}{" "}
          {m.context}
        </div>
        <MentionExcerpt content={m.content} />
        <div className={pageStyles.metaLine}>
          <span className={`${pageStyles.metaItem} ${styles.where}`}>
            {t("notifications:mentions.where.prefix")}{" "}
            {m.whereTo ? (
              <Link to={m.whereTo}>{m.whereText}</Link>
            ) : (
              <span>{m.whereText}</span>
            )}
          </span>
          <span
            className={[
              pageStyles.metaItem,
              pageStyles.metaTime,
              m.fresh && styles.fresh,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {m.when}
          </span>
        </div>
        <MentionRowFollowUp
          replies={replies}
          actions={visibleActions}
          isGoing={going}
          isUnread={unread}
          wasUnread={Boolean(m.unread)}
          isComposing={composing}
          name={m.name}
          onAction={runAction}
          onSendReply={addReply}
        />
      </div>
    </FadeIn>
  );
}

/** Under the meta line: the replies sent from here, the row's actions, and
 *  the inline reply composer. */
function MentionRowFollowUp({
  replies,
  actions,
  isGoing,
  isUnread,
  wasUnread,
  isComposing,
  name,
  onAction,
  onSendReply,
}: {
  replies: string[];
  actions: Mention["actions"];
  isGoing: boolean;
  isUnread: boolean;
  wasUnread: boolean;
  isComposing: boolean;
  name: string;
  onAction: (type: MentionActionType) => void;
  onSendReply: (body: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      {replies.map((body, replyIndex) => (
        <div key={replyIndex} className={styles.sentReply}>
          <span className={styles.srAuthor}>
            {t("notifications:deepLink.sentReply.you")}
          </span>
          {body}
        </div>
      ))}
      {actions.length > 0 && (
        <div className={styles.actions}>
          {actions.map((action) => {
            const isActionGoing = action.type === "rsvp" && isGoing;
            return (
              <button
                type="button"
                key={action.type}
                className={[
                  styles.action,
                  action.primary && styles.primary,
                  isActionGoing && styles.going,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onAction(action.type)}
              >
                {isActionGoing ? (
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
          {!isUnread && wasUnread && (
            <span className={styles.when}>
              {t("notifications:mentions.row.read")}
            </span>
          )}
        </div>
      )}
      {isComposing && <ReplyComposer name={name} onSend={onSendReply} />}
    </>
  );
}

/** The mentions experience, rendered inline under the Notifications page's
 * "Mentions" tab. Self-contained: owns its sub-tab + read state and pulls from
 * the same demo/live `useMentions` source. No page header — it lives beneath the
 * "Notifications" page title. */
export function MentionsPanel() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const {
    data: mentionDays = [],
    isLoading: loading,
    isError,
    refetch,
  } = useMentions();
  const [activeTabId, setActiveTabId] = useState<MentionTabId>("all");
  const {
    readIds,
    unreadCount,
    oldestUnreadIso,
    tabCounts,
    markRead,
    markAllRead,
  } = useMentionsReadState(mentionDays);
  let rowIndex = 0;

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

  // Live now reads real `@`-mentions from `GET /mentions` (hand-mapped from the
  // backend `mention` notifications); demo keeps full mock fidelity. Both modes
  // render the same thread below — an empty result shows the honest EmptyState,
  // not a coming-soon.
  return (
    <div className={styles.panel}>
      {/* The page's one-line, sideways-scrolling tab row, so these filters
          never wrap onto a second line on a phone either. */}
      <div className={pageStyles.tabsFrame}>
        <Tabs
          className={pageStyles.tabs}
          variant="underline"
          tabs={MENTION_TAB_DEFS.map((tabDef) => ({
            id: tabDef.id,
            label: t(tabDef.labelKey),
            count: tabCounts[tabDef.id],
          }))}
          active={activeTabId}
          onChange={(id) => setActiveTabId(id as MentionTabId)}
        />
      </div>

      <div className={styles.markRow}>
        <p>
          {unreadCount > 0 ? (
            <>
              <b>
                <Translation
                  i18nKey="notifications:mentions.unreadSummary"
                  values={{ count: unreadCount }}
                  slots={{
                    count: (
                      <RollingNumber
                        value={fmt.number(unreadCount)}
                        numericValue={unreadCount}
                      />
                    ),
                  }}
                />
              </b>{" "}
              {oldestUnreadIso
                ? t("notifications:mentions.oldestFrom", {
                    when: relativeAgo(
                      oldestUnreadIso,
                      t,
                      fmt,
                      MENTION_AGO_KEYS,
                    ),
                  })
                : null}
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
      ) : isError ? (
        /* "Nothing has mentioned you" is the wrong thing to tell someone whose
           request simply never landed. */
        <LoadErrorState
          compact
          onRetry={() => void refetch()}
          description={t("notifications:mentions.loadErrorBody")}
        />
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
                <MentionRow
                  key={m.id}
                  m={m}
                  index={rowIndex++}
                  unread={!!m.unread && !readIds.has(m.id)}
                  onRead={() => markRead(m.id)}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
