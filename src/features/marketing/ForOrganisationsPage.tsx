import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { Reveal } from "../../shared/components/ui";
import styles from "./ForOrganisationsPage.module.css";
import { NOT_DO, PROCESS, PARTNERS } from "./forOrganisationsPage.data";
import { TiersSection, PartnerContactForm } from "./ForOrganisationsSections";

export function ForOrganisationsPage() {
  const { showToast } = useToast();

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <Reveal as="div" className={styles.eyebrow}>For organisations · partnerships</Reveal>
          <Reveal as="h1" className={styles.h1} delay={60}>
            Work <em>with us,</em> not <em>at us.</em>
          </Reveal>
          <Reveal as="p" className={styles.dek} delay={120}>
            QueerPulse partnerships are <b>operational, not promotional</b>. We don't sell
            access, run sponsored content, or do co-branding for its own sake. <em>We
            build seams between organisations that already do the work.</em> Below: what
            those seams look like, who we already work with, and how to start a
            conversation.
          </Reveal>
          <Reveal className={styles.notRow} delay={180}>
            <h4>What we don't do</h4>
            <ul>
              {NOT_DO.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <TiersSection />

      <section className={styles.process}>
        <Reveal as="h2" className={styles.doH2}>
          How partnerships <em>actually start</em>
        </Reveal>
        <Reveal as="p" className={styles.doSub} delay={60}>
          Slow. Conversational. Often via a phone call before a written proposal. The whole
          process usually takes 6–10 weeks.
        </Reveal>
        <div className={styles.processGrid}>
          {PROCESS.map((p, i) => (
            <Reveal className={styles.proc} key={p.n} delay={i * 60}>
              <div className={styles.procN}>
                {p.n[0]}
                <em>{p.n[1]}</em>
              </div>
              <h4>{p.title}</h4>
              <p>{p.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className={styles.proof}>
        <div className={styles.proofInner}>
          <Reveal as="h2">
            Already working <em>with us</em>
          </Reveal>
          <Reveal as="p" className={styles.proofSub} delay={60}>
            Four representative partners, each at a different tier. Full list lives on
            Partners.
          </Reveal>
          <div className={styles.partnerRow}>
            {PARTNERS.map((p, i) => (
              <Reveal key={i} as="button" type="button" className={styles.partnerCard} delay={i * 60} onClick={() => showToast("Opening partner page…", "info")}>
                <div className={[styles.partnerLogo, p.logoCls && styles[p.logoCls]].filter(Boolean).join(" ")}>
                  {p.logo}
                </div>
                <div className={styles.partnerType}>{p.type}</div>
                <div className={styles.partnerName}>{p.name}</div>
                <div className={styles.partnerSince}>{p.since}</div>
                <p>{p.desc}</p>
                <span className={styles.arrow}>View partner →</span>
              </Reveal>
            ))}
          </div>
          <Reveal className={styles.quoteCard} delay={60}>
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
          </Reveal>
        </div>
      </section>

      <PartnerContactForm />
    </PageShell>
  );
}
