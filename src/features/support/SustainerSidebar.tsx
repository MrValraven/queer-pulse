import { FiCheckCircle, FiLock, FiShield } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCountUp } from "../../shared/hooks";
import { useAnimatedFill } from "./useAnimatedFill";
import {
  IMPACT_STATS,
  SIDEBAR_AVATARS,
  type AvatarTint,
} from "./sustainer.data";
import type { SustainerStore } from "./useSustainer";
import styles from "./sustainer.module.css";

const AV_CLASS: Record<AvatarTint, string> = {
  jade: styles.avJade!,
  accent: styles.avAccent!,
  cream: styles.avCream!,
  jadeDim: styles.avJadeDim!,
  accentDim: styles.avAccentDim!,
  creamDim: styles.avCreamDim!,
};

/** Sticky sidebar: live supporter count, impact stats, the "why", reassurance. */
export function SustainerSidebar({ store }: { store: SustainerStore }) {
  const { t } = useTranslation();
  const count = useCountUp(store.count);
  const pct = Math.min(100, Math.round((store.count / store.goal) * 100));
  const fill = useAnimatedFill(pct);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sbCard}>
        <div className={styles.sbPlum}>
          <div className={styles.sbPlumTitle}>
            {t("support:hero.supportingNow")}
          </div>
          <div className={styles.sbCount}>{count}</div>
          <div className={styles.sbCountLabel}>
            {t("support:hero.supportingMembersLabel")}
          </div>
          <div className={styles.sbProgress}>
            <div className={styles.sbProgTrack}>
              <div
                className={styles.sbProgFill}
                style={{ width: `${fill}%` }}
              />
            </div>
            <div className={styles.sbProgLabel}>
              <strong>
                {t("support:hero.progressCount", {
                  count: store.count,
                  goal: store.goal,
                })}
              </strong>{" "}
              {t("support:sidebar.membersNeeded")}
            </div>
          </div>
          <div className={styles.sbAvs}>
            {SIDEBAR_AVATARS.map((a) => (
              <div
                key={a.initials}
                className={`${styles.sbAv} ${AV_CLASS[a.tint]}`}
              >
                {a.initials}
              </div>
            ))}
            <div className={`${styles.sbAv} ${styles.avCreamDim}`}>
              +{store.count - SIDEBAR_AVATARS.length}
            </div>
          </div>
          <div className={styles.sbActivity}>
            <span className={styles.dot} />
            {t("support:hero.joinedThisWeek", { count: 3 })}
          </div>
        </div>
      </div>

      <div className={styles.sbCard}>
        <div className={styles.sbStatsHead}>{t("support:sidebar.statsHead")}</div>
        <div className={styles.sbStats}>
          {IMPACT_STATS.map((s) => (
            <div key={s.labelKey} className={styles.sbStat}>
              <div className={styles.sbStatNum}>
                {s.num}
                {s.unitKey ? ` ${t(s.unitKey)}` : ""}
              </div>
              <div className={styles.sbStatLabel}>{t(s.labelKey)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.sbCard}>
        <div className={styles.sbBody}>
          <div className={styles.sbWhyHead}>{t("support:sidebar.whyHead")}</div>
          <div className={styles.sbWhyText}>{t("support:sidebar.whyText")}</div>
          <div className={styles.sbSign}>{t("support:sidebar.sign")}</div>
        </div>
      </div>

      <div className={styles.reassure}>
        <div className={styles.reassureItem}>
          <FiLock size={15} aria-hidden />
          {t("support:sidebar.reassure.stripe")}
        </div>
        <div className={styles.reassureItem}>
          <FiShield size={15} aria-hidden />
          {t("support:sidebar.reassure.cancel")}
        </div>
        <div className={styles.reassureItem}>
          <FiCheckCircle size={15} aria-hidden />
          {t("support:sidebar.reassure.refund")}
        </div>
      </div>
    </aside>
  );
}
