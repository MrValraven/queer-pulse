import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import styles from "./ForOrganisationsPage.module.css";
import { NOT_DO, PROCESS, PARTNERS } from "./forOrganisationsPage.data";
import { TiersSection, PartnerContactForm } from "./ForOrganisationsSections";

export function ForOrganisationsPage() {
  const { showToast } = useToast();

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>For organisations · partnerships</div>
          <h1 className={styles.h1}>
            Work <em>with us,</em> not <em>at us.</em>
          </h1>
          <p className={styles.dek}>
            QueerPulse partnerships are <b>operational, not promotional</b>. We don't sell
            access, run sponsored content, or do co-branding for its own sake. <em>We
            build seams between organisations that already do the work.</em> Below: what
            those seams look like, who we already work with, and how to start a
            conversation.
          </p>
          <div className={styles.notRow}>
            <h4>What we don't do</h4>
            <ul>
              {NOT_DO.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <TiersSection />

      <section className={styles.process}>
        <h2 className={styles.doH2}>
          How partnerships <em>actually start</em>
        </h2>
        <p className={styles.doSub}>
          Slow. Conversational. Often via a phone call before a written proposal. The whole
          process usually takes 6–10 weeks.
        </p>
        <div className={styles.processGrid}>
          {PROCESS.map((p) => (
            <div className={styles.proc} key={p.n}>
              <div className={styles.procN}>
                {p.n[0]}
                <em>{p.n[1]}</em>
              </div>
              <h4>{p.title}</h4>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.proof}>
        <div className={styles.proofInner}>
          <h2>
            Already working <em>with us</em>
          </h2>
          <p className={styles.proofSub}>
            Four representative partners, each at a different tier. Full list lives on
            Partners.
          </p>
          <div className={styles.partnerRow}>
            {PARTNERS.map((p, i) => (
              <button type="button" className={styles.partnerCard} key={i} onClick={() => showToast("Opening partner page…", "info")}>
                <div className={[styles.partnerLogo, p.logoCls && styles[p.logoCls]].filter(Boolean).join(" ")}>
                  {p.logo}
                </div>
                <div className={styles.partnerType}>{p.type}</div>
                <div className={styles.partnerName}>{p.name}</div>
                <div className={styles.partnerSince}>{p.since}</div>
                <p>{p.desc}</p>
                <span className={styles.arrow}>View partner →</span>
              </button>
            ))}
          </div>
          <div className={styles.quoteCard}>
            <p>
              "What QueerPulse asked us for at the start was strange: <em>not money</em>,
              not co-branding — they wanted us to commit to specific operational changes in
              how our helpline handed off to a community. It took a year. It's the
              partnership we're proudest of."
            </p>
            <div className={styles.quoteBy}>
              <div className={styles.quoteAv}>FM</div>
              <div>
                <div className={styles.quoteName}>Filipa Mendes</div>
                <div className={styles.quoteRole}>Executive Director · ILGA Portugal</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PartnerContactForm />
    </PageShell>
  );
}
