import { Link } from "react-router-dom";
import { GENRE_BG, GENRE_FG, type Group } from "./readingGroups.data";
import styles from "./ReadingGroupsPage.module.css";

export function ReadingGroupCard({
  g,
  messagesPath,
  onWaitlist,
  waitlistPosition,
}: {
  g: Group;
  messagesPath: string;
  onWaitlist: () => void;
  /** The user's position on this group's waitlist, if they've joined. */
  waitlistPosition?: number;
}) {
  const spotsClass =
    g.spots === 0
      ? styles.spotsFull
      : g.spots <= 1
        ? styles.spotsAlmost
        : styles.spotsOpen;
  const spotsText =
    g.spots === 0 ? "Full" : `${g.spots} spot${g.spots !== 1 ? "s" : ""} left`;

  return (
    <article className={styles.gc}>
      <div className={styles.gcBook}>
        <div className={styles.gcSpine} style={{ background: g.spineColor }}>
          {g.spine}
        </div>
        <div className={styles.gcBookInfo}>
          <div className={styles.gcBookTitle}>{g.book}</div>
          <div className={styles.gcBookAuthor}>{g.author}</div>
          <span
            className={styles.gcGenre}
            style={{ background: GENRE_BG[g.genre], color: GENRE_FG[g.genre] }}
          >
            {g.genre}
          </span>
        </div>
      </div>
      <div className={styles.gcBody}>
        <div className={styles.gcName}>{g.name}</div>
        <div className={styles.gcDesc}>{g.desc}</div>
        <div className={styles.gcMeta}>
          <span
            className={[
              styles.gm,
              g.format === "irl" ? styles.gmIrl : styles.gmOnline,
            ].join(" ")}
          >
            {g.format === "irl" ? "In person · " : "Online · "}
            {g.where}
          </span>
          <span className={styles.gm}>{g.frequency}</span>
          <span className={styles.gm}>{g.lang}</span>
        </div>
      </div>
      <div className={styles.gcFoot}>
        <span className={`${styles.gcSpots} ${spotsClass}`}>{spotsText}</span>
        {g.spots === 0 ? (
          waitlistPosition ? (
            <span
              className={`${styles.gcJoin} ${styles.gcJoinDisabled}`}
              aria-disabled="true"
            >
              On waitlist · #{waitlistPosition}
            </span>
          ) : (
            <button
              type="button"
              className={styles.gcJoin}
              onClick={onWaitlist}
            >
              Join waitlist
            </button>
          )
        ) : (
          <Link to={messagesPath} className={styles.gcJoin}>
            Request to join
          </Link>
        )}
      </div>
    </article>
  );
}
