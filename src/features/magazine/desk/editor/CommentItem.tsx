import type { ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
import { Avatar } from "../../../../shared/components/ui";
import { cx } from "../../../../shared/lib/cx";
import { initialsFromName } from "../../../../shared/lib/initials";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "../pieceTabs.module.css";

export interface CommentItemProps {
  author: string;
  timeLabel: string;
  body: string;
  resolved: boolean;
  /** Reply/Resolve buttons — top-level comments only (see `CommentThread`). */
  actions?: ReactNode;
}

/**
 * One comment row — a top-level note or a reply, shared by `CommentThread`.
 * A resolved comment stays visible but de-emphasized (dimmed + a "Resolved"
 * chip) rather than hidden, so the thread still reads as a complete record.
 */
export function CommentItem({ author, timeLabel, body, resolved, actions }: CommentItemProps) {
  const { t } = useTranslation();

  return (
    <div className={cx(styles.letter, resolved && styles.letterResolved)}>
      <div className={styles.letterHead}>
        <Avatar initials={initialsFromName(author, "?")} tint="coral" size={28} name={author} />
        <b>{author}</b>
        <span className={cx(styles.tiny, styles.spacer)}>{timeLabel}</span>
        {resolved && (
          <span className={styles.resolvedChip}>
            <FiCheck aria-hidden="true" />
            {t("magazine:write.notes.resolvedChip")}
          </span>
        )}
      </div>
      <p>{body}</p>
      {actions}
    </div>
  );
}
