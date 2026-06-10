import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import styles from "./TransparencyReportPage.module.css";
import { Button } from '../../shared/components/ui'

const TABS = [
  ["money", "Money"],
  ["people", "People"],
  ["moderation", "Moderation"],
  ["requests", "Gov requests"],
  ["mistakes", "Mistakes"],
  ["governance", "How decisions get made"],
];

const SOURCES = [
  { amt: <><em>€186k</em></>, name: "Sustainer memberships", detail: "1,938 members · 67% of total · paid 4-year retention" },
  { amt: <>€<em>52</em>k</>, name: "One-off donations", detail: "1,247 contributions · avg €42 · 18% of total" },
  { amt: <>€<em>40</em>k</>, name: "Programme grants", detail: "3 grants · Fundação Calouste Gulbenkian, Câmara Municipal de Lisboa, Open Society · 14%" },
];

const ALLOC = [
  { color: "var(--accent)", w: 42, label: "Programmes & community grants", detail: "Micro-grants (€38k), open clinic nights, gatherings subsidies, magazine production, the print issues", amt: "€112,300", pct: "42%" },
  { color: "var(--jade)", w: 22, label: "Community staff & moderation", detail: "Two part-time moderators, one community manager, crisis chat paid operators", amt: "€58,830", pct: "22%" },
  { color: "var(--plum)", w: 18, label: "Infrastructure", detail: "Servers, security audits, the part-time engineer, email, payment processing", amt: "€48,140", pct: "18%" },
  { color: "rgba(45,27,61,.5)", w: 10, label: "Partner & legal operations", detail: "ILGA legal-consult programme (€45/consult), policy work, the auditor", amt: "€26,750", pct: "10%" },
  { color: "rgba(45,27,61,.30)", w: 5, label: "Reserves", detail: "Building a 4-month operational runway · target is 6 months by 2027", amt: "€13,370", pct: "5%" },
  { color: "rgba(45,27,61,.18)", w: 3, label: "Admin & the boring bits", detail: "Accounting software, the legal entity, postage, the office at Largo dos Anjos", amt: "€8,030", pct: "3%" },
];

const PEOPLE1 = [
  { lbl: "Active members", b: <>1,<em>847</em></>, p: "Signed in within last 60 days", delta: "+18% YoY" },
  { lbl: "Vouched members", b: <><em>94</em>%</>, p: "The other 6% are press & legacy founders", delta: "+2 pts" },
  { lbl: "Gatherings held", b: <><em>284</em></>, p: "Average 23/month · 78% sold out", delta: "+62 events" },
  { lbl: "Micro-grants given", b: <><em>147</em></>, p: "Average €128 · 100% disbursed within 14 days", delta: "+34 grants" },
];
const PEOPLE2 = [
  { lbl: "Members in Lisbon", b: <>1,<em>612</em></>, p: "87% — most are within 5 km of Anjos" },
  { lbl: "Members elsewhere in PT", b: <>147</>, p: "Porto (84), Coimbra (24), Faro (11), other (28)" },
  { lbl: "Trans / non-binary members", b: <><em>22</em>%</>, p: "Self-reported, opt-in. Above Lisbon baseline." },
  { lbl: "On solidarity pricing", b: <>18%</>, p: "336 members · zero questions asked", delta: "+4 pts" },
];

const MOD_STATS = [
  { lbl: "Reports filed", b: <><em>312</em></>, p: "By members · 0.17 per active member" },
  { lbl: "Actions taken", b: <><em>184</em></>, p: "59% of reports led to action" },
  { lbl: "Median response time", b: <><em>4.2</em>h</>, p: "Target was 6 hours · we made it", delta: "−1.8h" },
  { lbl: "Appeals overturned", b: <><em>11</em>%</>, p: "Out of 27 appeals · we got it wrong 3 times", delta: "+2 pts", down: true },
];
const MOD_ROWS = [
  { reason: "Harassment / personal attack", count: <>5<em>4</em></>, delta: "+18%", up: true, pct: "29%" },
  { reason: "Outing / privacy violation", count: <>3<em>1</em></>, delta: "−4%", pct: "17%" },
  { reason: "Spam / promotional", count: <>28</>, delta: "+12%", up: true, pct: "15%" },
  { reason: "Vouch abuse / fraudulent invite", count: <>2<em>2</em></>, delta: "+8%", up: true, pct: "12%" },
  { reason: "Sexual content where not consented", count: <>19</>, delta: "−22%", pct: "10%" },
  { reason: "Bigotry (transphobia, racism)", count: <>14</>, delta: "−9%", pct: "8%" },
  { reason: "Off-platform conduct flagged", count: <>9</>, delta: "+50%", up: true, pct: "5%" },
  { reason: "Other", count: <>7</>, delta: "−", pct: "4%" },
];

