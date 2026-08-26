import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { communityPath } from "../../app/routeMap";
import { ReadingGroupJoinButton } from "./ReadingGroupJoinButton";
import {
  GENRE_BG,
  GENRE_FG,
  GENRE_LABEL_KEY,
  type Group,
} from "./readingGroups.data";
import styles from "./ReadingGroupsPage.module.css";

/** The format line's prefix key. `either` gets its own phrase rather than
 *  being rounded down to one side of an answer the member gave as both. */
const FORMAT_PREFIX_KEY: Record<Group["format"], string> = {
  irl: "community:readingGroups.card.formatPrefix.irl",
  online: "community:readingGroups.card.formatPrefix.online",
  either: "community:readingGroups.card.formatPrefix.either",
};

export function ReadingGroupCard({
  group,
  messagesPath,
  onWaitlist,
  waitlistPosition,
  isWaitlistEnabled = true,
}: {
  group: Group;
  /** Where the DEMO card's "Request to join" goes. The curated prototype
   *  groups carry no lister account, so the prototype points at the inbox; a
   *  live group has a real owner and uses `ReadingGroupJoinButton` instead. */
  messagesPath?: string;
  onWaitlist: () => void;
  /** The user's position on this group's waitlist, if they've joined. */
  waitlistPosition?: number;
  /** Whether the waitlist affordance is active. Waitlists have no backend yet,
   *  so live mode passes `false` and shows a disabled "not open" state instead
   *  of an active button that would fake a spot. */
  isWaitlistEnabled?: boolean;
}) {
  const { t } = useTranslation();
  const spotsClass =
    group.spots === 0
      ? styles.spotsFull
      : group.spots !== null && group.spots <= 1
        ? styles.spotsAlmost
        : styles.spotsOpen;
  const spotsText =
    group.spots === 0
      ? t("community:readingGroups.card.spots.full")
      : t("community:readingGroups.card.spots.left", {
          count: group.spots ?? 0,
        });
  const detailPath = group.communitySlug
    ? communityPath(group.communitySlug)
    : null;
  const formatClass =
    group.format === "online" ? styles.gmOnline : styles.gmIrl;

  return (
    <article className={styles.gc}>
      <div className={styles.gcBook}>
        <div
          className={styles.gcSpine}
          style={{ background: group.spineColor }}
        >
          {group.spine}
        </div>
        <div className={styles.gcBookInfo}>
          <div className={styles.gcBookTitle}>
            {detailPath ? (
              <Link to={detailPath}>{group.book}</Link>
            ) : (
              group.book
            )}
          </div>
          {group.author && (
            <div className={styles.gcBookAuthor}>{group.author}</div>
          )}
          {group.genre && (
            <span
              className={styles.gcGenre}
              style={{
                background: GENRE_BG[group.genre],
                color: GENRE_FG[group.genre],
              }}
            >
              {t(`community:${GENRE_LABEL_KEY[group.genre]}`)}
            </span>
          )}
        </div>
      </div>
      <div className={styles.gcBody}>
        {group.name && <div className={styles.gcName}>{group.name}</div>}
        {group.description && (
          <div className={styles.gcDesc}>{group.description}</div>
        )}
        <div className={styles.gcMeta}>
          <span className={[styles.gm, formatClass].join(" ")}>
            {t(FORMAT_PREFIX_KEY[group.format])}
            {group.where ?? ""}
          </span>
          {group.frequency && (
            <span className={styles.gm}>{group.frequency}</span>
          )}
          {group.language && (
            <span className={styles.gm}>{group.language}</span>
          )}
        </div>
      </div>
      <div className={styles.gcFoot}>
        {group.spots !== null ? (
          <span className={`${styles.gcSpots} ${spotsClass}`}>{spotsText}</span>
        ) : (
          // A live group states the roster it HAS. Spare seats would have to be
          // derived from a headcount nobody re-confirmed after the group
          // started, so the card shows the number it can stand behind.
          <span className={`${styles.gcSpots} ${styles.spotsOpen}`}>
            {t("community:readingGroups.card.members", {
              count: group.memberCount ?? 0,
            })}
          </span>
        )}
        {group.communitySlug ? (
          <ReadingGroupJoinButton
            slug={group.communitySlug}
            isJoined={group.isJoined ?? false}
          />
        ) : group.spots === 0 ? (
          waitlistPosition ? (
            <Button variant="ghost" size="sm" disabled>
              {t("community:readingGroups.card.onWaitlist", {
                position: waitlistPosition,
              })}
            </Button>
          ) : isWaitlistEnabled ? (
            <Button variant="ghost" size="sm" onClick={onWaitlist}>
              {t("community:readingGroups.card.joinWaitlistCta")}
            </Button>
          ) : (
            <Button variant="ghost" size="sm" disabled>
              {t("community:readingGroups.card.waitlistUnavailable")}
            </Button>
          )
        ) : messagesPath ? (
          <Button variant="ghost" size="sm" to={messagesPath}>
            {t("community:readingGroups.card.requestToJoinCta")}
          </Button>
        ) : (
          <Button variant="ghost" size="sm" disabled>
            {t("community:readingGroups.card.joinUnavailable")}
          </Button>
        )}
      </div>
    </article>
  );
}
