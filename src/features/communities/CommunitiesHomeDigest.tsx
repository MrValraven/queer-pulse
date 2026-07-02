import styles from "./CommunitiesHomePage.module.css";

export interface HubDigest {
  posts: number;
  active: number;
  events: number;
  joined: number;
}

/** The quiet "this week" tile row at the top of the communities hub. */
export function CommunitiesHomeDigest({ digest }: { digest: HubDigest }) {
  const tiles = [
    { num: digest.posts, label: "new posts" },
    { num: digest.active, label: "active members" },
    { num: digest.events, label: "upcoming events" },
    { num: digest.joined, label: "people joined" },
  ];
  return (
    <div className={styles.digest}>
      <div className={styles.digestSide}>
        <div className={styles.digestLbl}>This week, quietly</div>
        <p className={styles.digestNote}>
          No pings — just your communities' week in one glance.
        </p>
      </div>
      <div className={styles.digestTiles}>
        {tiles.map((t) => (
          <div key={t.label} className={styles.tile}>
            <div className={styles.tileNum}>{t.num}</div>
            <div className={styles.tileLbl}>{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
