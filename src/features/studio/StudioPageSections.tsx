import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { SET, TRACKS, type TrackCard } from "./studioPage.data";
import styles from "./studio.module.css";

const tagClass: Record<TrackCard["tag"], string> = {
  free: styles.tagFree,
  mem: styles.tagMem,
};

export function StudioHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroArt}>
          <ImageSlot tint="coral" width="100%" height="100%" radius={16} placeholder="cover · Mariana Sol" style={{ position: "absolute", inset: 0 }} />
        </div>
        <div className={styles.heroInfo}>
          <div className={styles.eb}>
            <span className={styles.live} />
            Track 6 · on the air now
          </div>
          <h1>
            Carta para a <em>santa</em>
          </h1>
          <div className={styles.by}>
            by <strong>Mariana Sol</strong> · from <em>Cidade dos santos</em> · 2026 · Sintra
          </div>
          <div className={styles.stats}>
            <span><em>312</em> listening</span>
            <span className={styles.dot} />
            <span>Track 6 of 11 · 4:18</span>
            <span className={styles.dot} />
            <span>Flac · 24/48</span>
          </div>
          <div className={styles.heroActions}>
            <Link to="/studio/album" className={styles.playBig} aria-label="Play">
              <svg viewBox="0 0 12 14" fill="currentColor">
                <path d="M1 1l10 6-10 6z" />
              </svg>
            </Link>
            <button>＋ Library</button>
            <button className={styles.tip}><FiHeart /> Tip €2</button>
          </div>
          <div className={styles.payPill}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>
              This listen pays Mariana <em>€0.05</em>. <span className={styles.small}>Tip on top? 100% to her.</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StudioSetSection() {
  return (
    <section className={styles.row}>
      <div className={styles.rowH}>
        <h2>
          The Wednesday <em>set</em>
        </h2>
        <div className={styles.sub}>Programmed by Sara Marques · synchronous · 312 in the room</div>
      </div>
      <div className={styles.split}>
        <div className={styles.setCard}>
          <h3>
            Vespertina, <em>vol. iv</em>
          </h3>
          <div className={styles.setDesc}>Twelve tracks for the hour between sunset and the second bottle.</div>
          {SET.map((row) => (
            <div key={row.n} className={[styles.setRow, row.now && styles.setRowNow].filter(Boolean).join(" ")}>
              <div className={styles.n}>{row.n}</div>
              <div className={styles.srCov}>
                <ImageSlot tint={row.cvTint} width={36} height={36} radius={5} placeholder="" />
              </div>
              <div>
                <h5>
                  {row.titlePre}
                  {row.titleEm && <em>{row.titleEm}</em>}
                </h5>
                <div className={styles.who}>{row.who}</div>
              </div>
              <div className={styles.pay}>
                {row.payNote && <b>{row.payNote}</b>}
                {row.pay}
              </div>
              <div className={styles.tm}>{row.tm}</div>
            </div>
          ))}
        </div>

        <StudioSideCol />
      </div>
    </section>
  );
}

function StudioSideCol() {
  return (
    <div className={styles.sideCol}>
      <div className={styles.sideCard}>
        <div className={styles.eb}>
          <span className={styles.live} />
          In the room with you
        </div>
        <div className={styles.ct}>
          <em>312</em> listening
        </div>
        <div className={styles.sub}>89 sustainers · 223 casual · 41 cities</div>
        <div className={styles.avStack}>
          {["JR", "RT", "SC", "YR", "PL", "DO"].map((a, i) => (
            <span key={a} className={[styles.av, i % 2 === 1 && styles.jade].filter(Boolean).join(" ")}>
              {a}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.ledgerCard}>
        <div className={styles.head}>Ledger · this month</div>
        <div className={styles.lrow}>
          <span className={styles.k}>Paid to artists</span>
          <span className={styles.v}>€<em>11,940</em></span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>Plays</span>
          <span className={styles.v}>202k</span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>Artist share</span>
          <span className={styles.v}><em>80.3</em>%</span>
        </div>
        <div className={styles.lrow}>
          <span className={styles.k}>Per play</span>
          <span className={styles.v}>€<em>0.05</em></span>
        </div>
        <Link to="/governance" className={styles.cta}>
          Read the plan →
        </Link>
      </div>
    </div>
  );
}

export function StudioTracksSection() {
  return (
    <section className={styles.row}>
      <div className={styles.rowH}>
        <h2>
          This week, <em>programmed</em>
        </h2>
        <div className={styles.sub}>Eight singles, each with a curator's name on it. Rotates Monday.</div>
        <Link to="/studio/album" className={styles.all}>
          All →
        </Link>
      </div>
      <div className={styles.rowGrid}>
        {TRACKS.map((t) => (
          <Link key={t.titlePre} to="/studio/album" className={styles.card}>
            <div className={styles.cardCov}>
              <ImageSlot tint={t.cvTint} width="100%" height="100%" radius={10} placeholder="cover" style={{ position: "absolute", inset: 0 }} />
              <span className={`${styles.tag} ${tagClass[t.tag]}`}>{t.tagLabel}</span>
              <button className={styles.playFab} aria-label="Play">
                <svg viewBox="0 0 12 14" fill="currentColor">
                  <path d="M1 1l10 6-10 6z" />
                </svg>
              </button>
            </div>
            <div className={styles.byCur}>{t.curator}</div>
            <h4>
              {t.titlePre}
              {t.titleEm && <em>{t.titleEm}</em>}
            </h4>
            <div className={styles.meta}>
              <span>{t.who}</span> · {t.time}
            </div>
            <div className={styles.payLine}>
              <span>per play</span>
              <em>€0.05</em>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
