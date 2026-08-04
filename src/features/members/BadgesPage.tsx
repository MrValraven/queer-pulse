import { Link } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { EmptyState, Spinner } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  LevelCard,
  EarnedBadges,
  LockedBadges,
  PerksLadder,
} from "./BadgesSections";
import { useRecognition } from "./api/useRecognition";
import { useProfileData } from "../../app/providers/useProfile";
import styles from "./BadgesPage.module.css";

export function BadgesPage() {
  const { t } = useTranslation();
  const { profile } = useProfileData();
  // Gate the recognition-driven surfaces on the hook's real-data flags so live
  // mode shows loading/error/empty states instead of the zeroed placeholder
  // (and never the demo fixtures). Demo mode always has real data.
  const recognition = useRecognition();
  const badgesEmpty =
    recognition.badges.earned.length === 0 &&
    recognition.badges.locked.length === 0;

  let body;
  if (recognition.isLoading) {
    body = (
      <div className={styles.stateWrap} role="status" aria-live="polite">
        <Spinner />
        <span>{t("members:badges.loading")}</span>
      </div>
    );
  } else if (recognition.isError) {
    body = (
      <EmptyState
        title={t("members:badges.errorTitle")}
        description={t("members:badges.errorDescription")}
      />
    );
  } else if (badgesEmpty) {
    body = (
      <EmptyState
        title={t("members:badges.emptyTitle")}
        description={t("members:badges.emptyDescription")}
      />
    );
  } else {
    body = (
      <>
        <EarnedBadges />
        <LockedBadges />
        <PerksLadder />
      </>
    );
  }

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
            {recognition.hasRealData && <LevelCard />}
          </div>

          {body}
        </div>
      </div>
    </AppShell>
  );
}
