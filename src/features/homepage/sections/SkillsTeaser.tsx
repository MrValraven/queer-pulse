import { Button, Reveal, SectionHead } from "../../../shared/components/ui";
import { routes } from "../../../app/routeMap";
import { skills } from "../data/skills";
import styles from "./SkillsTeaser.module.css";

export function SkillsTeaser() {
  return (
    <section className={styles.section} id="skills">
      <div className="wrap">
        <Reveal>
          <SectionHead
            dark
            title={
              <>
                Learn from people <em>doing the work.</em>
              </>
            }
            subtitle="Members teaching what they know. No course fees, no certificates, no imposter syndrome required."
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
                {skill.type === "teaching" ? "Teaching" : "Learning"}
              </span>
              <h4 className={styles.title}>{skill.title}</h4>
              <div className={styles.by}>{skill.by}</div>
            </div>
          ))}
        </Reveal>

        <Reveal className={styles.cta}>
          <Button variant="ghost-dark" size="lg" to={routes.skills}>
            Browse all skills &amp; learning →
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
