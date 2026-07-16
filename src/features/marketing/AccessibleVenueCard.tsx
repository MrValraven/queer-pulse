import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Badge, Venue } from "./accessibility.data";
import styles from "./AccessibilityPage.module.css";

const BADGE_CLASS: Record<Badge, string> = {
  yes: styles.badgeYes!,
  partial: styles.badgePartial!,
  no: styles.badgeNo!,
};

export function AccessibleVenueCard({
  v,
  onFlag,
}: {
  v: Venue;
  onFlag: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.venueCard}>
      <div className={styles.vcName}>{v.name}</div>
      <div className={styles.vcType}>{v.type}</div>
      <div className={styles.vcHood}>
        <span className={styles.vcHoodDot} />
        {v.hood}
      </div>
      <p className={styles.vcNote}>{v.note}</p>
      <div className={styles.vcFeatures}>
        {v.features.map((f) => (
          <span
            key={f.label}
            className={`${styles.vfBadge} ${BADGE_CLASS[f.cls]}`}
          >
            {f.label}
          </span>
        ))}
      </div>
      <div className={styles.vcFoot}>
        <span className={styles.vcReviewer}>
          {v.reviewedByCount !== undefined
            ? t("marketing:accessibility.venue.reviewedBy", {
                count: v.reviewedByCount,
              })
            : t("marketing:accessibility.venue.operatedBadge")}
        </span>
        <button type="button" className={styles.flagBtn} onClick={onFlag}>
          {t("marketing:accessibility.venue.flagCta")}
        </button>
      </div>
    </div>
  );
}

export function AccessibleVenueCardSkeleton() {
  // Mirrors the real .venueCard: name, type, hood, note, feature badges, footer.
  return (
    <div className={styles.venueCard} aria-hidden>
      <SkeletonLine width="70%" height={21} />
      <SkeletonLine
        width={90}
        height={11}
        style={{ marginTop: 4, marginBottom: 10 }}
      />
      <SkeletonLine width="45%" height={13} style={{ marginBottom: 12 }} />
      <SkeletonLine width="100%" height={13.5} />
      <SkeletonLine
        width="88%"
        height={13.5}
        style={{ marginTop: 5, marginBottom: 14 }}
      />
      <div className={styles.vcFeatures}>
        <SkeletonLine width={88} height={24} style={{ borderRadius: 7 }} />
        <SkeletonLine width={104} height={24} style={{ borderRadius: 7 }} />
        <SkeletonLine width={72} height={24} style={{ borderRadius: 7 }} />
      </div>
      <div className={styles.vcFoot}>
        <SkeletonLine width="50%" height={12} />
      </div>
    </div>
  );
}
