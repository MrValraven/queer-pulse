import type { ReactNode } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isMentionExcerptEmpty } from "./mentionExcerptIsEmpty";
import styles from "./MentionsPanel.module.css";

/**
 * The quoted text of one mention row.
 *
 * ENG-411. The backend serves `excerpt: ""` once the text that mentioned the
 * member is deleted, edited or taken down. An empty excerpt renders a short
 * muted notice in its place, so the row keeps its shape with no blank block.
 */
export function MentionExcerpt({ content }: { content: ReactNode }) {
  const { t } = useTranslation();
  if (isMentionExcerptEmpty(content)) {
    return (
      <div className={styles.contentGone}>
        {t("notifications:mentions.row.unavailable")}
      </div>
    );
  }
  return <div className={styles.content}>{content}</div>;
}