const REQUESTS = [
  { h: <>Court orders for member data <em>· complied with valid scope</em></>, d: <>Two orders received from <b>Tribunal Judicial da Comarca de Lisboa</b>, both narrowly scoped to specific investigations of hate-crime suspects (not our members). We provided only metadata legally required; member privacy preserved where possible.</>, r: <><em>2</em></>, rl: "Court orders · complied" },
  { h: <>Informal requests <em>· declined</em></>, d: <>Four informal asks from various ministries and one foreign police liaison. None had a valid Portuguese court order. <b>We declined all four</b> and informed members affected (where legal to do so).</>, r: <><em>4</em></>, rl: "Declined" },
  { h: <>Subpoenas from civil parties</>, d: <>One subpoena in a civil discrimination case where a member chose to be a witness, with their explicit consent. We provided records limited to what they themselves requested be shared.</>, r: <><em>1</em></>, rl: "Member-authorised" },
];

const MISTAKES = [
  { meta: "February · moderation", h: <>We deleted a post we shouldn't have <em>(twice).</em></>, text: <>Two posts from the same member criticising our partnership with ILGA on the 2024 self-determination amendments were removed by a new moderator who interpreted them as "personal attacks". <b>They weren't — they were disagreement.</b> Both were reinstated within 36 hours after the appeal.</>, fix: <><b>Changed since:</b> we now require a 2-mod sign-off before any post critical of the organisation can be removed, and we added "disagreement is not harassment" to the moderator training module.</> },
  { meta: "May · vouching", h: <>Our invite ratio got too generous, briefly.</>, text: <>For about 6 weeks in May–June, members could invite 4 people instead of the usual 2 (a misconfiguration after a release). The vouching system handled it fine in 97% of cases, but <b>three vouched-in members did not turn out to be who they said they were</b> — two were marketing scrapers, one was a journalist using a fake identity.</>, fix: <><b>Changed since:</b> invite-cap is now hard-coded in two places. The three accounts were removed. We've added a quarterly "did the invite system get loosened?" check.</> },
  { meta: "November · finance", h: <>We undercharged some Sustainer renewals.</>, text: <>A pricing update in November rolled out 12 hours late, meaning <b>around 48 members were charged the old rate</b> (€84) when they renewed during that window. We <em>did not</em> charge them the difference. The loss was about €580 and we ate it.</>, fix: <><b>Changed since:</b> pricing updates now ship at 03:00 WET behind a feature flag with rollback. We also wrote to all 48 members and offered them a free year extension. 32 declined; 16 took it.</> },
];

const GOV_STATS = [
  { lbl: "Annual Assembly", b: <><em>1</em></>, p: "Held 14 November in Anjos · 312 of 1,847 members attended in person or online" },
  { lbl: "Resolutions voted", b: <><em>11</em></>, p: "9 passed, 2 sent back for redrafting · quorum was 184 votes" },
  { lbl: "Public minutes", b: <>100<em>%</em></>, p: <>All meetings minuted, posted within 7 days · <a href="#">browse →</a></> },
  { lbl: "Rotating circle members", b: <><em>23</em></>, p: "Across 4 circles · grants, moderation, finance, hosting · 12-month max term" },
];

function Bignum({ d }: { d: { lbl: string; b: React.ReactNode; p: React.ReactNode; delta?: string; down?: boolean } }) {
  return (
    <div className={styles.bignum}>
      <div className={styles.lbl}>{d.lbl}</div>
      <b>{d.b}</b>
      <p>{d.p}</p>
      {d.delta && <span className={[styles.delta, d.down && styles.deltaDown].filter(Boolean).join(" ")}>{d.delta}</span>}
    </div>
  );
}

export function TransparencyReportPage() {
  const { showToast } = useToast();
  const [active, setActive] = useState("money");

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>Annual transparency report · 2025</div>
          <h1 className={styles.h1}>
            Every <em>euro,</em> every <em>moderation,</em> every <em>mistake.</em>
          </h1>
          <p className={styles.dek}>
            The numbers behind QueerPulse in 2025 — finances, moderation actions,
            government requests, and the things we got wrong. <em>Published by Associação
            QueerPulse</em> on 14 May 2026, after independent review by Dra. Helena Faria
            (auditor).
          </p>
          <div className={styles.metaRow}>
            <span><b>€<em>278</em>k</b>Total raised</span>
            <span><b><em>96</em>%</b>To programs</span>
            <span><b>1,847</b>Active members</span>
            <span><b><em>3</em></b>Public mistakes named</span>
          </div>
        </div>
      </section>

      <div className={styles.tabs}>
        <div className={styles.tabsInner}>
          {TABS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className={[styles.tab, active === id && styles.tabActive].filter(Boolean).join(" ")}
              onClick={() => setActive(id)}
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      <div className={styles.page}>
        <div className={styles.yearSwitch}>
          <a href="#money" className={`${styles.yearBtn} ${styles.yearCurrent}`}>2025</a>
          <a href="#money" className={styles.yearBtn}>2024</a>
          <a href="#money" className={`${styles.yearBtn} ${styles.yearFuture}`}>2026 · in progress</a>
        </div>

        <section className={styles.sec} id="money">
          <div className={styles.secH}>
            <h2>
              Where the money <em>came from,</em> and where it <em>went.</em>
            </h2>
            <span className={styles.secNum}>0<em>1</em></span>
          </div>
          <p className={styles.secSub}>
            All figures in euros, calendar year 2025. Books audited by an independent
            auditor (no relationship to the organisation), available on request as itemised
            CSV.
          </p>
          <div className={styles.miniH}>Where the €278,400 came from</div>
          <div className={styles.sourceGrid}>
            {SOURCES.map((s) => (
              <div className={styles.source} key={s.name}>
                <div className={styles.sourceAmt}>{s.amt}</div>
                <div className={styles.sourceName}>{s.name}</div>
                <div className={styles.sourceDetail}>{s.detail}</div>
              </div>
            ))}
          </div>
          <div className={styles.alloc}>
            <div className={styles.allocTotal}>
              <em>€267,420</em>
            </div>
            <div className={styles.allocTotalLbl}>
              Spent in 2025 · 96.1% of receipts · €10,980 surplus carried to reserves
            </div>
            <div className={styles.allocBar}>
              {ALLOC.map((a, i) => (
                <span key={i} style={{ background: a.color, width: `${a.w}%` }} />
              ))}
            </div>
            <div className={styles.allocKey}>
              {ALLOC.map((a, i) => (
                <div className={styles.allocKeyRow} key={i}>
                  <span className={styles.dot} style={{ background: a.color }} />
                  <div>
                    <div className={styles.label}>{a.label}</div>
                    <div className={styles.detail}>{a.detail}</div>
                  </div>
                  <span className={styles.amt}>{a.amt}</span>
                  <span className={styles.pct}>{a.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sec} id="people">
          <div className={styles.secH}>
            <h2>
              The <em>people</em> behind the numbers.
            </h2>
            <span className={styles.secNum}>0<em>2</em></span>
          </div>
          <p className={styles.secSub}>
            Members at year-end, growth, who actually shows up. We don't celebrate big
            numbers — only the right ones.
          </p>
          <div className={styles.bignumRow}>
            {PEOPLE1.map((d) => (
              <Bignum d={d} key={d.lbl} />
            ))}
          </div>
          <div className={styles.bignumRow} style={{ marginBottom: 0 }}>
            {PEOPLE2.map((d) => (
              <Bignum d={d} key={d.lbl} />
            ))}
          </div>
        </section>

        <section className={styles.sec} id="moderation">
          <div className={styles.secH}>
            <h2>
              Moderation, <em>by the numbers.</em>
            </h2>
            <span className={styles.secNum}>0<em>3</em></span>
          </div>
          <p className={styles.secSub}>
            What was reported, what we acted on, and how long it took. Every action logged;
            full anonymised log available to any member on request.
          </p>
          <div className={styles.bignumRow} style={{ marginBottom: 24 }}>
            {MOD_STATS.map((d) => (
              <Bignum d={d} key={d.lbl} />
            ))}
          </div>
          <div className={styles.modTable}>
            <div className={`${styles.modRow} ${styles.modHead}`}>
              <span>Reason for moderation action</span>
              <span>Count</span>
              <span>YoY</span>
              <span>% of all</span>
            </div>
            {MOD_ROWS.map((r, i) => (
              <div className={styles.modRow} key={i}>
                <span className={styles.reason}>{r.reason}</span>
                <span className={styles.count}>{r.count}</span>
                <span className={[styles.delta, r.up && styles.deltaUp].filter(Boolean).join(" ")}>{r.delta}</span>
                <span className={styles.pct}>{r.pct}</span>
              </div>
            ))}
          </div>
          <p className={styles.modBreakdown}>
            Action breakdown: <b>96 posts/comments removed</b>, <b>52 warnings issued</b>,{" "}
            <b>23 temporary suspensions</b> (median 7 days), <b>9 permanent bans</b>,{" "}
            <b>4 cases referred to ILGA</b> for legal handling.
          </p>
        </section>

        <section className={styles.sec} id="requests">
          <div className={styles.secH}>
            <h2>
              Government &amp; legal <em>requests</em> for member data.
            </h2>
            <span className={styles.secNum}>0<em>4</em></span>
          </div>
          <p className={styles.secSub}>
            Every request we received from any government or legal entity in 2025. We comply
            with valid Portuguese court orders. <em>We do not comply with informal asks.</em>
          </p>
          {REQUESTS.map((r, i) => (
            <div className={styles.reqCard} key={i}>
              <div>
                <div className={styles.reqH}>{r.h}</div>
                <div className={styles.reqD}>{r.d}</div>
              </div>
              <div>
                <div className={styles.reqR}>{r.r}</div>
                <div className={styles.reqRL}>{r.rl}</div>
              </div>
            </div>
          ))}
        </section>

        <section className={styles.sec} id="mistakes">
          <div className={styles.secH}>
            <h2>
              Things we got <em>wrong</em> in 2025.
            </h2>
            <span className={styles.secNum}>0<em>5</em></span>
          </div>
          <p className={styles.secSub}>
            Published because we want this section to be the easiest part of the report to
            write next year. <em>Naming our own mistakes is the price of being trusted.</em>
          </p>
          {MISTAKES.map((m, i) => (
            <div className={styles.mistake} key={i}>
              <div className={styles.mistakeMeta}>{m.meta}</div>
              <h3 className={styles.mistakeH}>{m.h}</h3>
              <p className={styles.mistakeText}>{m.text}</p>
              <div className={styles.mistakeFix}>{m.fix}</div>
            </div>
          ))}
        </section>

        <section className={styles.sec} id="governance">
          <div className={styles.secH}>
            <h2>
              How <em>decisions</em> got made.
            </h2>
            <span className={styles.secNum}>0<em>6</em></span>
          </div>
          <p className={styles.secSub}>
            Boring meeting minutes are the foundation of trust. Here's how QueerPulse's
            governance actually worked in 2025.
          </p>
          <div className={styles.bignumRow} style={{ marginBottom: 24 }}>
            {GOV_STATS.map((d) => (
              <Bignum d={d} key={d.lbl} />
            ))}
          </div>
          <p className={styles.modBreakdown}>
            For full meeting minutes, the constitution, the Sustainer agreement, and the
            formal organisational chart, see Governance.
          </p>
        </section>

        <div className={styles.signoff}>
          <h3>
            Signed in <em>good faith,</em> and ready for questions.
          </h3>
          <p>
            This report was prepared by Catarina Vaz and André Bento, reviewed by the full
            Assembly, and audited independently by Dra. Helena Faria of Faria Auditoria.{" "}
            <em>Errors are ours.</em> Questions, corrections, or concerns:{" "}
            <a href="mailto:transparency@queerpulse.app">transparency@queerpulse.app</a> — a
            real person reads them within 48 hours.
          </p>
          <div className={styles.signRow}>
            <div className={styles.signAv}>CV</div>
            <div>
              <div className={styles.signName}>Catarina Vaz</div>
              <div className={styles.signRole}>Co-treasurer · drafted finance + mistakes</div>
            </div>
            <div className={styles.signAv} style={{ background: "rgba(var(--jade-rgb),.18)", color: "#7cd7ad" }}>AB</div>
            <div>
              <div className={styles.signName}>André Bento</div>
              <div className={styles.signRole}>Co-treasurer · drafted moderation + governance</div>
            </div>
            <div className={styles.signAv} style={{ background: "rgba(247,243,238,.10)", color: "rgba(247,243,238,.8)" }}>HF</div>
            <div>
              <div className={styles.signName}>Dra. Helena Faria</div>
              <div className={styles.signRole}>Independent auditor</div>
            </div>
          </div>
          <div className={styles.trActions}>
            <Button type="button" variant="primary" onClick={() => showToast("Downloading transparency-report-2025.pdf", "success")}>
              Download PDF (84 pages)
            </Button>
            <Button type="button" variant="ghost-dark" onClick={() => showToast("Downloading raw figures CSV", "success")}>
              Download raw CSV
            </Button>
          </div>
        </div>

        <div style={{ padding: "80px 0 40px" }} />
      </div>
    </PageShell>
  );
}
