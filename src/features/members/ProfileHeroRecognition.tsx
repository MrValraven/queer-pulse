import { Link } from "react-router-dom";
import { SkeletonLine } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useRecognition } from "./api/useRecognition";
import { levelNameKeyFor } from "./levelLadder.data";
import styles from "./ProfileHeroMain.module.css";

/** The hero's recognition strip, picked by view: the fuller self view on your
 *  own profile, the narrower visitor view everywhere else (the visitor
 *  preview of your own profile included). */
export function ProfileHeroRecognition({
  isSelf,
  slug,
}: {
  isSelf: boolean;
  slug: string;
}) {
  return isSelf ? <HeroRecognition /> : <OtherMemberRecognition slug={slug} />;
}

/**
 * A quiet recognition strip that lives in the profile hero meta zone: three
 * small chips (level, badges, perks) that link through to your own badges/
 * perks pages. Deliberately subtle (no heading, no card), so it reads as
 * secondary hero meta rather than a headline section. Rendered only on your
 * own profile (the "own view" branch; see `OtherMemberRecognition` below
 * for what a visitor sees on someone else's).
 */
function HeroRecognition() {
  const { t } = useTranslation();
  const { level, badges, perks, hasRealData } = useRecognition();
  // The ladder's words are owned by the frontend and keyed on the level
  // NUMBER (see `levelLadder.data.ts`); an unknown rung keeps the server's
  // own English name.
  const levelNameKey = levelNameKeyFor(level.level);
  // Until real recognition data lands in live mode, skeleton the chips rather
  // than flash the demo placeholder's fictional level/badge/perk counts.
  if (!hasRealData) {
    return (
      <div className={styles.heroRecog} aria-hidden>
        <SkeletonLine width={128} height={26} />
        <SkeletonLine width={92} height={26} />
        <SkeletonLine width={108} height={26} />
      </div>
    );
  }
  const totalBadges = badges.earnedCount + badges.discoverCount;
  return (
    <div className={styles.heroRecog}>
      <Link
        to={routes.badges}
        className={`${styles.heroRecogChip} ${styles.accent}`}
      >
        {t("members:profile.hero.levelLabel", { number: level.level })} ·{" "}
        {levelNameKey ? t(levelNameKey) : level.name}
      </Link>
      <Link to={routes.badges} className={styles.heroRecogChip}>
        {t("members:profile.hero.badgesChip", {
          earned: badges.earnedCount,
          total: totalBadges,
        })}
      </Link>
      <Link
        to={routes.perks}
        className={`${styles.heroRecogChip} ${styles.jade}`}
      >
        {t("members:profile.hero.perksChip", { count: perks.availableCount })}
      </Link>
    </div>
  );
}

/**
 * The same quiet recognition strip as `HeroRecognition`, but for viewing
 * ANOTHER member's profile (or your own profile in visitor-preview mode).
 * Recognition (level + badges) is a visible trust signal between members:
 * the backend has always supported reading it by slug
 * (`GET /profiles/:slug/recognition`), but no frontend surface ever called
 * `useRecognition(slug)` for someone else until now (COM-24).
 *
 * Deliberately narrower than the self view: no perks chip, and the chips
 * aren't links. Perk state is owner-only: the backend already omits it for
 * a non-owner slug lookup (`availableCount` comes back `0`), so showing a
 * "0 perks" chip on a stranger's profile would misread as "this member has
 * no perks" rather than "you can't see their perks"; better to just not
 * show it. `/badges` and `/perks` are self-scoped pages (they always render
 * the viewer's OWN recognition, whichever profile links there), so linking to
 * them from here would silently swap in the viewer's own data; the chips
 * are plain, non-interactive text instead.
 */
function OtherMemberRecognition({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { level, badges, hasRealData } = useRecognition(slug);
  // The ladder's words are owned by the frontend and keyed on the level
  // NUMBER (see `levelLadder.data.ts`); an unknown rung keeps the server's
  // own English name.
  const levelNameKey = levelNameKeyFor(level.level);
  if (!hasRealData) {
    return (
      <div className={styles.heroRecog} aria-hidden>
        <SkeletonLine width={128} height={26} />
        <SkeletonLine width={92} height={26} />
      </div>
    );
  }
  const totalBadges = badges.earnedCount + badges.discoverCount;
  return (
    <div className={styles.heroRecog}>
      <span className={`${styles.heroRecogChip} ${styles.accent}`}>
        {t("members:profile.hero.levelLabel", { number: level.level })} ·{" "}
        {levelNameKey ? t(levelNameKey) : level.name}
      </span>
      <span className={styles.heroRecogChip}>
        {t("members:profile.hero.badgesChip", {
          earned: badges.earnedCount,
          total: totalBadges,
        })}
      </span>
    </div>
  );
}
