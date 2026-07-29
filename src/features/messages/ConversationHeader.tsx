import { useNavigate } from "react-router-dom";
import { FiStar } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

export interface ConversationHeaderProps {
  active: Conversation;
  /** True when the counterpart is online now — swaps the meta line for "Active now". */
  isCounterpartOnline: boolean;
  /** Mobile only — returns to the conversation list. Absent on desktop. */
  onBack?: () => void;
  /** Opens the "Starred messages" view. */
  onOpenStarred: () => void;
  /** GROUP only — opens the read-only group-info view (member list). */
  onOpenGroupInfo?: () => void;
}

/** Conversation top bar: back button (mobile), avatar, name + staff badge,
 *  presence/pronouns meta, the starred-messages entry, and the view-profile /
 *  group-info link. Groups show a member-count subtitle instead of presence. */
export function ConversationHeader({
  active,
  isCounterpartOnline,
  onBack,
  onOpenStarred,
  onOpenGroupInfo,
}: ConversationHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isGroup = !!active.isGroup;

  return (
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
            {!isGroup && <MemberStaffBadge slug={active.slug} />}
          </span>
        </div>
        <div className={styles.ctbMeta}>
          {isGroup ? (
            t("messages:group.memberCount", { count: active.memberCount ?? 0 })
          ) : active.official ? (
            t("messages:conversation.officialMeta")
          ) : isCounterpartOnline ? (
            <>
              <span className={styles.activeNowDot} aria-hidden />
              {t("messages:conversation.activeNow")}
            </>
          ) : (
            `${active.pronouns}${
              active.connectedSince
                ? t("messages:conversation.connectedSinceSuffix", {
                    date: active.connectedSince,
                  })
                : ""
            }`
          )}
        </div>
      </div>
      <button
        type="button"
        className={styles.ctbIconBtn}
        onClick={onOpenStarred}
        aria-label={t("messages:starred.open")}
        title={t("messages:starred.open")}
      >
        <FiStar aria-hidden />
      </button>
      {isGroup ? (
        <button
          type="button"
          className={styles.ctbLink}
          onClick={onOpenGroupInfo}
        >
          {t("messages:group.info")} →
        </button>
      ) : (
        !active.official && (
          <button
            type="button"
            className={styles.ctbLink}
            onClick={() => void navigate(`${routes.members}/${active.slug}`)}
          >
            {t("messages:conversation.viewProfile")} →
          </button>
        )
      )}
    </div>
  );
}
