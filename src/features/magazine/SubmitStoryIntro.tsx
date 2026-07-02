import { Reveal } from "../../shared/components/ui";
import { LOOKING_FOR, STEPS } from "./submitStory.data";
import styles from "./SubmitStoryPage.module.css";

export function SubmitStoryIntro() {
  return (
    <div>
      <Reveal className={styles.eyebrow}>Pitch a story</Reveal>
      <Reveal as="h1" className={styles.title} delay={60}>
        Got something <em>worth telling?</em>
      </Reveal>
      <Reveal as="p" className={styles.lead} delay={120}>
        The QueerPulse magazine is written by the community. You don't need a
        byline or an agent — just a story that matters and an honest way of
        telling it.
      </Reveal>

      <div className={styles.looking}>
        {LOOKING_FOR.map((item, index) => (
          <Reveal key={item.title} className={styles.look} delay={index * 50}>
            <span className={styles.lookIcon}>
              <item.icon />
            </span>
            <div>
              <div className={styles.lookTitle}>{item.title}</div>
              <div className={styles.lookBody}>{item.body}</div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className={styles.steps}>
        <div className={styles.stepsH}>What happens next</div>
        {STEPS.map((step) => (
          <div key={step} className={styles.step}>
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
