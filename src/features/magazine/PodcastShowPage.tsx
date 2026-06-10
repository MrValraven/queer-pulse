import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import styles from "./PodcastShowPage.module.css";
import { Button } from '../../shared/components/ui'

const EPISODE = linkToPath("QueerPulse Audio Player.html");
const MEMBER = linkToPath("QueerPulse Profile.html");
const NEWSLETTER = linkToPath("QueerPulse Newsletter.html");
const CONTACT = linkToPath("QueerPulse Contact.html");

const PlayIcon = () => (
  <svg viewBox="0 0 24 24">
    <polygon points="6 4 20 12 6 20" />
  </svg>
);

const PLATFORMS = [
  { name: "Spotify", color: "#1DB954" },
  { name: "Apple Podcasts", color: "#A050F6" },
  { name: "Overcast", color: "#FF6600" },
  { name: "Pocket Casts", color: "#FFCB14" },
  { name: "RSS", color: "linear-gradient(135deg,#5856d6,#ff6b6b)" },
];

interface Episode {
  num: string;
  numEm: string;
  title: React.ReactNode;
  desc: string;
  meta: React.ReactNode;
  duration: string;
}
const EPISODES: Episode[] = [
  { num: "3", numEm: "3", title: <><a href="#">A nurse, twenty years <em>in a hospital corridor.</em></a></>, desc: "What's changed in two decades on the ward, told over three cups of coffee. Plus: the moment she came out at work.", meta: <><span>Aired <b>23 May 2026</b></span><span>Guest: <b>Helena Costa</b></span></>, duration: "47 MIN" },
  { num: "3", numEm: "2", title: <><a href="#">Rui, the pharmacist who fills <em>every prescription.</em></a></>, desc: "A conversation with the man at Farmácia do Carmo who doesn't ask follow-up questions. About why, when he started, and the time he wrote a 4am note to a patient.", meta: <><span>Aired <b>9 May 2026</b></span><span>Guest: <b>Rui Sousa</b></span></>, duration: "39 MIN" },
  { num: "3", numEm: "1", title: <><a href="#">Mariza Câmara, <em>district health director.</em></a></>, desc: "Recorded on a Saturday — Mariza came after her shift. Queer health policy in Lisbon's Câmara, what passed, what got buried, what she's still trying to push.", meta: <><span>Aired <b>25 Apr 2026</b></span><span>Guest: <b>Dr. Mariza Câmara</b></span></>, duration: "58 MIN" },
  { num: "3", numEm: "0", title: <><a href="#">Live from the back room · <em>open mic</em></a></>, desc: "An untraditional thirtieth — Catarina hands the mic over for two hours. Members read, sing, complain. Highlights: a love letter to a metro line; a furious haiku.", meta: <><span>Aired <b>11 Apr 2026</b></span><span>Special · 9 guests</span></>, duration: "68 MIN" },
  { num: "2", numEm: "9", title: <><a href="#">Luísa Gomes on <em>portfolio honesty.</em></a></>, desc: "An hour with the design director on reading portfolios honestly without being a jerk about it. Includes a 20-minute teardown of a fictional portfolio Catarina made up.", meta: <><span>Aired <b>28 Mar 2026</b></span><span>Guest: <b>Luísa Gomes</b></span></>, duration: "52 MIN" },
  { num: "2", numEm: "8", title: <><a href="#">Sandra at the counter — <em>30 years at Café Beirão.</em></a></>, desc: "Recorded after closing, of course. Sandra on what's changed in Anjos, what hasn't, who's allowed in the back room, and the morning her daughter came out.", meta: <><span>Aired <b>14 Mar 2026</b></span><span>Guest: <b>Sandra Beirão</b></span></>, duration: "61 MIN" },
];

