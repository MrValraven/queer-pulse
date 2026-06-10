import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import styles from './HostPage.module.css'

const HERO_TYPES = ['Supper club', 'Studio visit', 'Skills workshop', 'Film screening', 'Morning walk', 'Book club', 'Open studio']

const TYPE_CARDS = [
  { icon: '🍽️', title: 'Supper club', body: 'Intimate, hosted in your home or borrowed kitchen. 8–14 people. The model Tomás uses — and it works because it\'s personal.' },
  { icon: '🎨', title: 'Studio visit', body: 'Open your workspace to people who\'d genuinely want to see it. Low logistics, high value. Works especially well for makers.' },
  { icon: '📚', title: 'Skills session', body: 'Teach something you know. An hour of practical knowledge shared is worth more than most workshops that cost money.' },
  { icon: '🎬', title: 'Screening or talk', body: 'A film, a documentary, a conversation with someone interesting. A projector and a living room is enough.' },
]

const SPACES = [
  { hood: 'Mouraria', name: 'Casa da Mariquinhas', note: 'Kitchen + dining room · up to 20' },
  { hood: 'Príncipe Real', name: 'Atelier Pulso', note: 'Studio · up to 15 · member-run' },
  { hood: 'Marvila', name: 'Fábrica Nuno Gama', note: 'Warehouse · up to 50 · events only' },
]

export function HostPage() {
  const { showToast } = useToast()

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>For members</div>
          <h1 className={styles.title}>
            Host a gathering <em>for your people.</em>
          </h1>
          <p className={styles.lede}>
            You don't need a venue budget, a committee, or a plan. You need a date, a few chairs,
            and something worth gathering for. This guide walks you through the rest.
          </p>
          <div className={styles.heroTypes}>
            {HERO_TYPES.map((type) => (
              <span key={type} className={styles.htype}>
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.grid}>
            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepNum}>1</div>
                <div className={styles.stepContent}>
                  <h2>
                    Decide what kind of <em>gathering</em> you want
                  </h2>
                  <p>
                    The format shapes everything else. A dinner for eight is a completely different
                    project from a workshop for thirty. Start with what you're actually good at and
                    what feels manageable without help.
                  </p>
                  <div className={styles.typesGrid}>
                    {TYPE_CARDS.map((card) => (
                      <div key={card.title} className={styles.typeCard}>
                        <div className={styles.tcIcon}>{card.icon}</div>
                        <h4>{card.title}</h4>
                        <p>{card.body}</p>
                      </div>
                    ))}
                  </div>
                  <div className={styles.tip}>
                    <div className={styles.tipHead}>Start smaller than you think</div>
                    <p>
                      Every experienced host will tell you the same thing: your first event should
                      be half the size you're imagining. Six people is plenty. Get the format right,
                      then scale.
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNum}>2</div>
                <div className={styles.stepContent}>
                  <h2>
                    Find the <em>right space</em>
                  </h2>
                  <p>
                    Your home is usually the best option for small gatherings — it's free, flexible,
                    and signals that this is a community event, not a commercial one. For larger
                    events, the network has access to several partner spaces across the city.
                  </p>
                  <ul className={styles.list}>
                    <li>
                      <b>Under 12 people:</b> home or studio is ideal. Ask the board if you need a
                      kitchen or a projector you don't have.
                    </li>
                    <li>
                      <b>12–30 people:</b> partner spaces in Mouraria, Príncipe Real, and Marvila.
                      Post on the board asking for leads.
                    </li>
                    <li>
                      <b>Over 30:</b> talk to us first. We can help connect you with spaces and
                      potentially co-host.
                    </li>
                  </ul>
                  <div className={styles.tip}>
                    <div className={styles.tipHead}>Post on the board</div>
                    <p>
                      If you're looking for a space, post it as an Ask. Members regularly offer their
                      studios, kitchens, and rooftops for community events.
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNum}>3</div>
                <div className={styles.stepContent}>
                  <h2>
                    Invite people <em>thoughtfully</em>
                  </h2>
                  <p>
                    Gatherings work because the room is curated, not because it's large. Think about
                    who you're inviting and why — not "who do I owe" but "who would get something
                    from being in this room together."
                  </p>
                  <ul className={styles.list}>
                    <li>Be clear about what the event is, how long, and what people should bring or expect.</li>
                    <li>Share the location only with confirmed attendees — not in the public listing.</li>
                    <li>Set a realistic cap and stick to it. Turning people away is fine. Overcrowding isn't.</li>
                  </ul>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNum}>4</div>
                <div className={styles.stepContent}>
                  <h2>
                    On the <em>day</em>
                  </h2>
                  <p>
                    The most important thing is not the logistics — it's the atmosphere when people
                    arrive. The first ten minutes determine whether someone feels welcome or like
                    they've walked into the wrong room.
                  </p>
                  <ul className={styles.list}>
                    <li>Greet people at the door. Introduce people to each other by name and with a reason.</li>
                    <li>Have something for people to do or hold in the first five minutes.</li>
                    <li>Don't try to manage the conversation too much. Open the room; don't run a panel.</li>
                  </ul>
                  <div className={styles.tip}>
                    <div className={styles.tipHead}>On safety at gatherings</div>
                    <p>
                      If you're hosting at your home, you have the right to ask anyone to leave at any
                      time, for any reason. The QueerPulse Code of Care applies.
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.step}>
                <div className={`${styles.stepNum} ${styles.stepNumDone}`}>✓</div>
                <div className={styles.stepContent}>
                  <h2>
                    After it's <em>over</em>
                  </h2>
                  <p>
                    Write a brief note on the gathering listing — what happened, how it went. This
                    helps people who couldn't make it and gives future hosts a sense of what works.
                  </p>
                  <p>
                    If you want to make it recurring, list it on the QueerPulse gatherings board.
                    We'll help you find attendees and build the kind of trusted event that becomes a
                    fixture in the community's calendar.
                  </p>
                  <Button to="/contact">Tell us how it went →</Button>
                </div>
              </div>
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.sidebarCard}>
                <h3>Ready to list your gathering?</h3>
                <p>
                  Once you have a date, a format, and a rough idea of who you're inviting, you can
                  list it on the QueerPulse gatherings page.
                </p>
                <Button
                  className={styles.fullBtn}
                  onClick={() => showToast('Gathering builder coming soon', 'info')}
                >
                  Create your gathering →
                </Button>
              </div>
              <div className={styles.sidebarCard}>
                <h3>Partner spaces</h3>
                <p>Spaces that have hosted QueerPulse gatherings and are open to hosting more.</p>
                <div className={styles.spaceList}>
                  {SPACES.map((space) => (
                    <div key={space.name} className={styles.spaceRow}>
                      <div className={styles.spaceHood}>{space.hood}</div>
                      <div className={styles.spaceName}>{space.name}</div>
                      <div className={styles.spaceNote}>{space.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
