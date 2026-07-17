import { Link } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PerkGroups, PerksSidebar } from "./PerksSections";
import { useRecognition } from "./api/useRecognition";
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
  const { level, perks } = useRecognition();
  return (
    <AppShell>
      <div className={styles.page}>
        <div className="wrap">
          <Link to={routes.badges} className={styles.backLink}>
            {t("members:perks.page.backToBadges")}
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
          <div className={styles.phStatusRow}>
            <span className={styles.levelChip}>
              <StarIcon />
              {t("members:profile.hero.levelLabel", {
                number: level.level,
              })}{" "}
              · {level.name}
            </span>
            <span className={styles.perksAvail}>
              {t("members:perks.page.availableToRedeem", {
                count: perks.availableCount,
              })}
            </span>
          </div>

          <div className={styles.layout}>
            <PerkGroups />
            <PerksSidebar />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
