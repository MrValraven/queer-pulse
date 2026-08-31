import { FiCornerDownRight } from "react-icons/fi";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { Filmmaker } from "./cinemaFilmmaker.data";
import styles from "./CinemaFilmmakerPage.module.css";

interface FilmmakerHeroProps {
  filmmaker: Filmmaker;
  /** Scrolls the page to the tip jar in the aside. */
  onTip: () => void;
}

export function FilmmakerHero({ filmmaker, onTip }: FilmmakerHeroProps) {
  const { t } = useTranslation();
  return (
    <section className={styles.hero}>
      <div className={`wrap ${styles.heroInner}`}>
        <div className={styles.photoCol}>
          <div className={styles.photo}>
            <ImageSlot
              src={filmmaker.portrait}
              alt={`${filmmaker.namePre}${filmmaker.nameEm}`}
              tint="plum"
              width="100%"
              height="100%"
              radius={22}
              placeholder={t("cinema:slot.filmmakerPortrait")}
              style={{ position: "absolute", inset: 0 }}
              loading="eager"
              fetchPriority="high"
            />
          </div>

          <div className={styles.statStrip}>
            {filmmaker.stats.map((s) => (
              <div key={s.k} className={styles.stat}>
                <div className="k">{s.k}</div>
                <div className="v">{s.v}</div>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <Button variant="primary" onClick={onTip}>
              <FiCornerDownRight aria-hidden />
              {t("cinema:filmmaker.hero.tipCta", { name: filmmaker.nameEm })}
            </Button>
            <Button variant="ghost" to={routes.studioCalls}>
              {t("cinema:filmmaker.hero.requestScreeningCta")}
            </Button>
            <Button variant="ghost" to={routes.members}>
              {t("cinema:filmmaker.hero.connectCta")}
            </Button>
          </div>
        </div>

        <div>
          <div className={styles.kicker}>
            {filmmaker.kicker.map((k, i) => (
              <span key={k.label} className={styles.kickerGroup}>
                {i > 0 && <span className={styles.dot} />}
                <span className={k.jade ? styles.jade : undefined}>
                  {k.label}
                </span>
              </span>
            ))}
          </div>
          <h1 className={styles.name}>
            {filmmaker.namePre}
            <em>{filmmaker.nameEm}</em>
          </h1>
          <div className={styles.pron}>{filmmaker.pronouns}</div>
          <div className={styles.identity}>
            {filmmaker.identity.map((id) => (
              <span
                key={id.label}
                className={id.member ? styles.member : undefined}
              >
                {id.label}
              </span>
            ))}
          </div>
          <p className={styles.bio}>{filmmaker.bio}</p>
          <div className={styles.statement}>
            <p>“{filmmaker.statement}”</p>
            <span className="who">{filmmaker.statementWho}</span>
          </div>
          <div className={styles.links}>
            {filmmaker.links.map((l) => (
              <Button key={l.label} variant="ghost" to={l.to}>
                {l.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
