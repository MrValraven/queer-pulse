import { Button, Reveal } from "../../../shared/components/ui";
import { routes } from "../../../app/routeMap";
import { manifestoAssurances } from "./Manifesto.data";
import styles from "./Manifesto.module.css";

export function Manifesto() {
  return (
    <section className={styles.manifesto} id="about">
      <div className="wrap">
        <div className={styles.grid}>
          <div className={styles.intro}>
            <Reveal className={styles.label}>What this is</Reveal>
            <Reveal as="h2" className={styles.lead} delay={60}>
              We're not building a platform. We're keeping a <em>room.</em>
            </Reveal>
            <Reveal as="p" className={styles.body} delay={120}>
              A room has a door — and someone you trust at it. Everyone here was
              introduced by a member who believed you belonged. That's not a
              growth hack. That's how trust actually works.
            </Reveal>
            <Reveal as="p" className={styles.body} delay={160}>
              It means the people you meet here are vouched for. It means
              conversations are encrypted. It means the moderators are real
              people who respond within 24 hours, every time.
            </Reveal>
            <Reveal className={styles.actions} delay={220}>
              <Button variant="ghost-dark" to={routes.safety}>
                How we keep it safe →
              </Button>
            </Reveal>
          </div>

          <ul className={styles.assurances}>
            {manifestoAssurances.map((item, index) => (
              <Reveal
                as="li"
                key={item.title}
                className={styles.assurance}
                delay={index * 70}
              >
                <span className={styles.icon} aria-hidden>
                  {item.icon}
                </span>
                <div className={styles.copy}>
                  <div className={styles.name}>{item.title}</div>
                  <p className={styles.desc}>{item.description}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
