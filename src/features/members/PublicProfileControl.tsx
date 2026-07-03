import { FiArrowRight, FiCheck, FiGlobe, FiLock } from "react-icons/fi";
import { Button, Toggle } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { usePublicProfile } from "../../app/providers/PublicProfileProvider";
import type { EligibilityCriterion } from "./publicFigure";
import styles from "./PublicProfileControl.module.css";

/** One row of the "how you unlock a public profile" checklist. */
function CriterionRow({ criterion }: { criterion: EligibilityCriterion }) {
  const { met, label, hint } = criterion;
  return (
    <li className={`${styles.crit} ${met ? styles.critMet : ""}`}>
      <span className={styles.critMark} aria-hidden>
        {met ? <FiCheck /> : <span className={styles.critDot} />}
      </span>
      <span className={styles.critText}>
        <span className={styles.critLabel}>{label}</span>
        <span className={styles.critHint}>{hint}</span>
      </span>
    </li>
  );
}

/**
 * The member's own public-profile control, shown on their profile. Locked until
 * they're eligible (a contributor-checklist explains how it's earned); once
 * eligible, an off-by-default switch plus a "View public profile" button.
 */
export function PublicProfileControl() {
  const { enabled, toggle, eligibility } = usePublicProfile();
  const { showToast } = useToast();

  if (!eligibility.eligible) {
    const metCount = eligibility.criteria.filter((c) => c.met).length;
    return (
      <div className="wrap">
        <section className={styles.panel}>
          <div className={styles.head}>
            <span className={styles.icon} aria-hidden>
              <FiLock />
            </span>
            <div>
              <span className={styles.eyebrow}>Public profile · locked</span>
              <h2 className={styles.title}>
                A public profile is something you <em>grow into.</em>
              </h2>
            </div>
          </div>
          <p className={styles.lede}>
            Public profiles are for members who help carry the public side of
            QueerPulse — writers, hosts, organisers. Here's where you are:
          </p>
          <ul className={styles.list}>
            {eligibility.criteria.map((c) => (
              <CriterionRow key={c.key} criterion={c} />
            ))}
          </ul>
          <p className={styles.progress}>
            {metCount} of {eligibility.criteria.length} met — keep showing up
            and this unlocks on its own.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className={`wrap ${styles.wrap}`}>
      <section className={styles.panel}>
        <div className={styles.head}>
          <span className={styles.icon} aria-hidden>
            <FiGlobe />
          </span>
          <div>
            <span className={styles.eyebrow}>Public profile · unlocked</span>
            <h2 className={styles.title}>
              You can share a <em>public profile.</em>
            </h2>
          </div>
        </div>
        <p className={styles.lede}>
          A public profile lets people who aren't members yet find your writing,
          your events, and a way to reach you — without opening the rest of the
          community.
        </p>

        <div className={styles.switchRow}>
          <div className={styles.switchText}>
            <span className={styles.switchLabel}>Show a public profile</span>
            <span
              className={`${styles.status} ${enabled ? styles.statusOn : ""}`}
            >
              {enabled
                ? "Live — anyone can view your public profile."
                : "Off — only members can find you."}
            </span>
          </div>
          <Toggle
            tone="jade"
            checked={enabled}
            label="Show a public profile"
            onChange={() => {
              toggle();
              showToast(
                enabled
                  ? "Your public profile is hidden"
                  : "Your public profile is live",
                enabled ? "info" : "success",
              );
            }}
          />
        </div>

        <div className={styles.actions}>
          <Button variant="ghost-dark" to={routes.publicProfile}>
            View public profile <FiArrowRight aria-hidden />
          </Button>
        </div>
      </section>
    </div>
  );
}
