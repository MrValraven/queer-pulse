import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { EmptyState, Spinner } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PerkGroups, PerksSidebar } from "./PerksSections";
import { useRecognition } from "./api/useRecognition";
import { levelNameKeyFor } from "./levelLadder.data";
import styles from "./PerksPage.module.css";

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M6 1l1.2 3.6H11L8 6.8l1.2 3.6L6 8.2l-3.2 2.2L4 6.8 1 4.6h3.8L6 1Z"
        stroke="var(--jade)"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PerksPage() {
  const { t } = useTranslation();
  // Gate the recognition-driven surfaces on the hook's real-data flags so live
  // mode shows loading/error/empty states instead of the zeroed placeholder
  // (and never the demo fixtures). Demo mode always has real data.
  const recognition = useRecognition();
  const { level, perks } = recognition;
  const perksEmpty = perks.groups.length === 0;
  // The ladder's words are owned by the frontend and keyed on the level
  // NUMBER (see `levelLadder.data.ts`); an unknown rung keeps the server's
  // own English name.
  const levelNameKey = levelNameKeyFor(level.level);

  let body;
  if (recognition.isLoading) {
    body = (
      <div className={styles.stateWrap} role="status" aria-live="polite">
        <Spinner />
        <span>{t("members:perks.page.loading")}</span>
      </div>
    );
  } else if (recognition.isError) {
    body = (
      <EmptyState
        title={t("members:perks.page.errorTitle")}
        description={t("members:perks.page.errorDescription")}
      />
    );
  } else if (perksEmpty) {
    body = (
      <EmptyState
        title={t("members:perks.page.emptyTitle")}
        description={t("members:perks.page.emptyDescription")}
      />
    );
  } else {
    body = (
      <div className={styles.layout}>
        <PerkGroups />
        <PerksSidebar />
      </div>
    );
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <div className="wrap">
          <Link to={routes.badges} className={styles.backLink}>
            <FiArrowLeft aria-hidden /> {t("members:perks.page.backToBadges")}
          </Link>
          <div className={styles.phEyebrow}>
            {t("members:profile.hero.perksTitle")}
          </div>
          <h1 className={styles.phTitle}>
            <Translation
              i18nKey="members:perks.page.title"
              components={{ em: <em /> }}
            />
          </h1>
          {recognition.hasRealData && (
            <div className={styles.phStatusRow}>
              <span className={styles.levelChip}>
                <StarIcon />
                {t("members:profile.hero.levelLabel", {
                  number: level.level,
                })}{" "}
                · {levelNameKey ? t(levelNameKey) : level.name}
              </span>
              <span className={styles.perksAvail}>
                {t("members:perks.page.availableToRedeem", {
                  count: perks.availableCount,
                })}
              </span>
            </div>
          )}

          {body}
        </div>
      </div>
    </AppShell>
  );
}
