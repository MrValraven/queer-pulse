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
 * The composer's three severed-to-a-notice-bar states — an official thread, a
 * blocked counterpart, or a group the member has left (read access stays, but
 * the server also rejects a post from a left member) — split out of
 * `Composer` to keep it under the line cap. Rendered by the caller only when
 * `Composer`'s own `isSevered` check is true.
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
  return (
    <div className={styles.officialBar}>
      {t("messages:conversation.leftGroupNotice")}
    </div>
  );
}
