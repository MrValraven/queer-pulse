import { useToast } from "../../shared/components/feedback/useToast";
import { Button } from "../../shared/components/ui";
import styles from "./ForOrganisationsPage.module.css";

export function TiersSection() {
  const { showToast } = useToast();
  return (
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
              <div className={styles.tierPrice}>€<em>2.4</em>k</div>
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
            <div className={styles.tierName}>Operational <em>partner</em></div>
            <div>
              <div className={styles.tierPrice}>By <em>arrangement</em></div>
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
              <div className={styles.tierPrice}>€<em>15</em>k+</div>
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
  );
}

export function PartnerContactForm() {
  const { showToast } = useToast();
  return (
    <section className={styles.ctaSection} id="start">
      <div className={styles.ctaInner}>
        <div>
          <h2>Start a <em>conversation.</em></h2>
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
  );
}
