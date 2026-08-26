import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiPauseCircle,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { intlLocale } from "../../shared/i18n/locale";
import { formatDate } from "../../shared/lib/date";
import { SafeSpaceFlagControl } from "./SafeSpaceFlagControl";
import { useSafeSpaceBadgeState } from "./api/useSafeSpaceBadgeState";
import type {
  SafeSpaceBadgeState,
  SafeSpaceBadgeStateDTO,
} from "./api/safeSpaceGovernance.api";
import styles from "./SafeSpaceBadgeStatus.module.css";

/** Which states carry a real grant, so a member may flag them. */
const BADGED_STATES: SafeSpaceBadgeState[] = ["verified", "suspended"];

const STATE_ICON: Record<SafeSpaceBadgeState, IconType> = {
  none: FiClock,
  under_review: FiClock,
  verified: FiCheckCircle,
  suspended: FiPauseCircle,
  removed: FiAlertCircle,
};

/**
 * The honest state of one space's safe-space badge, wherever the badge is
 * rendered.
 *
 * This exists because `safeSpaceStatus === "verified"` is not the truth. That
 * column still reads `verified` while a suspension stands against the badge,
 * says nothing about a badge whose annual re-review has come due, and cannot
 * distinguish a space still collecting its three independent visits from one
 * that has met the bar. A suspended badge rendering as verified is the exact
 * failure the whole mechanism exists to prevent, so every render site should
 * read `state` from `GET /safe-spaces/:slug/badge-state` through here.
 *
 * PRIVACY: the payload carries no flag count and no flagger, and neither does
 * this component. A member is told a space is under review. They are never
 * told how many people said so, or who.
 */
export function SafeSpaceBadgeStatus({
  slug,
  spaceName,
}: {
  slug: string;
  spaceName: string;
}) {
  const { badge, isLoading } = useSafeSpaceBadgeState(slug);

  if (isLoading) {
    return (
      <div className={styles.panel} aria-busy="true">
        <SkeletonLine width="45%" height={18} />
        <SkeletonLine width="80%" height={14} style={{ marginTop: 10 }} />
      </div>
    );
  }
  if (!badge || badge.state === "none") return null;

  return (
    <div className={styles.wrap}>
      <BadgeStatePanel badge={badge} />
      {BADGED_STATES.includes(badge.state) && (
        <SafeSpaceFlagControl
          slug={slug}
          spaceName={spaceName}
          hasAlreadyFlagged={badge.viewerHasFlagged}
          flagThreshold={badge.flagThreshold}
        />
      )}
    </div>
  );
}

/** The panel itself: one tone, one headline, one plain explanation. */
function BadgeStatePanel({ badge }: { badge: SafeSpaceBadgeStateDTO }) {
  const { t, language } = useTranslation();
  const locale = intlLocale(language);
  const Icon = STATE_ICON[badge.state];
  // A verified badge past its annual re-review is still verified, and saying
  // only "verified" would hide the one thing a member would want to know.
  const tone =
    badge.state === "verified" && badge.isDueForReReview ? "due" : badge.state;

  return (
    <section className={styles.panel} data-tone={tone}>
      <span className={styles.seal} aria-hidden>
        <Icon size={20} />
      </span>
      <div className={styles.body}>
        <h3 className={styles.title}>
          {badge.state === "verified" && badge.tier
            ? t("safety:badge.state.verified.titleTier", { tier: badge.tier })
            : t(`safety:badge.state.${tone}.title`)}
        </h3>
        <p className={styles.lead}>{t(`safety:badge.state.${tone}.lead`)}</p>

        {badge.state === "suspended" && badge.suspensionReason && (
          <p className={styles.reason}>{badge.suspensionReason}</p>
        )}

        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt>{t("safety:badge.fact.visits")}</dt>
            <dd>
              {t("safety:badge.fact.visitsValue", {
                count: badge.visits.independentVisitCount,
                required: badge.visits.requiredVisitCount,
              })}
            </dd>
          </div>
          {badge.badgeAwardedAt && (
            <div className={styles.fact}>
              <dt>{t("safety:badge.fact.awarded")}</dt>
              <dd>{formatDate(badge.badgeAwardedAt, locale)}</dd>
            </div>
          )}
          {badge.reReviewDueAt && (
            <div className={styles.fact}>
              <dt>{t("safety:badge.fact.reReview")}</dt>
              <dd>{formatDate(badge.reReviewDueAt, locale)}</dd>
            </div>
          )}
          {badge.verifier && (
            <div className={styles.fact}>
              <dt>{t("safety:badge.fact.verifier")}</dt>
              <dd>{badge.verifier}</dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}
