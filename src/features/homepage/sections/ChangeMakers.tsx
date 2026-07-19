import { Link } from "react-router-dom";
import { Button, ImageSlot, Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { changemakers } from "../data/changemakers";
import styles from "./ChangeMakers.module.css";

export function ChangeMakers() {
  const { t } = useTranslation();

  return (
    <section className={styles.section} id="changemakers">
      <div className="wrap">
        <div className={styles.top}>
          <div className={styles.topText}>
            <Reveal className={styles.eyebrow}>
              {t("homepage:changeMakers.eyebrow")}
            </Reveal>
            <Reveal as="h2" className={styles.title} delay={60}>
              <Translation
                i18nKey="homepage:changeMakers.title"
                components={{ em: <em /> }}
              />
            </Reveal>
            <Reveal as="p" className={styles.sub} delay={90}>
              {t("homepage:changeMakers.sub")}
            </Reveal>
          </div>
          <div className={styles.aside}>
            <Reveal delay={60}>
              <Button variant="ghost-dark" to={routes.changemakers}>
                {t("homepage:changeMakers.cta")}
              </Button>
            </Reveal>
          </div>
        </div>

        <div className={styles.grid}>
          {changemakers.map((person, index) => (
            <Reveal key={person.key} delay={index * 70}>
              <Link
                to={`${routes.changemakers}#${person.key}`}
                className={styles.card}
              >
                <ImageSlot
                  tint={person.tint}
                  src={person.image}
                  height={240}
                  radius={0}
                  placeholder={t("homepage:changeMakers.portraitPlaceholder", {
                    name: person.name,
                  })}
                />
                <div className={styles.body}>
                  <div className={styles.cause}>{person.cause}</div>
                  <div className={styles.name}>{person.name}</div>
                  <p className={styles.blurb}>{person.blurb}</p>
                  <div className={styles.tags}>
                    {person.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
