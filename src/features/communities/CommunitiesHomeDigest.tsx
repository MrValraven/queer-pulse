import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CommunitiesHomePage.module.css";

export interface HubDigest {
  posts: number;
  /**
   * Demo only. `GET /me/communities/digest` counts new posts, new members and
   * upcoming events, and carries no active-member figure, so the live band
   * leaves this undefined and drops the tile. A tile reading 0 would be a
   * measurement nobody took.
   */
  active?: number;
  events: number;
  joined: number;
}

/** The quiet "this week" band on the "My communities" tab, sitting between
 *  the category chips and the grid: label, the counts, and a note saying the
 *  band is the whole notification and nothing here pings you.
 *
 *  The band lays itself out by its own width (the frame is an inline-size
 *  container), because the filters sidebar narrows the results column
 *  independently of the viewport: one row when wide, label and note around a
 *  single row of counts when medium, the counts in an even grid when narrow. */
export function CommunitiesHomeDigest({ digest }: { digest: HubDigest }) {
  const { t } = useTranslation();
  const tiles = [
    { count: digest.posts, labelKey: "communities:hub.digest.posts" },
    ...(digest.active === undefined
      ? []
      : [{ count: digest.active, labelKey: "communities:hub.digest.active" }]),
    { count: digest.events, labelKey: "communities:hub.digest.events" },
    { count: digest.joined, labelKey: "communities:hub.digest.joined" },
  ];
  return (
    <div className={styles.digestFrame}>
      <div className={styles.digest}>
        <div className={styles.digestLbl}>
          {t("communities:hub.digest.label")}
        </div>
        <div
          className={[
            styles.digestTiles,
            tiles.length === 3 && styles.digestTilesThree,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {tiles.map((tile) => (
            <div key={tile.labelKey} className={styles.tile}>
              <div className={styles.tileNum}>{tile.count}</div>
              <div className={styles.tileLbl}>{t(tile.labelKey)}</div>
            </div>
          ))}
        </div>
        <p className={styles.digestNote}>{t("communities:hub.digest.note")}</p>
      </div>
    </div>
  );
}
