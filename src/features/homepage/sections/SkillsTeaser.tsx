import { Button, Reveal, SectionHead } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { skills } from "../data/skills";
import styles from "./SkillsTeaser.module.css";

export function SkillsTeaser() {
  const { t } = useTranslation();

  return (
    <section className={styles.section} id="skills">
      <div className="wrap">
        <Reveal>
          <SectionHead
            dark
            title={
              <Translation
                i18nKey="homepage:skillsTeaser.title"
                components={{ em: <em /> }}
              />
            }
            subtitle={t("homepage:skillsTeaser.subtitle")}
          />
        </Reveal>

        <Reveal className={styles.strip}>
          {skills.map((skill) => (
            <div key={skill.title} className={styles.item}>
              <span
                className={[
                  styles.type,
                  skill.type === "teaching" ? styles.teaching : styles.learning,
                ].join(" ")}
              >
                {skill.type === "teaching"
                  ? t("homepage:skillsTeaser.teachingLabel")
                  : t("homepage:skillsTeaser.learningLabel")}
              </span>
              <h4 className={styles.title}>{skill.title}</h4>
              <div className={styles.by}>{skill.by}</div>
            </div>
          ))}
        </Reveal>

        <Reveal className={styles.cta}>
          <Button variant="ghost-dark" size="lg" to={routes.skills}>
            {t("homepage:skillsTeaser.browseAllCta")}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
