import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { HERO_STATS } from "./studioPage.data";
import styles from "./studio.module.css";

/** Demo only: the listening stats and the pay pill the old hero carried. */
export function StudioHomeHeroShowcase({ artistName }: { artistName: string }) {
  const { t } = useTranslation();
  const formatters = useFormat();
  return (
    <>
      <div className={styles.stats}>
        <span>
          <Translation
            i18nKey="studio:room.hero.listening"
            components={{ em: <em /> }}
            values={{ count: HERO_STATS.listeningNow }}
          />
        </span>
        <span className={styles.dot} />
        <span>{HERO_STATS.audioFormat}</span>
      </div>
      <div className={styles.payPill}>
        <span>
          <Translation
            i18nKey="studio:room.hero.payNote"
            components={{ em: <em /> }}
            values={{
              artist: artistName,
              amount: formatters.currency(HERO_STATS.perPlayAmount),
            }}
          />{" "}
          <span className={styles.small}>{t("studio:room.hero.tipOnTop")}</span>
        </span>
      </div>
    </>
  );
}
