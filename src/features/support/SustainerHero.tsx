import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useCountUp } from "../../shared/hooks";
import { useAnimatedFill } from "./useAnimatedFill";
import { HERO_AVATARS } from "./sustainer.data";
import type { SustainerStore } from "./useSustainer";
import styles from "./sustainer.module.css";

export function SustainerHero({
  store,
  onChooseAmount,
  onSeeBudget,
}: {
  store: SustainerStore;
  onChooseAmount: () => void;
  onSeeBudget: () => void;
}) {
  const count = useCountUp(store.count);
  const pct = Math.min(100, Math.round((store.count / store.goal) * 100));
  const fill = useAnimatedFill(pct);

  return (
    <section className={styles.susHero}>
      <div className={`wrap ${styles.heroWrap}`}>
        <div>
          <div className={styles.heroEyebrow}>Supporting membership</div>
          <h1 className={styles.heroTitle}>
            Keep QueerPulse <em>going</em>
          </h1>
          <p className={styles.heroSub}>
            QueerPulse is free to join and always will be. Supporting members
            help cover the costs of running it — hosting, moderation tools, and
            keeping the team fed.
          </p>
          <div className={styles.heroCtaRow}>
            <Button variant="primary" size="lg" onClick={onChooseAmount}>
              Choose an amount
            </Button>
            <Button variant="ghost-dark" onClick={onSeeBudget}>
              See where it goes
            </Button>
          </div>
          <div className={styles.heroChips}>
            <span className={styles.heroChip}>Built by a small team</span>
            <span className={styles.heroChip}>No investors</span>
            <span className={styles.heroChip}>Free forever</span>
          </div>
        </div>

        <div className={styles.heroProof}>
          <div className={styles.hpLive}>
            <span className={styles.dot} />
            Supporting now
          </div>
          <div className={styles.hpCount}>{count}</div>
          <div className={styles.hpCountLabel}>supporting members</div>
          <div className={styles.hpAvs}>
            {HERO_AVATARS.map((a) => (
              <div
                key={a.initials}
                className={styles.hpAv}
                style={{ background: a.bg, color: a.fg }}
              >
                {a.initials}
              </div>
            ))}
            <div
              className={styles.hpAv}
              style={{
                background: "rgba(247,243,238,.14)",
                color: "var(--cream)",
              }}
            >
              +{store.count - HERO_AVATARS.length}
            </div>
          </div>
          <div className={styles.progTrack}>
            <div className={styles.progFill} style={{ width: `${fill}%` }} />
          </div>
          <div className={styles.progLabelSmall}>
            <strong>
              {store.count} of {store.goal}
            </strong>{" "}
            to break even
          </div>
          <div className={styles.hpActivity}>
            <FiArrowRight aria-hidden style={{ transform: "rotate(-90deg)" }} />
            3 people joined this week
          </div>
        </div>
      </div>
    </section>
  );
}
