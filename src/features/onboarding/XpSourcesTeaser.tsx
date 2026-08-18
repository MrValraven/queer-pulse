import { useTranslation } from "../../shared/i18n/useTranslation";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useRecognition } from "../members/api/useRecognition";
import { xpSourceMetaFor } from "../members/xpBreakdown.data";
import styles from "./GettingStartedPage.module.css";

const TOP_SOURCES_SHOWN = 3;

/**
 * A quiet "what earned it" preview below `LevelXpStrip` — the top XP sources
 * so far, with a link to the full breakdown on the Badges page. Gated on
 * `hasRealData` exactly like `LevelXpStrip`, and hides itself if nothing has
 * earned XP yet rather than showing an empty list.
 */
export function XpSourcesTeaser() {
  const { t } = useTranslation();
  const recognition = useRecognition();
  if (!recognition.hasRealData || recognition.isLoading) return null;

  const topSources = [...recognition.xpBreakdown]
    .filter((item) => item.xp > 0)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, TOP_SOURCES_SHOWN);
  if (topSources.length === 0) return null;

  return (
    <section
      className={styles.xpSources}
      aria-label={t("auth:gettingStarted.xpSources.eyebrow")}
    >
      <span className={styles.xpSourcesEyebrow}>
        {t("auth:gettingStarted.xpSources.eyebrow")}
      </span>
      <ul className={styles.xpSourcesList}>
        {topSources.map((source) => {
          const { labelKey, icon: Icon } = xpSourceMetaFor(source.key);
          return (
            <li key={source.key} className={styles.xpSourceRow}>
              <Icon aria-hidden />
              <span className={styles.xpSourceLabel}>{t(labelKey)}</span>
              <span className={styles.xpSourceAmount}>
                {t("auth:gettingStarted.xpSources.amount", {
                  xp: String(source.xp),
                })}
              </span>
            </li>
          );
        })}
      </ul>
      <Button
        to={routes.badges}
        variant="ghost"
        size="sm"
        className={styles.xpSourcesLink}
      >
        {t("auth:gettingStarted.xpSources.seeAll")}
      </Button>
    </section>
  );
}
