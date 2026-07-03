import { FiCheckCircle, FiLock, FiShield } from "react-icons/fi";
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
  const count = useCountUp(store.count);
  const pct = Math.min(100, Math.round((store.count / store.goal) * 100));
  const fill = useAnimatedFill(pct);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sbCard}>
        <div className={styles.sbPlum}>
          <div className={styles.sbPlumTitle}>Supporting right now</div>
          <div className={styles.sbCount}>{count}</div>
          <div className={styles.sbCountLabel}>supporting members</div>
          <div className={styles.sbProgress}>
            <div className={styles.sbProgTrack}>
              <div
                className={styles.sbProgFill}
                style={{ width: `${fill}%` }}
              />
            </div>
            <div className={styles.sbProgLabel}>
              <strong>
                {store.count} of {store.goal}
              </strong>{" "}
              members needed to fully cover monthly costs
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
            <span className={styles.dot} />3 people joined this week
          </div>
        </div>
      </div>

      <div className={styles.sbCard}>
        <div className={styles.sbStatsHead}>Members' impact so far</div>
        <div className={styles.sbStats}>
          {IMPACT_STATS.map((s) => (
            <div key={s.label} className={styles.sbStat}>
              <div className={styles.sbStatNum}>{s.num}</div>
              <div className={styles.sbStatLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.sbCard}>
        <div className={styles.sbBody}>
          <div className={styles.sbWhyHead}>Why we built it this way</div>
          <div className={styles.sbWhyText}>
            We turned down investment offers. Not out of pride — out of
            principle. The moment a platform has investors, the community stops
            being the product and starts becoming one. QueerPulse stays free
            because the people who use it choose to keep it alive. That's the
            deal.
          </div>
          <div className={styles.sbSign}>— The QueerPulse team</div>
        </div>
      </div>

      <div className={styles.reassure}>
        <div className={styles.reassureItem}>
          <FiLock size={15} aria-hidden />
          Secure via Stripe
        </div>
        <div className={styles.reassureItem}>
          <FiShield size={15} aria-hidden />
          Cancel any time
        </div>
        <div className={styles.reassureItem}>
          <FiCheckCircle size={15} aria-hidden />
          14-day refund
        </div>
      </div>
    </aside>
  );
}
