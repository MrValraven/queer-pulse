import type { ReactNode } from "react";
import { FiLink, FiUsers } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromName } from "../../shared/lib/initials";
import { estimateDraftReadiness } from "./subprofileDraftReadiness";
import { LINK_BADGE, splitByProfileVisibility } from "./mySubprofiles.data";
import {
  accentTintStyle,
  AVAILABILITY_OPTIONS,
  AVAILABILITY_PILL_TONE,
  DEFAULT_ACCENT,
} from "./subprofilePresence.data";
import type { SubprofileView } from "./api/subprofiles.adapters";
import styles from "./SideRow.module.css";

interface SideRowProps {
  view: SubprofileView;
  /** The row's trailing actions: `SideCardFooter variant="row"` on the owner
   *  dashboard, or the not-shown reason and its link in the not-shown group.
   *  Supplied by the caller for the same reason `SideCard` takes its footer:
   *  those actions depend on hook lookups this presenter stays free of. */
  footer: ReactNode;
  /** Optional controls at the very start of the row (the reorder grip,
   *  position and Move earlier / Move later arrows). Nothing renders when
   *  absent, so the avatar starts flush with the row's edge. */
  leading?: ReactNode;
}

/** `.chip` tone per availability state, from the same map the card's pills use. */
const CHIP_TONE = {
  jade: styles.chipJade,
  coral: styles.chipCoral,
  muted: undefined,
} as const;

/**
 * One persona on the owner dashboard's List view: the same data `SideCard`
 * shows, set on a fixed column grid so every row lines up with the ones above
 * and below it. Left to right: `leading`, the accent-ringed avatar, the
 * identity (the name with its status and quiet chips, the tagline under it),
 * the stats column, then `footer`.
 *
 * Every column except the identity has a fixed width, which is what keeps the
 * avatars, numbers and actions on one vertical line down the list whatever the
 * name or the chips say. The identity keeps a real minimum and gives up its
 * ellipsis first. The article is its own size container, so the grid reflows
 * by the ROW's width: stats tuck under the name on a mid-width row, and the
 * leading and footer share a bottom bar on a narrow one.
 *
 * A row in the on-profile group is live and linked by definition (that is
 * what puts it there), so it shows neither: only a state the member can act
 * on earns a chip. A not-shown row states both, since they are the reason.
 *
 * A pure consumer of the owner `SubprofileView`, like `SideCard`: no data
 * fetching and no demo/live branching of its own.
 */
export function SideRow({ view, footer, leading }: SideRowProps) {
  const { t } = useTranslation();
  const accent = view.accent ?? DEFAULT_ACCENT;
  const isDraft = view.status === "draft";
  const hasLeading = Boolean(leading);
  // The same test that sorted this persona into its group, so the row and the
  // group heading above it can never disagree about where it is.
  const isOnProfile =
    splitByProfileVisibility([view]).shownOnProfile.length > 0;
  const tie = LINK_BADGE[view.linkVisibility];
  const availability = view.availability
    ? AVAILABILITY_OPTIONS.find((option) => option.value === view.availability)
    : undefined;
  const hasChips =
    !isOnProfile || Boolean(availability) || view.memberCount > 1;

  const rowClassName = [styles.row, isDraft && styles.draft]
    .filter(Boolean)
    .join(" ");
  const layoutClassName = [styles.layout, hasLeading && styles.withLeading]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={rowClassName} style={accentTintStyle(accent)}>
      <div className={layoutClassName}>
        {hasLeading && <div className={styles.leading}>{leading}</div>}

        <span className={styles.avatarRing}>
          <Avatar
            initials={initialsFromName(view.displayName, "?")}
            src={view.avatarUrl ?? undefined}
            tint="plum"
            size={44}
          />
        </span>

        <div className={styles.identity}>
          <div className={styles.nameLine}>
            <h3 className={styles.name}>
              {view.displayName || t("subprofiles:mine.untitled")}
            </h3>
            {!isOnProfile && (
              <span
                className={isDraft ? styles.statusDraft : styles.statusLive}
              >
                <span className={styles.statusDot} aria-hidden />
                {isDraft
                  ? t("subprofiles:status.draft")
                  : t("subprofiles:side.statusLive")}
              </span>
            )}
            {hasChips && (
              <span className={styles.chips}>
                {!isOnProfile && (
                  <span className={styles.chip}>
                    <FiLink aria-hidden />
                    {t(tie.labelKey)}
                  </span>
                )}
                {availability && (
                  <span
                    className={[
                      styles.chip,
                      CHIP_TONE[AVAILABILITY_PILL_TONE[availability.value]],
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span className={styles.chipDot} aria-hidden />
                    {t(availability.labelKey)}
                  </span>
                )}
                {view.memberCount > 1 && (
                  <span className={styles.chip}>
                    <FiUsers aria-hidden />
                    {t("subprofiles:side.coOwners", {
                      count: view.memberCount,
                    })}
                  </span>
                )}
              </span>
            )}
          </div>
          <p className={styles.tagline}>
            {view.tagline || t("subprofiles:side.noTagline")}
          </p>
        </div>

        <div className={styles.stats}>
          {isDraft ? (
            <RowReadiness view={view} />
          ) : (
            <>
              <RowStat
                count={view.endorsementCount}
                label={t("subprofiles:mine.stat.endorsements", {
                  count: view.endorsementCount,
                })}
              />
              <RowStat
                count={view.followerCount}
                label={t("subprofiles:mine.stat.followers", {
                  count: view.followerCount,
                })}
              />
            </>
          )}
        </div>

        <div className={styles.footer}>{footer}</div>
      </div>
    </article>
  );
}

/**
 * One number in the stats column, set as a figure over its label. The label
 * is its own plural key (`mine.stat.*`), so it agrees with the figure above
 * it ("1 endorsement", "2 seguidores"). A zero is dimmed so a new persona's
 * row does not shout two noughts.
 */
function RowStat({ count, label }: { count: number; label: string }) {
  return (
    <span
      className={
        count === 0 ? `${styles.stat} ${styles.statZero}` : styles.stat
      }
    >
      <span className={styles.statValue}>{count}</span>
      <span className={styles.statLabel}>{label}</span>
    </span>
  );
}

/**
 * A draft's stats slot: how much is left before it can go live, as one line
 * of text over a slim progress bar. The bar carries the percentage for
 * assistive tech; the line says it in words for everyone.
 */
function RowReadiness({ view }: { view: SubprofileView }) {
  const { t } = useTranslation();
  const { readyCount, totalCount } = estimateDraftReadiness(view);
  const percent =
    totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;
  const summary =
    readyCount >= totalCount
      ? t("subprofiles:side.readyToPublish")
      : t("subprofiles:side.thingsLeft", { count: totalCount - readyCount });

  return (
    <span className={styles.readiness}>
      <span className={styles.readinessText}>
        <span>{summary}</span>
        <span className={styles.readinessPercent} aria-hidden>
          {percent}%
        </span>
      </span>
      <span
        className={styles.readinessTrack}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={t("subprofiles:ring.ariaLabel", { pct: percent })}
      >
        <span
          className={styles.readinessFill}
          style={{ inlineSize: `${percent}%` }}
        />
      </span>
    </span>
  );
}
