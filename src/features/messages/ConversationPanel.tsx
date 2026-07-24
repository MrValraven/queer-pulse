import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useAuth } from "../../app/providers/authContext";
import { Avatar } from "../../shared/components/ui";
import { initialsOf, tintForSlug } from "../../shared/api/refs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { Composer } from "./Composer";
import { MessageRunView, type RunParticipant } from "./MessageRun";
import { groupIntoRuns } from "./messageRuns";
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
  /** Mobile only — returns to the conversation list. Absent on desktop. */
  onBack?: () => void;
}

/** Right-hand conversation pane: header, scrolling message area, composer. */
export function ConversationPanel({
  active,
  messageGroups,
  draft,
  onDraftChange,
  onSend,
  blocked = false,
  onBack,
}: ConversationPanelProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = areaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messageGroups, active.id]);

  const counterpart: RunParticipant = {
    initials: active.initials,
    tint: active.tint,
    src: active.avatarUrl,
  };
  // The signed-in member's sent-bubble avatar. `useAuth().user` is the real
  // member in live mode and the mock member in demo mode, so this works in both;
  // `me` is only a fallback for the brief pre-auth / logged-out window.
  const self: RunParticipant = user
    ? {
        initials: initialsOf(user.profile.firstName, user.profile.lastName),
        tint: tintForSlug(user.profile.slug),
        src: user.profile.avatarUrl ?? undefined,
      }
    : me;

  return (
    <div className={styles.convoPanel}>
      <div className={styles.topbar}>
        {onBack && (
          <button
            type="button"
            className={styles.backBtn}
            onClick={onBack}
            aria-label={t("messages:conversation.backToList")}
          >
            <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden>
              <path
                d="M11 3.5 5.5 9l5.5 5.5"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <Avatar
          initials={active.initials}
          tint={active.tint}
          src={active.avatarUrl}
          size={38}
        />
        <div className={styles.ctbInfo}>
          <div className={styles.ctbName}>
            <span className={styles.nameRow}>
              {active.name}
              <MemberStaffBadge slug={active.slug} />
            </span>
          </div>
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

      <div className={styles.area} ref={areaRef} role="log" aria-live="polite">
        {messageGroups.map((group) => (
          <div key={group.day} className={styles.dayGroup}>
            <div className={styles.daySep}>
              <span className={styles.daySepLabel}>{dayHeading(group.day, t)}</span>
            </div>
            <div className={styles.runs}>
              {groupIntoRuns(group.items).map((run, index) => (
                <MessageRunView
                  key={run.items[0]?.id ?? `${group.day}-run-${index}`}
                  run={run}
                  counterpart={counterpart}
                  self={self}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Composer
        active={active}
        draft={draft}
        onDraftChange={onDraftChange}
        onSend={onSend}
        blocked={blocked}
      />
    </div>
  );
}
