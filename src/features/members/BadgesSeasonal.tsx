import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Badge, BadgeDrawerEntry } from "./badges.data";
import { badgeDisplayMetaFor, seasonalWindowDateOf } from "./badgeCatalog.data";
import { useFormat } from "../../shared/i18n/format";
import { BadgeMedallion } from "./BadgeMedallion";
import styles from "./BadgesPage.module.css";

/**
 * One time-limited badge ticket. The catalogue ships a stable id beside its
 * English display words, so the words resolve here rather than off the wire
 * (see `badgeCatalog.data.ts`); an id this build has no entry for falls back
 * to the server's own English.
 *
 * The window line ("Open until 30 June 2026") comes from the same place. The
 * DATE inside it is formatted here through `useFormat()` and passed into the
 * sentence as `{date}`, so no language has to carry a hand-written date: PT
 * reads "Aberto até 30 de junho de 2026" off the same value. A badge with no
 * `seasonalWindow` entry falls back to the server's own English line.
 */
function SeasonalTicket({
  badge,
  onOpen,
}: {
  badge: Badge;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const displayMeta = badgeDisplayMetaFor(badge.key);
  const windowMeta = displayMeta?.seasonalWindow;
  const windowLine = windowMeta
    ? t(
        windowMeta.labelKey,
        windowMeta.date
          ? {
              date: format.date(
                seasonalWindowDateOf(windowMeta.date),
                windowMeta.dateOptions,
              ),
            }
          : undefined,
      )
    : badge.seasonal?.when;
  return (
    <button type="button" className={styles.ticket} onClick={onOpen}>
      <BadgeMedallion badge={badge} earned={false} size="sm" />
      <span className={styles.ticketBody}>
        <h4>{displayMeta ? t(displayMeta.nameKey) : badge.name}</h4>
        <p>
          {displayMeta
            ? t(displayMeta.lockedContextKey)
            : (badge.criteria ?? badge.when)}
        </p>
        {badge.seasonal && windowLine && (
          <span className={styles.ticketWhen}>{windowLine}</span>
        )}
      </span>
    </button>
  );
}

interface BadgesSeasonalProps {
  seasonalBadges: Badge[];
  onOpenBadge: (entries: BadgeDrawerEntry[], index: number) => void;
}

/** Time-limited badges, shown in their own plum band rather than mixed into
 *  the main case grid. Not yet earned by anyone browsing this page. */
export function BadgesSeasonal({
  seasonalBadges,
  onOpenBadge,
}: BadgesSeasonalProps) {
  const { t } = useTranslation();
  if (seasonalBadges.length === 0) return null;
  const entries: BadgeDrawerEntry[] = seasonalBadges.map((badge) => ({
    badge,
    earned: false,
  }));

  return (
    <section className={styles.sec}>
      <div className={styles.seasonBand}>
        <div className={styles.hd}>
          <div>
            <span className={styles.hdEyebrow}>
              {t("members:badges.seasonal.eyebrow")}
            </span>
            <h2 className={`${styles.hdTitle} ${styles.hdLvl2}`}>
              <Translation
                i18nKey="members:badges.seasonal.heading"
                components={{ em: <em /> }}
              />
            </h2>
            <p className={styles.hdSub}>{t("members:badges.seasonal.sub")}</p>
          </div>
        </div>
        <div className={styles.seasons}>
          {seasonalBadges.map((badge, index) => (
            <SeasonalTicket
              key={badge.key}
              badge={badge}
              onOpen={() => onOpenBadge(entries, index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
