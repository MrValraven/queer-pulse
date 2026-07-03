import { Link } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import {
  LevelCard,
  EarnedBadges,
  LockedBadges,
  PerksLadder,
} from "./BadgesSections";
import { useProfile } from "../../app/providers/ProfileProvider";
import styles from "./BadgesPage.module.css";

export function BadgesPage() {
  const { profile } = useProfile();
  return (
    <AppShell>
      <div className={styles.page}>
        <div className="wrap">
          <div className={styles.pageHeader}>
            <div>
              <Link to={routes.accountProfile} className={styles.backLink}>
                ← Back to profile
              </Link>
              <h1 className={styles.phTitle}>
                Badges &amp; <em>level</em>
              </h1>
              <div className={styles.phSub}>
                {profile.first} {profile.last}
                {profile.since && ` · Member since ${profile.since}`}
              </div>
            </div>
            <LevelCard />
          </div>

          <EarnedBadges />
          <LockedBadges />
          <PerksLadder />
        </div>
      </div>
    </AppShell>
  );
}
