import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./MentionsPanel.module.css";
import pageStyles from "./NotificationsPage.module.css";

/** Mirrors a mention row: the portrait picture, then the sentence, two
 *  lines of quoted text and the meta line. The picture block reads the row's
 *  `--lead-w` and `--lead-h`, as the real picture does. */
function MentionRowSkeleton() {
  return (
    <div className={`${styles.row} ${pageStyles.contentRow}`} aria-hidden>
      <SkeletonLine
        width="var(--lead-w)"
        height="var(--lead-h)"
        style={{ borderRadius: "var(--radius-12)", flex: "none" }}
      />
      <div className={pageStyles.body}>
        <SkeletonLine width="60%" height={15} />
        <SkeletonLine width="100%" height={13} style={{ marginTop: 12 }} />
        <SkeletonLine width="80%" height={13} style={{ marginTop: 6 }} />
        <SkeletonLine width={160} height={12} style={{ marginTop: 12 }} />
      </div>
    </div>
  );
}

export function MentionsListSkeleton({ count = 3 }: { count?: number }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className={styles.day}>{t("notifications:mentions.day.today")}</div>
      <div className={styles.list}>
        {Array.from({ length: count }).map((_, i) => (
          <MentionRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
