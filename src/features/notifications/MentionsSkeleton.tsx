import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./MentionsPage.module.css";

/** Mirrors a mention row: head (avatar + who + when) + content + where. */
function MentionRowSkeleton() {
  return (
    <div className={styles.row} aria-hidden>
      <div className={styles.headRow}>
        <SkeletonLine
          width={32}
          height={32}
          style={{ borderRadius: 999, flex: "none" }}
        />
        <SkeletonLine width={180} height={13} />
        <SkeletonLine width={56} height={12} style={{ marginLeft: "auto" }} />
      </div>
      <SkeletonLine width="100%" height={14} style={{ marginTop: 2 }} />
      <SkeletonLine width="80%" height={14} style={{ marginTop: 6 }} />
      <SkeletonLine width={140} height={12} style={{ marginTop: 10 }} />
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
