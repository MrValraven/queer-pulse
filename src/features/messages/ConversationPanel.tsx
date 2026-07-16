import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { me, type ChatMessage, type Conversation } from "./data";
import styles from "./MessagesPage.module.css";

/**
 * `day` is a stable canonical id ("Today" / "Yesterday", or an already
 * locale-formatted date string from the adapter) — label-key indirection so
 * only "Today"/"Yesterday" (the two chrome buckets computed client-side)
 * resolve through the catalog; any other value is a date string and rendered
 * as-is (see the sweep report for the known gap in the rest of the date
 * formatting here).
 */
function dayHeading(day: string, t: TFunction): string {
  if (day === "Today") return t("messages:day.today");
  if (day === "Yesterday") return t("messages:day.yesterday");
  return day;
}

interface ConversationPanelProps {
  active: Conversation;
  messageGroups: { day: string; items: ChatMessage[] }[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  /** True when the counterpart is blocked — the composer is severed. */
  blocked?: boolean;
}

/** Right-hand conversation pane: header, scrolling message area, composer. */
export function ConversationPanel({
  active,
  messageGroups,
  draft,
  onDraftChange,
  onSend,
  blocked = false,
}: ConversationPanelProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = areaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messageGroups, active.id]);

  return (
    <div className={styles.convoPanel}>
      <div className={styles.topbar}>
        <Avatar initials={active.initials} tint={active.tint} size={38} />
        <div className={styles.ctbInfo}>
          <div className={styles.ctbName}>{active.name}</div>
          <div className={styles.ctbMeta}>
            {active.official
              ? t("messages:conversation.officialMeta")
              : `${active.pronouns}${
                  active.connectedSince
                    ? t("messages:conversation.connectedSinceSuffix", {
                        date: active.connectedSince,
                      })
                    : ""
                }`}
          </div>
        </div>
        {!active.official && (
          <button
            type="button"
            className={styles.ctbLink}
            onClick={() => navigate(routes.accountProfile)}
          >
            {t("messages:conversation.viewProfile")} →
          </button>
        )}
      </div>

      <div className={styles.area} ref={areaRef}>
        {messageGroups.map((group) => (
          <div key={group.day}>
            <div className={styles.dayLabel}>{dayHeading(group.day, t)}</div>
            {group.items.map((message, index) => {
              const isSent = message.from === "me";
              return (
                <div
                  key={`${group.day}-${index}-${message.text}`}
                  className={[styles.bubbleRow, isSent && styles.bubbleRowSent]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <Avatar
                    initials={isSent ? me.initials : active.initials}
                    tint={isSent ? me.tint : active.tint}
                    size={28}
                    style={{ alignSelf: "flex-end" }}
                  />
                  <div>
                    <div
                      className={[
                        styles.bubble,
                        isSent ? styles.sent : styles.received,
                      ].join(" ")}
                    >
                      {message.text}
                    </div>
                    {message.time && (
                      <div className={styles.bubbleTime}>{message.time}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {active.official ? (
        <div className={styles.officialBar}>
          {t("messages:conversation.officialNotice")}
        </div>
      ) : blocked ? (
        <div className={styles.officialBar}>
          {t("messages:conversation.blockedNotice", {
            name: active.name.split(" ")[0]!,
          })}
        </div>
      ) : (
        <div className={styles.composer}>
          <textarea
            className={styles.composerTa}
            placeholder={t("messages:conversation.composerPlaceholder", {
              name: active.name.split(" ")[0]!,
            })}
            value={draft}
            rows={1}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
          />
          <button
            type="button"
            className={[styles.sendBtn, draft.trim() && styles.sendBtnActive]
              .filter(Boolean)
              .join(" ")}
            onClick={onSend}
            aria-label={t("messages:conversation.send")}
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
            >
              <path d="M2 8l12-6-4 6 4 6-12-6Z" fill="rgba(247,243,238,.9)" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
