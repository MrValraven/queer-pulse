import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { EmptyState, Spinner } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { BadgeDrawerEntry } from "./badges.data";
import { useRecognition } from "./api/useRecognition";
import { useProfileData } from "../../app/providers/useProfile";
import { useMutedBadgeCategories } from "./useBadgePreferences";
import { BadgesHero } from "./BadgesHero";
import { BadgesMomentum } from "./BadgesMomentum";
import { BadgesCase } from "./BadgesCase";
import { BadgesSeasonal } from "./BadgesSeasonal";
import { BadgesLadder } from "./BadgesLadder";
import { BadgesLedger } from "./BadgesLedger";
import { BadgeDrawer } from "./BadgeDrawer";
import { useBadgeStoryNotes } from "./useBadgePreferences";
import styles from "./BadgesPage.module.css";

export function BadgesPage() {
  const { t } = useTranslation();
  const { profile } = useProfileData();
  // Gate the recognition-driven surfaces on the hook's real-data flags so live
  // mode shows loading/error/empty states instead of the zeroed placeholder
  // (and never the demo fixtures). Demo mode always has real data.
  const recognition = useRecognition();
  const { mutedCategories, isCategoryMuted, toggleCategory, unmuteAll } = useMutedBadgeCategories();
  const { getStoryNote } = useBadgeStoryNotes();
  const [drawerSelection, setDrawerSelection] = useState<{
    entries: BadgeDrawerEntry[];
    index: number;
  } | null>(null);

  const badgesEmpty =
    recognition.badges.earned.length === 0 && recognition.badges.locked.length === 0;
  const openBadge = (entries: BadgeDrawerEntry[], index: number) =>
    setDrawerSelection({ entries, index });

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
        <BadgesHero
          memberName={`${profile.first} ${profile.last}`}
          since={profile.since}
          recognition={recognition}
        />
        <BadgesMomentum
          lockedBadges={recognition.badges.locked}
          mutedCategories={mutedCategories}
          unmuteAll={unmuteAll}
          xpBreakdown={recognition.xpBreakdown}
          level={recognition.level}
          onOpenBadge={openBadge}
        />
        <BadgesCase
          earnedBadges={recognition.badges.earned}
          lockedBadges={recognition.badges.locked}
          mutedCategories={mutedCategories}
          isCategoryMuted={isCategoryMuted}
          toggleCategory={toggleCategory}
          getStoryNote={getStoryNote}
          onOpenBadge={openBadge}
        />
        <BadgesSeasonal seasonalBadges={recognition.badges.seasonal} onOpenBadge={openBadge} />
        <BadgesLadder perksLadder={recognition.perks.ladder} />
        <BadgesLedger
          xpLedger={recognition.xpLedger}
          totalBadgeCount={recognition.badges.earnedCount + recognition.badges.discoverCount}
          totalLevelCount={recognition.perks.ladder.length}
        />
      </>
    );
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <div className="wrap">
          {(recognition.isLoading || recognition.isError || badgesEmpty) && (
            <div className={styles.simpleHeader}>
              <Link to={routes.accountProfile} className={styles.simpleBackLink}>
                <FiArrowLeft aria-hidden /> {t("members:badges.backToProfile")}
              </Link>
              <h1 className={styles.simpleTitle}>
                <Translation i18nKey="members:badges.pageTitle" components={{ em: <em /> }} />
              </h1>
            </div>
          )}
          {body}
        </div>
      </div>
      {drawerSelection && (
        <BadgeDrawer
          entries={drawerSelection.entries}
          index={drawerSelection.index}
          onNavigate={(index) => setDrawerSelection((prev) => (prev ? { ...prev, index } : prev))}
          onClose={() => setDrawerSelection(null)}
        />
      )}
    </AppShell>
  );
}
