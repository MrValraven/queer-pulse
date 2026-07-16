import { type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { pillars, type Pillar } from "./Pillars.data";
import styles from "./Pillars.module.css";

function PillarTile({ pillar, index }: { pillar: Pillar; index: number }) {
  const { t } = useTranslation();
  const lead =
    pillar.key === "community" && pillar.featuredKey
      ? t(pillar.featuredKey)
      : t(pillar.descKey);

  return (
    <Reveal
      as="article"
      className={`${styles.tile} ${styles[pillar.key]}`}
      delay={index * 70}
      style={{ "--acc": pillar.accent } as CSSProperties}
    >
      <img
        className={styles.bg}
        src={pillar.image}
        alt={t(pillar.altKey)}
        loading="lazy"
      />
      <span className={styles.scrim} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.top}>
          <span className={styles.icon} aria-hidden="true">
            {pillar.icon}
          </span>
        </div>
        <div className={styles.body}>
          <h3 className={styles.name}>
            {/* Stretched link: the whole tile leads to the pillar's hub. */}
            <Link className={styles.nameLink} to={pillar.to}>
              {t(pillar.nameKey)}
            </Link>
          </h3>
          <p className={styles.desc}>{lead}</p>
          <ul className={styles.tags}>
            {pillar.tags.map((tag) => (
              <li key={tag.labelKey}>
                <Link className={styles.tag} to={tag.to}>
                  {t(tag.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Reveal>
  );
}

/**
 * "A world, not a feature list" — the six pillars of the platform as an
 * immersive photo bento, sitting just above the final CTA. Each tile is a
 * gateway: the whole card leads to that pillar's hub, and its tags link to the
 * sub-features within.
 */
export function Pillars() {
  const { t } = useTranslation();

  return (
    <section className={styles.pillars} id="pillars">
      <div className="wrap">
        <div className={styles.head}>
          <Reveal className={styles.eyebrow}>
            {t("homepage:pillars.eyebrow")}
          </Reveal>
          <Reveal as="h2" className={styles.title} delay={60}>
            <Translation
              i18nKey="homepage:pillars.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.sub} delay={120}>
            {t("homepage:pillars.sub")}
          </Reveal>
        </div>

        <div className={styles.bento}>
          {pillars.map((pillar, index) => (
            <PillarTile key={pillar.key} pillar={pillar} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
