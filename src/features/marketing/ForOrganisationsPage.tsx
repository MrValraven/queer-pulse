import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import styles from "./ForOrganisationsPage.module.css";
import { Button } from '../../shared/components/ui'

const NOT_DO = [
  <><b>Pride-month campaigns.</b> Not in June, not ever. Members would (rightly) leave.</>,
  <><b>Sell our member list.</b> No targeting, no segmentation, no warm intros for a fee.</>,
  <><b>"Sponsored posts" or branded content</b> in the magazine, feed, or podcast.</>,
  <><b>Rainbow logos.</b> We don't add yours and we don't loan ours.</>,
  <><b>Recruit on your behalf.</b> Companies post jobs through Jobs like everyone else.</>,
];

const PROCESS = [
  { n: "01", title: "Email or a call", body: <>Tell us what you do, what you'd like, what's not negotiable on your side. <em>30 min, no commitment.</em></> },
  { n: "02", title: "An in-person meeting", body: <>Coffee in Lisbon if you're here, or video. We talk through how the seam would work — operationally, not theoretically.</> },
  { n: "03", title: "Two-page proposal", body: <>One of us drafts it; both sides edit. Includes <b>exit conditions</b>, public-disagreement clauses, and money flow.</> },
  { n: "04", title: "Assembly sign-off", body: <>Operational partnerships go to the monthly Assembly. The Sustainer membership weighs in. <em>~10% of partnerships are vetoed.</em></> },
];

const PARTNERS = [
  { logo: "ILGA", logoCls: "", type: "Operational · founding", name: <>ILGA <em>Portugal</em></>, since: "Partnered since 2022", desc: "Operational case-bridge, free legal consults, joint advocacy. The 4-year-old seam that proves this model." },
  { logo: "CL", logoCls: "logoCoral", type: "Operational · 2024", name: <>Clínica <em>do Largo</em></>, since: "Partnered since 2024", desc: "Open clinic nights, trans-affirming care pathway, vouching for QP-verified therapists." },
  { logo: "FG", logoCls: "logoJade", type: "Programme funder", name: <>Fundação <em>Gulbenkian</em></>, since: "Funder since 2025", desc: "Three-year grant for the micro-grants fund. €60k/year. Quarterly reports + annual audit." },
];

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

      <section className={styles.doSection}>
        <div className={styles.doInner}>
          <h2 className={styles.doH2}>
            What we <em>do offer</em>
          </h2>
          <p className={styles.doSub}>
            Three tiers, each a different kind of relationship. All include the basics:
            pre-listing review, transparent funding disclosure, and the ability for either
            side to disagree publicly.
          </p>
          <div className={styles.tierGrid}>
            <div className={styles.tier}>
              <div className={styles.tierName}>Verified employer</div>
              <div>
                <div className={styles.tierPrice}>
                  €<em>2.4</em>k
                </div>
                <div className={styles.tierPricePeriod}>/ year · post unlimited jobs</div>
              </div>
              <p className={styles.tierDek}>
                For employers who want to post on our Jobs board with the "verified
                queer-friendly" badge. Requires a 12-month engagement and one
                member-conducted review.
              </p>
              <ul className={styles.tierList}>
                <li>Unlimited job listings · <b>posted within 24h</b></li>
                <li>Verified-employer badge on the company profile</li>
                <li>One annual member-conducted culture review (anonymous)</li>
                <li>Listing in Employer Reviews</li>
                <li>Quarterly hiring office-hours with two team members</li>
              </ul>
              <p className={styles.tierFootNote}>
                For: 20+ person organisations actively hiring queer talent. Sliding scale
                for under-50-person teams.
              </p>
              <Button type="button" variant="ghost" className={styles.tierBtn} onClick={() => showToast("Opening the review form…", "info")}>
                Start the review
              </Button>
            </div>

            <div className={`${styles.tier} ${styles.tierFeatured}`}>
              <div className={styles.tierName}>
                Operational <em>partner</em>
              </div>
              <div>
                <div className={styles.tierPrice}>
                  By <em>arrangement</em>
                </div>
                <div className={styles.tierPricePeriod}>reciprocal · usually unpaid</div>
              </div>
              <p className={styles.tierDek}>
                For organisations that should be operationally connected to QueerPulse —
                ILGA, Trans Hub, civic-service agencies, allied associations. We build
                infrastructure together, not co-marketing.
              </p>
              <ul className={styles.tierList}>
                <li><b>Operational seam:</b> case bridge, helpline handoff, joint protocol</li>
                <li>Shared moderation channel where appropriate</li>
                <li>Co-signed advocacy work · each side can dissent publicly</li>
                <li>Listed on Partners with a dedicated case page</li>
                <li><b>Per-case payment</b> for partner-provided services (e.g. €45/legal-consult)</li>
              </ul>
              <p className={styles.tierFootNote}>
                For: civic, advocacy, healthcare, and mission-aligned orgs. Selection is
                slow and rare. <b>Two new operational partners per year, max.</b>
              </p>
              <Button href="#start" variant="primary" className={styles.tierBtn} style={{ background: "var(--accent)", color: "#fff" }}>
                Propose a partnership
              </Button>
            </div>

            <div className={styles.tier}>
              <div className={styles.tierName}>Programme funder</div>
              <div>
                <div className={styles.tierPrice}>
                  €<em>15</em>k+
                </div>
                <div className={styles.tierPricePeriod}>/ year · specific programme</div>
              </div>
              <p className={styles.tierDek}>
                For foundations, public agencies, and grant-making organisations funding a
                specific programme — micro-grants, the magazine, safe spaces, trans-health
                access.
              </p>
              <ul className={styles.tierList}>
                <li>Programme-specific reporting · quarterly</li>
                <li>Credit on the programme page in plain text</li>
                <li>No platform-wide placement, no co-branding</li>
                <li>Annual independent audit included</li>
                <li>Public itemisation in the transparency report</li>
              </ul>
              <p className={styles.tierFootNote}>
                For: Fundação Calouste Gulbenkian-tier orgs and EU programmes. We've turned
                down €60k+ when the strings didn't fit.
              </p>
              <Button type="button" variant="ghost" className={styles.tierBtn} onClick={() => showToast("Opening grant discussion…", "info")}>
                Discuss a grant
              </Button>
            </div>
          </div>
        </div>
      </section>

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

      <section className={styles.ctaSection} id="start">
        <div className={styles.ctaInner}>
          <div>
            <h2>
              Start a <em>conversation.</em>
            </h2>
            <p>
              Tell us about your organisation in a paragraph. We read every message within
              5 working days and reply personally — even if the answer is "this isn't right
              for us right now."
            </p>
            <ul className={styles.ctaList}>
              <li>For partnerships, we usually call before we write</li>
              <li>Grant applications: include a one-pager</li>
              <li>Press inquiries → <a href="#">Press Kit</a></li>
              <li>Already a partner with a question → <a href="#">Contact</a></li>
            </ul>
          </div>

          <form
            className={styles.partnerForm}
            onSubmit={(e) => {
              e.preventDefault();
              showToast("Sent to Marta and André — they'll reply within 5 working days", "success", 4500);
            }}
          >
            <div className={styles.field}>
              <label>Your name</label>
              <input type="text" placeholder="Filipa Mendes" required />
            </div>
            <div className={styles.field}>
              <label>Organisation</label>
              <input type="text" placeholder="ILGA Portugal" required />
            </div>
            <div className={styles.field}>
              <label>Email</label>
              <input type="email" placeholder="you@org.example" required />
            </div>
            <div className={styles.field}>
              <label>Interested in</label>
              <select defaultValue="Operational partnership">
                <option>Operational partnership</option>
                <option>Verified employer</option>
                <option>Programme funding</option>
                <option>Something else (tell us in the note)</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>What you'd like to build, in a paragraph</label>
              <textarea placeholder="We run an LGBTQ+ helpline and..." rows={4} />
            </div>
            <Button variant="primary" className={styles.formBtn} type="submit">
              Send to partnerships team
            </Button>
            <p className={styles.formSmall}>
              Goes directly to Marta and André. No sales funnel, no follow-up sequence.
              Just a reply within 5 working days.
            </p>
          </form>
        </div>
      </section>
    </PageShell>
  );
}
