import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { WHO_ITS_FOR_TILES, type WhoItsForTile } from "./whoItsFor.data";
import styles from "./WhoItsFor.module.css";

function WhoItsForCard({ tile }: { tile: WhoItsForTile }) {
  const { t } = useTranslation();
  return (
    <Link
      to={tile.to}
      className={styles.tile}
      data-tile={tile.tileId}
      data-testid={`who-its-for-${tile.tileId}`}
    >
      <span className={styles.art} aria-hidden />

      <h3 className={styles.tileTitle}>{t(tile.titleKey)}</h3>
      <p className={styles.tileBody}>{t(tile.bodyKey)}</p>
      <span className={styles.tileLink}>
        {t(tile.linkKey)}
        <FiArrowRight aria-hidden />
      </span>
    </Link>
  );
}

/**
 * "Who it's for": four tiles that link to the unlisted audience pages
 * (`/for/businesses`, `/for/communities`, `/for/performers`,
 * `/for/practitioners`). Identical in demo and live. Each tile's art is a
 * small miniature of its page's motif (awning, taped poster, marquee bulbs,
 * ruled paper) drawn in CSS from tokens, never a product component, so the
 * prerendered homepage chunk gains no feature trees.
 */
export function WhoItsFor() {
  const { t } = useTranslation();
  return (
    <section className={styles.strip} aria-labelledby="who-its-for-heading">
      <div className="wrap">
        <Reveal className={styles.head}>
          <span className={styles.eyebrow}>
            {t("homepage:whoItsFor.eyebrow")}
          </span>
          <h2 id="who-its-for-heading" className={styles.title}>
            <Translation
              i18nKey="homepage:whoItsFor.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.lede}>{t("homepage:whoItsFor.lede")}</p>
        </Reveal>
        <div className={styles.grid}>
          {WHO_ITS_FOR_TILES.map((tile, index) => (
            <Reveal
              key={tile.tileId}
              delay={index * 70}
              className={styles.cell}
            >
              <WhoItsForCard tile={tile} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
