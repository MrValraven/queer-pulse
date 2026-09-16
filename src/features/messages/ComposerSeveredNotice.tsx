// src/features/messages/ComposerSeveredNotice.tsx
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

interface ComposerSeveredNoticeProps {
  active: Conversation;
  blocked: boolean;
  firstName: string;
}

/**
 * The composer's severed-to-a-notice-bar states: an official thread, a
 * blocked counterpart, or a group the member is no longer active in (read
 * access stays, but the server also rejects a post from a non-active
 * member), split out of `Composer` to keep it under the line cap. Rendered
 * by the caller only when `Composer`'s own `isSevered` check is true.
 * DES-227: the group case has three distinct reasons, see
 * `Conversation.leftReason`, and the copy names the true one rather than
 * always saying "You left".
 */
export function ComposerSeveredNotice({
  active,
  blocked,
  firstName,
}: ComposerSeveredNoticeProps) {
  const { t } = useTranslation();
  if (active.official) {
    return (
      <div className={styles.officialBar}>
        {t("messages:conversation.officialNotice")}
      </div>
    );
  }
  if (blocked) {
    return (
      <div className={styles.officialBar}>
        {t("messages:conversation.blockedNotice", { name: firstName })}
      </div>
    );
  }
  // Absent/"left" is the default (voluntary leave, or an older cached
  // response that predates `leftReason`), matching the notice's original
  // wording.
  const noticeKey =
    active.leftReason === "removed"
      ? "messages:conversation.removedGroupNotice"
      : active.leftReason === "dissolved"
        ? "messages:conversation.dissolvedGroupNotice"
        : "messages:conversation.leftGroupNotice";
  return <div className={styles.officialBar}>{t(noticeKey)}</div>;
}
