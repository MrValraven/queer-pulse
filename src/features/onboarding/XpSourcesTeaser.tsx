import { useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Button } from "../../shared/components/ui";
import { useRecognition } from "../members/api/useRecognition";
import { XpSourceRow } from "./XpSourceRow";
import { XpBreakdownModal } from "./XpBreakdownModal";
import styles from "./GettingStartedPage.module.css";

const TOP_SOURCES_SHOWN = 3;

/**
 * A quiet "what earned it" preview below `LevelXpStrip` — the top XP sources
 * so far, with a "See full breakdown" button that opens `XpBreakdownModal`
 * (every source, not just the top 3), which itself links on to the Badges
 * page. Gated on `hasRealData` exactly like `LevelXpStrip`, and hides itself
 * if nothing has earned XP yet rather than showing an empty list.
 *
 * Only ever rendered while the Getting Started checklist still has steps
 * left (see `GettingStartedPage`), so it always forces a fresh recompute —
 * that's exactly the window where a member can rack up several XP-earning
 * actions within minutes and a throttled read would look stale.
 */
export function XpSourcesTeaser() {
  const { t } = useTranslation();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const recognition = useRecognition(undefined, { force: true });
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
        {topSources.map((source) => (
          <XpSourceRow key={source.key} source={source} />
        ))}
      </ul>
      <Button
        variant="ghost"
        size="sm"
        className={styles.xpSourcesLink}
        onClick={() => setShowBreakdown(true)}
      >
        {t("auth:gettingStarted.xpSources.seeAll")}
      </Button>
      {showBreakdown && (
        <XpBreakdownModal
          breakdown={recognition.xpBreakdown}
          onClose={() => setShowBreakdown(false)}
        />
      )}
    </section>
  );
}
