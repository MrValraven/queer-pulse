import { useState } from "react";
import { FiUsers } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Conversation } from "../../messages/data";
import { useGoTogetherGroup } from "../api/useGoTogetherGroup";
import {
  GoTogetherBandPill,
  GoTogetherGroupSheet,
} from "./GoTogetherGroupSheet";
import styles from "./GoTogetherGroup.module.css";

/** The matched group behind a chat, or null when the chat shows no banner:
 *  a DM, an ordinary group, or a group this member has left. */
function bannerGroupId(conversation: Conversation): string | null {
  if (!conversation.isGroup || conversation.hasLeft) return null;
  return conversation.eventMatchGroupId ?? null;
}

/**
 * One compact row under the header of a Go together group chat: "Your Go
 * together group", the band and "See your group". The chat header above
 * already names the gathering, so the strip names the group. It stays one
 * line with a 44px button, so the thread keeps its room on a small phone.
 */
export function GoTogetherChatBanner({
  conversation,
}: {
  conversation: Conversation;
}) {
  const { t } = useTranslation();
  const groupId = bannerGroupId(conversation);
  const groupQuery = useGoTogetherGroup(groupId ?? undefined);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const group = groupQuery.data;
  if (!groupId || !group) return null;
  // After a leave the group refetch fails (the member can no longer read it)
  // while react-query keeps the old data. A failed read or an ended group
  // hides the banner, but only once the sheet is closed: the sheet handles
  // both itself.
  const isOver = group.isDissolved || groupQuery.isError;
  if (isOver && !isSheetOpen) return null;

  return (
    <section
      className={styles.chatBanner}
      aria-label={t("goTogether:group.bannerLabel", {
        title: group.event.title,
      })}
    >
      <FiUsers aria-hidden="true" className={styles.chatBannerIcon} />
      <span className={styles.chatBannerTitle}>
        {t("goTogether:group.bannerTitle")}
      </span>
      <GoTogetherBandPill band={group.band} />
      <Button
        variant="ghost"
        className={styles.chatBannerAction}
        onClick={() => setIsSheetOpen(true)}
      >
        {t("goTogether:group.seeGroup")}
      </Button>
      {isSheetOpen && (
        <GoTogetherGroupSheet
          groupId={group.id}
          eventSlug={group.event.slug}
          openedFromConversationId={conversation.id}
          onClose={() => setIsSheetOpen(false)}
        />
      )}
    </section>
  );
}
