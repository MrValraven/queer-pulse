import { Link } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  LevelCard,
  EarnedBadges,
  LockedBadges,
  PerksLadder,
} from "./BadgesSections";
import { useProfile } from "../../app/providers/useProfile";
import styles from "./BadgesPage.module.css";

export function BadgesPage() {
  const { t } = useTranslation();
  const { profile } = useProfile();
  return (
    <AppShell>
      <div className={styles.page}>
        <div className="wrap">
          <div className={styles.pageHeader}>
            <div>
              <Link to={routes.accountProfile} className={styles.backLink}>
                {t("members:badges.backToProfile")}
              </Link>
              <h1 className={styles.phTitle}>
                <Translation
                  i18nKey="members:badges.pageTitle"
                  components={{ em: <em /> }}
                />
              </h1>
              <div className={styles.phSub}>
                {profile.first} {profile.last}
                {profile.since &&
                  ` · ${t("members:profile.hero.memberSince", { since: profile.since })}`}
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
