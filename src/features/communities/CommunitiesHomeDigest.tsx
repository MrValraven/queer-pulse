import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CommunitiesHomePage.module.css";

export interface HubDigest {
  posts: number;
  /**
   * Demo only. `GET /me/communities/digest` counts new posts, new members and
   * upcoming gatherings, and carries no active-member figure, so the live band
   * leaves this undefined and drops the tile. A tile reading 0 would be a
   * measurement nobody took.
   */
  active?: number;
  events: number;
  joined: number;
}

/** The quiet "this week" band on the "My communities" tab, sitting between
 *  the category chips and the grid: label, the counts, and a note saying the
 *  band is the whole notification — nothing here pings you. */
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
    <div className={styles.digest}>
      <div className={styles.digestLbl}>
        {t("communities:hub.digest.label")}
      </div>
      <div className={styles.digestTiles}>
        {tiles.map((tile) => (
          <div key={tile.labelKey} className={styles.tile}>
            <div className={styles.tileNum}>{tile.count}</div>
            <div className={styles.tileLbl}>{t(tile.labelKey)}</div>
          </div>
        ))}
      </div>
      <p className={styles.digestNote}>{t("communities:hub.digest.note")}</p>
    </div>
  );
}
