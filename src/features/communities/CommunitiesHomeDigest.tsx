import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CommunitiesHomePage.module.css";

export interface HubDigest {
  posts: number;
  active: number;
  events: number;
  joined: number;
}

/** The quiet "this week" tile row at the top of the communities hub. */
export function CommunitiesHomeDigest({ digest }: { digest: HubDigest }) {
  const { t } = useTranslation();
  const tiles = [
    { num: digest.posts, labelKey: "communities:hub.digest.posts" },
    { num: digest.active, labelKey: "communities:hub.digest.active" },
    { num: digest.events, labelKey: "communities:hub.digest.events" },
    { num: digest.joined, labelKey: "communities:hub.digest.joined" },
  ];
  return (
    <div className={styles.digest}>
      <div className={styles.digestSide}>
        <div className={styles.digestLbl}>
          {t("communities:hub.digest.label")}
        </div>
        <p className={styles.digestNote}>{t("communities:hub.digest.note")}</p>
      </div>
      <div className={styles.digestTiles}>
        {tiles.map((tile) => (
          <div key={tile.labelKey} className={styles.tile}>
            <div className={styles.tileNum}>{tile.num}</div>
            <div className={styles.tileLbl}>{t(tile.labelKey)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
