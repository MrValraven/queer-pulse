import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { CREW } from './filmPage.data'
import styles from './FilmPage.module.css'

export function FilmBody() {
  const { showToast } = useToast()
  return (
    <section className={styles.body}>
      <div className={`wrap ${styles.bodyGrid}`}>
        <div>
          <div className={`${styles.block} ${styles.noteFull}`}>
            <div className={styles.nfHead}>
              <div className={styles.nfAv}>JR</div>
              <div>
                <div className={styles.nfName}>João Ribeiro</div>
                <div className={styles.nfRole}>Programming lead · curated for week 23</div>
              </div>
            </div>
            <div className={styles.nfBody}>
              <p>
                I first met Maria's footage three years before this film existed. She'd been recording
                the kitchens of her grandmother's friends — eleven older lesbian and gay women in
                Marvila and Beato — without a project, without funding, without knowing what she was
                looking for.
              </p>
              <p>
                The film that came out of those three years is patient in a way most queer documentary
                can't afford to be. There are <em>two whole minutes</em>, near minute 67, where the
                camera just stays on Dona Ilda's hands shelling broad beans.
              </p>
              <p>
                I'm programming this for week 23 because the cinema's first job is to make space for
                films that treat queer elders as <em>teachers</em>, not subjects. Stay for the second
                hour.
              </p>
            </div>
          </div>

          <div className={styles.block}>
            <h2>
              The film's own <em>words</em>
            </h2>
            <div className={styles.syn}>
              <p>
                For three years, between 2022 and 2025, the filmmaker followed eleven queer elders
                across two Lisbon neighbourhoods — Marvila and Beato — into the kitchens that had
                hosted their lives. <em>The light between rooms</em> is not a film about coming out. It
                is a film about what was already there, before anyone had the word for it.
              </p>
              <p className="source">— Director's statement, Cinemateca Portuguesa programme, March 2025.</p>
            </div>
          </div>

          <div className={styles.block}>
            <h2>
              Cast &amp; <em>crew</em>
            </h2>
            <div className={styles.ccGrid}>
              {CREW.map((person) => (
                <div key={person.name} className={styles.ccRow}>
                  <div className={[styles.ccAv, person.tone === 'coral' ? styles.coral : person.tone === 'jade' ? styles.jade : ''].filter(Boolean).join(' ')}>
                    {person.initials}
                  </div>
                  <div>
                    <div className={styles.ccName}>{person.name}</div>
                    <div className={styles.ccRole}>{person.role}</div>
                    <div className={styles.ccTags}>
                      {person.tags.map((t) => (
                        <span key={t} className={t === 'member' ? styles.member : undefined}>
                          {t === 'member' ? 'QueerPulse member' : t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.fmCard}>
            <div className={styles.fmHead}>
              <div className={styles.fmAv}>MV</div>
              <div>
                <div className={styles.fmName}>
                  Maria <em>Vasconcelos</em>
                </div>
                <div className={styles.fmRole}>Director · Lisbon</div>
              </div>
            </div>
            <div className={styles.fmBio}>
              Documentary filmmaker working in Marvila. Three years on this film; a decade on the
              relationships that made it possible. Shoots slow, listens slower.
            </div>
            <div className={styles.fmStats}>
              <div className={styles.fmStat}>
                <span className="n"><em>3</em></span>
                films on the cinema
              </div>
              <div className={styles.fmStat}>
                <span className="n">€<em>4.2k</em></span>
                earned here
              </div>
            </div>
            <div className={styles.fmActions}>
              <Button to="/profile">View profile</Button>
              <Button variant="ghost" onClick={() => showToast('Following Maria', 'success')}>
                Follow filmmaker
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