export function PodcastShowPage() {
  const { showToast } = useToast();
  const play = (label: string) => showToast(`Playing ${label}`, "success");

  return (
    <PageShell>
      <div className={styles.page}>
        <div className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.cover}>The Back Room · cover art</div>
            <div>
              <div className={styles.eyebrow}>QueerPulse Audio · podcast</div>
              <h1 className={styles.h1}>
                The Back <em>Room.</em>
              </h1>
              <p className={styles.byline}>
                Hosted by <b>Catarina Vaz</b> · produced by <b>Jonas Ferreira</b>
              </p>
              <div className={styles.meta}>
                <span>
                  <b>34</b> episodes
                </span>
                <span>
                  <b>~ 45 min</b> avg
                </span>
                <span>
                  <b>Bi-weekly</b> · Thursdays
                </span>
                <span>
                  Since <b>Aug 2024</b>
                </span>
              </div>
              <div className={styles.actions}>
                <Button type="button" variant="primary" onClick={() => play("latest episode")}>
                  ▶ Play latest
                </Button>
                <Button to={NEWSLETTER} variant="ghost-dark">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.listenRow}>
          <div className={styles.listenInner}>
            <span className={styles.listenLabel}>Listen on</span>
            {PLATFORMS.map((p) => (
              <button
                key={p.name}
                type="button"
                className={styles.listenBtn}
                onClick={() => showToast(`Opening ${p.name}…`, "info")}
              >
                <span className={styles.listenIc} style={{ background: p.color }} />
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.body}>
          <main>
            <div className={styles.epH}>
              <h2>
                About the <em>show</em>
              </h2>
            </div>
            <p className={styles.aboutP}>
              Slow conversations between queer people doing the work of building
              community in Lisbon. Activists, clinicians, organisers, artists — one
              guest per episode, recorded in the back room of Café Beirão after closing
              time. <em>No interruptions, no time limit.</em>
            </p>
            <p className={`${styles.aboutP} ${styles.aboutPLast}`}>
              If our magazine is what we write down, this is what we say out loud. Pair
              it with a coffee in the morning or a walk in the late afternoon.
            </p>

            <div className={styles.epH}>
              <h2>
                Episodes · <em>34</em>
              </h2>
              <span className={styles.meta}>Newest first</span>
            </div>

            <div className={styles.epFeat}>
              <div className={styles.epFeatKicker}>Latest · 5 days ago · 52 min</div>
              <h3>
                34 · Dr. Inês Pereira on <em>fifteen minutes of someone else's time</em>
              </h3>
              <p>
                The Anjos GP who treats trans patients as adults — and changed the
                protocol for an entire clinic. We talk about waiting rooms,
                prescription lists, and why she answers her own phone.
              </p>
              <div className={styles.epFeatRow}>
                <button
                  type="button"
                  className={`${styles.play} ${styles.playLg}`}
                  onClick={() => play("episode 34")}
                >
                  <PlayIcon />
                </button>
                <Link to={EPISODE} className={styles.epFeatNotes}>
                  View episode notes →
                </Link>
              </div>
            </div>

            <div className={styles.epList}>
              {EPISODES.map((e, i) => (
                <div className={styles.epRow} key={i}>
                  <div className={styles.epNum}>
                    {e.num}
                    <em>{e.numEm}</em>
                  </div>
                  <div className={styles.epInfo}>
                    <h3>{e.title}</h3>
                    <p>{e.desc}</p>
                    <div className={styles.emMeta}>{e.meta}</div>
                  </div>
                  <div className={styles.epActions}>
                    <button type="button" className={styles.play} onClick={() => play("episode")}>
                      <PlayIcon />
                    </button>
                    <span className={styles.epDuration}>{e.duration}</span>
                  </div>
                </div>
              ))}
              <div className={styles.epMore}>
                <Button
                  type="button" variant="ghost"
                  onClick={() => showToast("Loading older episodes…", "info")}
                >
                  Show 28 older episodes
                </Button>
              </div>
            </div>
          </main>

          <aside className={styles.side}>
            <div className={styles.sideCard}>
              <h4>Hosts</h4>
              <div className={styles.hostRow}>
                <div className={styles.hostAv}>CV</div>
                <div>
                  <div className={styles.hostName}>
                    <Link to={MEMBER}>Catarina Vaz</Link>
                  </div>
                  <div className={styles.hostRole}>she/her · interviewer</div>
                </div>
              </div>
              <div className={styles.hostRow}>
                <div className={styles.hostAv} style={{ background: "rgba(var(--jade-rgb),.16)", color: "var(--jade)" }}>
                  JF
                </div>
                <div>
                  <div className={styles.hostName}>
                    <Link to={MEMBER}>Jonas Ferreira</Link>
                  </div>
                  <div className={styles.hostRole}>he/him · producer · editor</div>
                </div>
              </div>
            </div>

            <div className={styles.sideCard}>
              <h4>About the show</h4>
              {[
                ["Format", "Long-form interview"],
                ["Schedule", "Bi-weekly · Thursdays"],
                ["Length", "~45 min · range 30–90"],
                ["Languages", "PT · EN · sometimes both"],
                ["Transcripts", "Always"],
                ["Music", "By Tó Cunha"],
              ].map(([k, v]) => (
                <div className={styles.infoRow} key={k}>
                  <span>{k}</span>
                  <b>{v}</b>
                </div>
              ))}
              <div className={styles.infoRow}>
                <span>Sponsored</span>
                <b style={{ color: "var(--jade)" }}>No · ever</b>
              </div>
            </div>

            <div className={`${styles.sideCard} ${styles.guestCard}`}>
              <h4>Want to be a guest?</h4>
              <p>
                We get this often. We don't typically take pitches, but if you're
                doing something genuinely worth an hour, tell us.
              </p>
              <Button to={CONTACT} variant="ghost-dark" className={styles.guestBtn}>
                Write to the team
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
