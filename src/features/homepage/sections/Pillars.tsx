import { type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Reveal } from "../../../shared/components/ui";
import { pillars, type Pillar } from "./Pillars.data";
import styles from "./Pillars.module.css";

function PillarTile({ pillar, index }: { pillar: Pillar; index: number }) {
  const lead =
    pillar.key === "community" && pillar.featured
      ? pillar.featured
      : pillar.desc;

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
        alt={pillar.alt}
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
              {pillar.name}
            </Link>
          </h3>
          <p className={styles.desc}>{lead}</p>
          <ul className={styles.tags}>
            {pillar.tags.map((tag) => (
              <li key={tag.label}>
                <Link className={styles.tag} to={tag.to}>
                  {tag.label}
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
  return (
    <section className={styles.pillars} id="pillars">
      <div className="wrap">
        <div className={styles.head}>
          <Reveal className={styles.eyebrow}>
            One membership · six worlds
          </Reveal>
          <Reveal as="h2" className={styles.title} delay={60}>
            A world, not a <em>feature list.</em>
          </Reveal>
          <Reveal as="p" className={styles.sub} delay={120}>
            Six pillars of queer professional life in Lisbon — each one built by
            and for the community, not bolted on afterwards.
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
