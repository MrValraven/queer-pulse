import { Reveal } from '../../../shared/components/ui'
import styles from './Manifesto.module.css'

export function Manifesto() {
  return (
    <section className={styles.manifesto} id="about">
      <div className="wrap">
        <Reveal className={styles.label}>What this is</Reveal>
        <Reveal as="p" className={styles.lead} delay={60}>
          We're not building a platform. We're keeping a <em>room</em> — warm,
          vouched-for, and unmistakably ours.
        </Reveal>
        <Reveal as="p" className={styles.sign} delay={120}>
          QueerPulse is for the designers, engineers, chefs, filmmakers and carers
          who make Lisbon what it is. You won't find leaderboards or endorsements
          here. You'll find people, their work, and a way to reach them when it
          matters.
        </Reveal>
      </div>
    </section>
  )
}
