import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiStar } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { hapticTap } from "../../shared/lib/haptics";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { ConversationMenu } from "./ConversationMenu";
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
  /** Opens the "search in this chat" view, scoped to just this thread. */
  onOpenSearch: () => void;
  /** GROUP only — opens the read-only group-info view (member list). */
  onOpenGroupInfo?: () => void;
}

/** Conversation top bar. The avatar + name + presence/pronouns meta form a
 *  single tap target — opening the profile (DMs) or the group-info view
 *  (groups), the pattern people know from WhatsApp/Telegram. Official accounts
 *  have no profile, so theirs stays inert. The right side holds quiet icon
 *  buttons for in-chat search and starred messages. */
export function ConversationHeader({
  active,
  isCounterpartOnline,
  onBack,
  onOpenStarred,
  onOpenSearch,
  onOpenGroupInfo,
}: ConversationHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isGroup = !!active.isGroup;

  // Where the identity block goes when tapped — a real profile for DMs, the
  // member list for groups, nowhere for official accounts.
  const opensProfile = !isGroup && !active.official;
  const opensGroupInfo = isGroup && !!onOpenGroupInfo;
  const identityTappable = opensProfile || opensGroupInfo;

  // The status line under the name. WhatsApp/Telegram always say SOMETHING
  // here; the old inline expression fell through to the empty string for a DM
  // carrying neither pronouns nor a connected-since date, leaving a dead gap
  // under the name. The chain below ends in the profile affordance itself
  // (WhatsApp's own "click here for contact info" fallback), and yields null
  // only for a thread with nothing to say AND nowhere to go, where the meta
  // element is dropped entirely rather than rendered empty.
  const pronounsLine = active.pronouns
    ? `${active.pronouns}${
        active.connectedSince
          ? t("messages:conversation.connectedSinceSuffix", {
              date: active.connectedSince,
            })
          : ""
      }`
    : active.connectedSince
      ? t("messages:conversation.connectedSinceSuffix", {
          date: active.connectedSince,
        }).replace(/^\s*·\s*/, "")
      : "";

  let meta: ReactNode = null;
  if (isGroup) {
    meta = t("messages:group.memberCount", { count: active.memberCount ?? 0 });
  } else if (active.official) {
    meta = t("messages:conversation.officialMeta");
  } else if (isCounterpartOnline) {
    meta = (
      <>
        <span className={styles.activeNowDot} aria-hidden />
        {t("messages:conversation.activeNow")}
      </>
    );
  } else if (pronounsLine) {
    meta = pronounsLine;
  } else if (opensProfile) {
    meta = t("messages:conversation.viewProfile");
  }

  const openIdentity = () => {
    // A subtle tick confirming the tap landed, native-app style; no-op on
    // desktop and on devices without the Vibration API.
    hapticTap();
    if (opensProfile) void navigate(`${routes.members}/${active.slug}`);
    else if (opensGroupInfo) onOpenGroupInfo?.();
  };

  // Avatar + name + meta — shared by the tappable and static variants below.
  const identity = (
    <>
      <Avatar
        initials={active.initials}
        tint={active.tint}
        src={active.avatarUrl}
        size={38}
      />
      <div className={styles.ctbInfo}>
        <div className={styles.ctbName}>
          <span className={styles.nameRow}>
            <span className={styles.ctbNameText}>{active.name}</span>
            {!isGroup && <MemberStaffBadge slug={active.slug} />}
          </span>
        </div>
        {meta !== null && <div className={styles.ctbMeta}>{meta}</div>}
      </div>
    </>
  );

  return (
    <div className={styles.topbar}>
      {onBack && (
        <button
          type="button"
          className={styles.backBtn}
          onClick={onBack}
          aria-label={t("messages:conversation.backToList")}
        >
          <svg
            width={18}
            height={18}
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden
          >
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

      {identityTappable ? (
        <button
          type="button"
          className={`${styles.identityRow} ${styles.identityBtn}`}
          onClick={openIdentity}
          aria-label={
            opensProfile
              ? t("messages:conversation.viewProfile")
              : t("messages:group.info")
          }
        >
          {identity}
        </button>
      ) : (
        <div className={styles.identityRow}>{identity}</div>
      )}

      <div className={styles.ctbActions}>
        {/* Renders for EVERY thread: wallpaper has to be reachable from a group
            and an official thread too. The Block/Report items inside keep the
            DM-only gating that used to sit on the menu as a whole — groups have
            no single counterpart to act against, official threads have no
            member behind them at all. */}
        <ConversationMenu
          conversationId={active.id}
          /* A DM's menu copy wants the counterpart's FIRST name ("Block
             Anika"); a group has no counterpart and its safety items are
             absent, so it keeps its whole name for the wallpaper subtitle —
             splitting it left "Pride Brunch Crew" reading as "Pride". */
          name={
            isGroup ? active.name : (active.name.split(" ")[0] ?? active.name)
          }
          safety={
            !isGroup && !active.official && active.slug
              ? {
                  slug: active.slug,
                  reportSubjectId: active.otherParticipantId,
                }
              : undefined
          }
        />
        <button
          type="button"
          className={styles.ctbIconBtn}
          onClick={onOpenSearch}
          aria-label={t("messages:search.inChatOpen")}
          title={t("messages:search.inChatOpen")}
        >
          <FiSearch aria-hidden />
        </button>
        <button
          type="button"
          className={styles.ctbIconBtn}
          onClick={onOpenStarred}
          aria-label={t("messages:starred.open")}
          title={t("messages:starred.open")}
        >
          <FiStar aria-hidden />
        </button>
      </div>
    </div>
  );
}
