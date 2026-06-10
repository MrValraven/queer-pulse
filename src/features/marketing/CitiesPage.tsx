import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import styles from "./CitiesPage.module.css";
import { Button } from '../../shared/components/ui'

const BETA = [
  { name: "Madrid", flag: "🇪🇸", country: "España", desc: <>Two co-moderators in place. Talking to <b>FELGTBI+</b> about a parallel ILGA-style operational bridge. Earliest plausible opening: <b>Q2 2027</b>.</>, lead: <>Coordinated by <b>Mira Martín</b> &amp; <b>Diego Carmona</b></>, btn: "Get notified when Madrid opens", toast: "You'll get an early-access invite when Madrid opens" },
  { name: "Berlin", flag: "🇩🇪", country: "Deutschland", desc: <>Two members in Berlin asked us to come; we said "not unless you co-host the build." They agreed. <b>One year of co-design ahead.</b> Earliest opening: <b>Q1 2028</b>.</>, lead: <>Coordinated by <b>Anna Hofmann</b></>, btn: "Track Berlin progress", toast: "Berlin is far out. We'll write when there's real news." },
  { name: "Coimbra", flag: "🇵🇹", country: "Portugal", desc: <>Lighter footprint — likely to function as a Porto satellite rather than a standalone city. <b>Six members</b> coordinating informally. Open in 2027 alongside Porto's first anniversary.</>, lead: <>Informal · loosely coordinated by <b>Sofia Castaño</b></>, btn: "Follow updates", toast: "Coimbra updates will come through the Porto bulletin" },
];

interface WaitCity {
  name: string;
  flag: string;
  region: string;
  votes: string;
  pct: number;
  voted?: boolean;
}
const WAITLIST: WaitCity[] = [
  { name: "Barcelona", flag: "🇪🇸", region: "España", votes: "284", pct: 72 },
  { name: "Faro", flag: "🇵🇹", region: "Algarve", votes: "112", pct: 38, voted: true },
  { name: "Amsterdam", flag: "🇳🇱", region: "Nederland", votes: "96", pct: 32 },
  { name: "Marseille", flag: "🇫🇷", region: "France", votes: "88", pct: 29 },
  { name: "São Paulo", flag: "🇧🇷", region: "Brasil", votes: "74", pct: 25 },
  { name: "Athens", flag: "🇬🇷", region: "Ελλάδα", votes: "52", pct: 17 },
];

const HOW = [
  { n: "01", title: <>At least <em>one moderator</em> in-country</>, body: <>Not flying in. Living there. Knows the venues, the language, the queer subculture, the local laws. <b>One is the floor; two is what we aim for.</b> They are paid the same hourly as Lisbon moderators.</> },
  { n: "02", title: <>An operational <em>partner organisation</em></>, body: <>We do not open in a city without someone equivalent to ILGA we can bridge to. <em>Crisis chat must hand off to a real local resource</em>, not just our Lisbon team. Hate-crime reports must route locally. Without this, we don't go.</> },
  { n: "03", title: <>Legal review · <em>local laws around queer expression</em></>, body: <>What's protected, what isn't, what the realistic risk to members is. Done by a local lawyer, not Google. <b>This stage has caused us to pause four city openings.</b> We don't elaborate publicly.</> },
  { n: "04", title: <>Eight to twelve <em>founding members</em></>, body: <>Not invitees on a list — eight to twelve people who've met each other in person, are committed to vouching for the next round, and have agreed to a 12-month soft-launch where they co-host the first 30 events. <em>Without this the network is performance.</em></> },
];

export function CitiesPage() {
  const { showToast } = useToast();
  const [voted, setVoted] = useState<Record<string, boolean>>(
    Object.fromEntries(WAITLIST.filter((w) => w.voted).map((w) => [w.name, true])),
  );

  const vote = (name: string) => {
    setVoted((prev) => ({ ...prev, [name]: true }));
    showToast("Vote recorded · we read these signals monthly", "success");
  };

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>Cities · network footprint · selector</div>
          <h1 className={styles.h1}>
            One city at a <em>time.</em>
          </h1>
          <p className={styles.dek}>
            QueerPulse is rooted in Lisbon. We will only open in a new city when there is{" "}
            <b>at least one moderator in-country</b>, a partner organisation aligned, and a
            clear local need. <em>That makes expansion slow on purpose.</em> Below: where
            we are now, where we're building, and how you can pull us toward your city.
          </p>
          <div className={styles.current}>
            <div className={styles.currentIc}>
              <svg viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className={styles.currentText}>
              <b>You're browsing as</b>
              <span>Lisbon, Portugal</span>
            </div>
            <button
              type="button"
              className={styles.currentBtn}
              onClick={() => showToast("Detected from IP. You can switch from any city card below.", "info")}
            >
              Change
            </button>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        <section>
          <div className={styles.secH}>
            <h2>
              Live · <em>fully operational</em>
            </h2>
            <span className={styles.meta}>Active community, moderators, partner orgs</span>
          </div>
          <div className={styles.liveGrid}>
            <div className={styles.cityCard}>
              <div className={styles.cityImg}>Lisbon · cityscape from Castelo</div>
              <div className={styles.cityBody}>
                <div className={styles.cityHRow}>
                  <div className={styles.cityName}>
                    Lisbon<em>.</em>
                  </div>
                  <span className={styles.cityFlag}>
                    <span className={styles.dot}>🇵🇹</span>Portugal
                  </span>
                  <span className={`${styles.cityStatus} ${styles.statusLive}`}>Live · home</span>
                </div>
                <div className={styles.statsMini}>
                  <span><b>1,<em>612</em></b>Members</span>
                  <span><b><em>284</em></b>Gatherings · 2025</span>
                  <span><b>42</b>Safe spaces</span>
                  <span><b><em>9</em></b>Magazine issues</span>
                </div>
                <p className={styles.cityDek}>
                  Where this all began. <b>Anjos, Mouraria, Graça, Alfama, Bairro Alto,
                  Marvila</b> — the network is woven into the existing fabric. Operational
                  partnerships with ILGA Portugal, Clínica do Largo, and Trans Hub. Café
                  Beirão is the de facto headquarters.
                </p>
                <div className={styles.cityCta}>
                  <span className={styles.link}>Browse Lisbon →</span>
                  <span className={styles.lead}>
                    Coordinated by <b>Marta Reis</b> &amp; <b>Catarina Vaz</b>
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className={styles.cityCard}
              onClick={() => showToast("Porto opens publicly 12 Aug 2026", "info")}
            >
              <div className={`${styles.cityImg} ${styles.cityImgB}`}>Porto · Ribeira at dawn</div>
              <div className={styles.cityBody}>
                <div className={styles.cityHRow}>
                  <div className={styles.cityName}>
                    Porto<em>.</em>
                  </div>
                  <span className={styles.cityFlag}>
                    <span className={styles.dot}>🇵🇹</span>Portugal
                  </span>
                  <span className={`${styles.cityStatus} ${styles.statusBeta}`}>Beta · 6 weeks</span>
                </div>
                <div className={styles.statsMini}>
                  <span><b><em>84</em></b>Members</span>
                  <span><b>12</b>Gatherings · in flight</span>
                  <span><b>7</b>Safe spaces</span>
                  <span><b><em>2</em></b>Partners signed</span>
                </div>
                <p className={styles.cityDek}>
                  Opening publicly <b>12 August 2026</b> after 18 months of quiet
                  groundwork. Two in-Porto moderators, partner relationship with Rede Ex
                  Aequo, and a hosting circle of nine members. The first public gathering
                  is at Café Candelabro · 21 Aug.
                </p>
                <div className={styles.cityCta}>
                  <span className={styles.link}>Join the Porto beta →</span>
                  <span className={styles.lead}>
                    Coordinated by <b>Filipa Lopes</b>
                  </span>
                </div>
              </div>
            </button>
          </div>
        </section>

        <section>
          <div className={styles.secH}>
            <h2>
              In <em>groundwork</em>
            </h2>
            <span className={styles.meta}>Local moderator identified · partner negotiations underway</span>
          </div>
          <div className={styles.betaGrid}>
            {BETA.map((b) => (
              <div className={styles.betaCard} key={b.name}>
                <div className={styles.cityHRow}>
                  <div className={styles.cityName}>
                    {b.name}
                    <em>.</em>
                  </div>
                  <span className={styles.cityFlag}>
                    <span className={styles.dot}>{b.flag}</span>
                    {b.country}
                  </span>
                </div>
                <p>{b.desc}</p>
                <div className={styles.betaLead}>{b.lead}</div>
                <Button type="button" variant="ghost" onClick={() => showToast(b.toast, "success")}>
                  {b.btn}
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className={styles.secH}>
            <h2>
              Cities <em>members are asking for</em>
            </h2>
            <span className={styles.meta}>Public waitlist · members can vote · 1 vote per member</span>
          </div>
          <p className={styles.wlIntro}>
            Votes are <em>signals to us about where the community is</em>, not promises to
            build. We open one city at a time. Adding your vote takes 1 click.
          </p>
          {WAITLIST.map((w) => {
            const hasVoted = voted[w.name];
            return (
              <div className={styles.wlRow} key={w.name}>
                <div className={styles.wlCity}>
                  <b>{w.name}</b>
                  <span>
                    {w.flag} {w.region}
                  </span>
                </div>
                <div>
                  <div className={styles.wlVotes}>
                    <em>{w.votes}</em>
                  </div>
                  <div className={styles.wlVotesL}>Members asking</div>
                </div>
                <div className={styles.wlProgress}>
                  <div className={styles.wlBar}>
                    <span style={{ width: `${w.pct}%` }} />
                  </div>
                  <span className={styles.wlPct}>{w.pct}% to threshold</span>
                </div>
                {hasVoted ? (
                  <button type="button" className={`${styles.wlVoteBtn} ${styles.wlVoteBtnVoted}`} disabled>
                    ✓ You voted
                  </button>
                ) : (
                  <button type="button" className={styles.wlVoteBtn} onClick={() => vote(w.name)}>
                    + Add my vote
                  </button>
                )}
              </div>
            );
          })}
          <p className={styles.wlFoot}>
            Don't see your city? <a href="#">Write to us</a> with what you'd build there.
          </p>
        </section>
      </div>

      <section className={styles.howSection}>
        <div className={styles.howInner}>
          <div className={styles.howKicker}>The rule book</div>
          <h2>
            How we <em>actually open</em> a new city.
          </h2>
          <p className={styles.howIntro}>Four conditions, all required. No shortcuts.</p>
          <div className={styles.howList}>
            {HOW.map((h) => (
              <div className={styles.howRow} key={h.n}>
                <div className={styles.howN}>
                  {h.n[0]}
                  <em>{h.n[1]}</em>
                </div>
                <div>
                  <h3>{h.title}</h3>
                  <p>{h.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
