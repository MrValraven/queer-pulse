import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CommunitiesHomePage.module.css";

export interface HubDigest {
  posts: number;
  active: number;
  events: number;
  joined: number;
}

/** The quiet "this week" band on the "My communities" tab, sitting between
 *  the category chips and the grid: label, four counts, and a note saying the
 *  band is the whole notification — nothing here pings you. */
export function CommunitiesHomeDigest({ digest }: { digest: HubDigest }) {
  const { t } = useTranslation();
  const tiles = [
    { count: digest.posts, labelKey: "communities:hub.digest.posts" },
    { count: digest.active, labelKey: "communities:hub.digest.active" },
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
