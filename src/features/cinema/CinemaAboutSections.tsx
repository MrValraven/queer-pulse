import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import {
  curators,
  decisionRows,
  deedParagraphs,
  ledgerRows,
  principles,
  splitLegend,
  splitSegments,
} from "./cinemaAbout.data";
import styles from "./CinemaAboutPage.module.css";

export function AboutHero() {
  return (
    <section className={styles.hero}>
      <div className={`wrap ${styles.heroInner}`}>
        <div className={styles.heroEb}>QueerPulse Cinema · the co-op</div>
        <h1 className={styles.heroTitle}>
          A theatre, an archive, <em>a co-op</em>.
        </h1>
        <p className={styles.heroSub}>
          QueerPulse Cinema is not a streaming platform. It's a room —
          programmed by queer people, <em>paid to queer people</em>, governed by
          the filmmakers and sustainers who make it possible.
        </p>
      </div>
    </section>
  );
}

export function TheDeed() {
  return (
    <section className={styles.deed}>
      <div className={`wrap ${styles.deedInner}`}>
        <div className={styles.deedLabel}>
          The <em>deed</em> · in plain language
        </div>
        <div className={styles.deedText}>
          {deedParagraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Principles() {
  return (
    <section className={styles.principles}>
      <div className="wrap">
        <div className={styles.prHead}>
          <h2>
            Six <em>principles</em>
          </h2>
        </div>
        <div className={styles.prGrid}>
          {principles.map((p) => (
            <div key={p.num} className={styles.prCard}>
              <div className={styles.prNum}>{p.num}</div>
              <div className={styles.prTitle}>{p.title}</div>
              <div className={styles.prBody}>{p.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SplitVisual() {
  const segClass: Record<string, string | undefined> = {
    fm: styles.segFm,
    pay: styles.segPay,
    host: styles.segHost,
  };
  return (
    <section className={styles.split}>
      <div className={`wrap ${styles.splitInner}`}>
        <div className={styles.svText}>
          <h2>
            The split, <em>explained</em>
          </h2>
          <p>
            When you rent a film for €3.00, €2.40 goes to the filmmaker. That's
            80%. The remaining 20% covers payment processing (Stripe/IBAN,
            roughly 12%) and video hosting and captioning costs (roughly 8%).
          </p>
          <p>
            For a direct buy at €8.00, the same 80/20 applies:{" "}
            <em>€6.40 to the filmmaker.</em> For tips, 100% goes to them — we
            don't take anything off a tip.
          </p>
          <p>
            The sustainer library pool is distributed monthly based on
            per-minute-watched, with 80% going to filmmakers from the subscriber
            revenue after platform costs.
          </p>
          <Link to={routes.governance} className={styles.svLink}>
            View the full public accounts →
          </Link>
        </div>
        <div className={styles.svVisual}>
          <div className={styles.svvHead}>Example: €3.00 rental</div>
          <div className={styles.svvLabel}>How €3.00 divides</div>
          <div className={styles.svvBar}>
            {splitSegments.map((s) => (
              <div
                key={s.tone}
                className={`${styles.svvSeg} ${segClass[s.tone]}`}
                style={{ flex: `0 0 ${s.pct}%` }}
              />
            ))}
          </div>
          <div className={styles.svvLegend}>
            {splitLegend.map((item) => (
              <div key={item.label}>
                <div className={styles.svvV}>{item.value}</div>
                <div className={styles.svvK}>{item.label}</div>
              </div>
            ))}
          </div>
          <div className={styles.svvNote}>
            Tips are 100% to the filmmaker. No deduction.
          </div>
        </div>
      </div>
    </section>
  );
}

export function CuratorsCouncil() {
  const avClass: Record<string, string | undefined> = {
    coral: styles.avCoral,
    jade: styles.avJade,
    plum: styles.avPlum,
  };
  return (
    <section className={styles.council}>
      <div className="wrap">
        <h2>
          The curators' <em>council</em>
        </h2>
        <p className={styles.councilSub}>
          Six people who programme the cinema. They rotate every year —
          nominated by the community, confirmed by sustainers' vote. Each brings
          a different geography, focus, and way of looking.
        </p>
        <div className={styles.councilGrid}>
          {curators.map((c) => (
            <Link
              key={c.initials}
              to={`${routes.cinemaCurator}/${c.slug}`}
              className={styles.curatorCard}
            >
              <div className={styles.ccHead}>
                <div className={`${styles.ccAv} ${avClass[c.tone]}`}>
                  {c.initials}
                </div>
                <div>
                  <div className={styles.ccName}>{c.name}</div>
                  <div className={styles.ccRole}>{c.role}</div>
                  <div className={styles.ccPron}>{c.pronouns}</div>
                </div>
              </div>
              <div className={styles.ccBio}>{c.bio}</div>
              <div className={styles.ccFocus}>
                {c.focus.map((tag) => (
                  <span key={tag} className={styles.focusTag}>
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Governance() {
  return (
    <section className={styles.gov}>
      <div className={`wrap ${styles.govInner}`}>
        <div className={styles.govBlock}>
          <h3>
            Public <em>ledger</em> · June 2026
          </h3>
          {ledgerRows.map((row) => (
            <div key={row.k} className={styles.govRow}>
              <span className="k">{row.k}</span>
              <span className="v">{row.v}</span>
            </div>
          ))}
          <div className={styles.govAction}>
            <Button variant="ghost-dark" to={routes.governance}>
              Full accounts →
            </Button>
          </div>
        </div>
        <div className={styles.govBlock}>
          <h3>
            How decisions <em>get made</em>
          </h3>
          {decisionRows.map((row) => (
            <div key={row.k} className={styles.govRow}>
              <span className="k">{row.k}</span>
              <span className="v">{row.v}</span>
            </div>
          ))}
          <div className={styles.govAction}>
            <Button variant="ghost-dark" to={routes.cinemaMembership}>
              Filmmaker rights →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
