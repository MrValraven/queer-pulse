// src/features/messages/StarredMessagesModal.tsx
import { useEffect, useMemo } from "react";
import { FiX } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { initialsOf, tintForSlug } from "../../shared/api/refs";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MessageSearchConversationGroup } from "../../shared/contracts/contracts";
import { useStarredMessages } from "./api/useMessagePinStar";
import styles from "./NewMessageModal.module.css";

interface StarredMessagesModalProps {
  onClose: () => void;
  /** Opens the conversation and jumps to the starred message. */
  onPick: (conversationId: string, messageId: string) => void;
}

/** Counterpart identity for a starred hit's conversation (official → org). */
function groupIdentity(group: MessageSearchConversationGroup | undefined) {
  const participant = group?.otherParticipant;
  if (!participant) return { name: "QueerPulse Team", initials: "QP", tint: "plum" as const };
  const parts = participant.displayName.trim().split(/\s+/);
  const initials = initialsOf(parts[0] ?? "", parts.length > 1 ? parts.at(-1)! : "");
  return {
    name: participant.displayName,
    initials,
    tint: tintForSlug(participant.handle),
    avatarUrl: participant.avatarUrl ?? undefined,
  };
}

/**
 * The "Starred messages" view — the caller's PRIVATE bookmarks, newest-star-first,
 * each with the counterpart, a snippet, and a jump-to. Reuses the cross-inbox
 * jump (`onPick` → `openThreadAtMessage`) so tapping opens the thread and
 * highlights the original. Empty in demo mode (stars need a server message id).
 */
export function StarredMessagesModal({ onClose, onPick }: StarredMessagesModalProps) {
  useScrollLock();
  const { t } = useTranslation();
  const { data, isLoading } = useStarredMessages(true);
  const items = data?.items ?? [];

  const groupsById = useMemo(() => {
    const map = new Map<string, MessageSearchConversationGroup>();
    for (const group of data?.conversations ?? []) {
      map.set(group.conversationId, group);
    }
    return map;
  }, [data]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="starred-messages-title"
      >
        <div className={styles.head}>
          <h2 id="starred-messages-title" className={styles.title}>
            {t("messages:starred.title")}
          </h2>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={t("messages:starred.close")}
          >
            <FiX />
          </button>
        </div>
        <p className={styles.sub}>{t("messages:starred.sub")}</p>
        <ul className={styles.list}>
          {items.map((item) => {
            const identity = groupIdentity(groupsById.get(item.conversationId));
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={styles.row}
                  onClick={() => onPick(item.conversationId, item.id)}
                >
                  <Avatar
                    initials={identity.initials}
                    tint={identity.tint}
                    src={identity.avatarUrl}
                    size={40}
                  />
                  <div className={styles.rowBody}>
                    <span className={styles.rowName}>{identity.name}</span>
                    <span className={styles.rowMeta}>{item.snippet}</span>
                  </div>
                </button>
              </li>
            );
          })}
          {isLoading && items.length === 0 && (
            <li className={styles.empty}>{t("messages:starred.loading")}</li>
          )}
          {!isLoading && items.length === 0 && (
            <li className={styles.empty}>{t("messages:starred.empty")}</li>
          )}
        </ul>
      </div>
    </div>
  );
}
