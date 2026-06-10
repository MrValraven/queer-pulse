import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import styles from "./AnnualAssemblyPage.module.css";
import { Button } from '../../shared/components/ui'

type Vote = "yes" | "no" | "abstain" | null;

const AGENDA = [
  { h: "10", m: ":00", title: <>Welcome &amp; ground rules</>, sub: "Marta opens · what's binding, what's discussion, what's tradition. Coffee.", tag: "Open", tagClass: "tagReport" },
  { h: "10", m: ":30", title: <>2025 review · Catarina &amp; André</>, sub: "Co-treasurers walk the transparency report. Q&A.", tag: "Report", tagClass: "tagReport" },
  { h: "11", m: ":30", title: <>Resolutions 1–4 · <em>budget &amp; reserves</em></>, sub: "2027 budget, reserve target, micro-grant cap, ILGA payment renewal.", tag: "Vote", tagClass: "tagVote" },
  { h: "13", m: ":00", title: <>Lunch · Sandra's catering</>, sub: "Pastéis, salada, sopa. Vegan available. Conversations happen here.", tag: "Break", tagClass: "tagBreak" },
  { h: "14", m: ":30", title: <>Resolutions 5–7 · <em>code &amp; manifesto</em></>, sub: "v2.2 amendments to the Code of Conduct, new clause in §06, manifesto stanza 4 wording.", tag: "Vote", tagClass: "tagVote" },
  { h: "16", m: ":00", title: <>Open floor · expansion to Porto</>, sub: "Discussion, no vote. Porto launches in August; this is a check-in.", tag: "Discuss", tagClass: "tagDiscuss" },
  { h: "17", m: ":30", title: <>Day 1 close · drinks &amp; dinner across the road</>, sub: "Optional. We hold the table at Café Beirão until 22:00.", tag: "Open", tagClass: "tagReport" },
  { h: "10", m: ":00", title: <>Day 2 · Resolutions 8–11 · <em>circles &amp; partners</em></>, sub: "Standing-circle terms, ILGA renewal scope, new partner with Clínica do Largo.", tag: "Vote", tagClass: "tagVote" },
  { h: "12", m: ":30", title: <>Member proposals · open floor</>, sub: "Anyone with a 2-page proposal can pitch · 5 min each, no vote · proposals that gain traction join the next agenda.", tag: "Discuss", tagClass: "tagDiscuss" },
  { h: "14", m: ":00", title: <>Tallying, ratification &amp; close</>, sub: "We read out the results, sign the resolutions, and close the assembly.", tag: "Close", tagClass: "tagReport" },
];

interface Resolution {
  num: React.ReactNode;
  title: React.ReactNode;
  threshold: string;
  desc: React.ReactNode;
  yesLabel: string;
  bar: { y: number; n: number; a: number };
  tally: { yes: string; no: string; abstain: string; extra?: React.ReactNode };
  defaultVote?: Vote;
}
const RESOLUTIONS: Resolution[] = [
  { num: <>R<em>·01</em> · Approve 2027 budget</>, title: null, threshold: "SIMPLE MAJORITY", desc: <>Approve the proposed 2027 budget of <b>€312k</b> in total spend, including a <em>22% allocation to community staff</em> and €40k for Porto launch costs. Full breakdown in the appendix.</>, yesLabel: "Yes · approve", bar: { y: 78, n: 12, a: 10 }, tally: { yes: "243 · 78%", no: "37 · 12%", abstain: "32 · 10%", extra: <span style={{ marginLeft: "auto", color: "var(--ink-40)" }}>312 of 1,847 voted</span> }, defaultVote: "yes" },
  { num: <>R<em>·02</em> · Raise the micro-grant cap to <em>€300</em></>, title: null, threshold: "SIMPLE MAJORITY", desc: <>Increase the per-grant cap from €200 to €300, with the additional headroom funded by the 2025 surplus. Median grant in 2025 was €128; this raises the ceiling for one-off larger needs.</>, yesLabel: "Yes · approve", bar: { y: 84, n: 6, a: 10 }, tally: { yes: "258 · 84%", no: "19 · 6%", abstain: "32 · 10%" } },
  { num: <>R<em>·05</em> · Code of Conduct v2.2 · <em>off-platform clause</em></>, title: null, threshold: "SUPERMAJORITY · 60%", desc: <>Adopt the proposed §06 clarification on off-platform conduct. The amendment narrows "material harm" to specific documented harm to QP members, and adds an explicit "criticism of QueerPulse" carve-out. <em>Open comment period closed 1 Nov.</em></>, yesLabel: "Yes · adopt", bar: { y: 62, n: 21, a: 17 }, tally: { yes: "192 · 62%", no: "67 · 21%", abstain: "53 · 17%", extra: <span style={{ marginLeft: "auto", color: "var(--jade)", fontWeight: 700 }}>Threshold met · would pass</span> } },
];

const HISTORY = [
  { y: "5", title: "Eleven resolutions · nine passed", sub: "Notable: §06 off-platform first added · Porto green-lit · solidarity rate codified" },
  { y: "4", title: "Eight resolutions · seven passed", sub: "First assembly to ratify the Code of Conduct. Sustainer pricing set at €96." },
  { y: "3", title: "Founding assembly · five resolutions", sub: "The constitution was ratified. ILGA partnership signed off." },
];

function ResolutionCard({ res }: { res: Resolution }) {
  const { showToast } = useToast();
  const [vote, setVote] = useState<Vote>(res.defaultVote ?? null);
  const cast = (v: Vote) => {
    setVote(v);
    showToast("Vote recorded · you can change it any time", "success");
  };
  const cls = (v: Vote) =>
    [styles.voteBtn, vote === v && styles[v === "yes" ? "votedYes" : v === "no" ? "votedNo" : "votedAbstain"]]
      .filter(Boolean)
      .join(" ");
  return (
    <div className={styles.resCard}>
      <div className={styles.resH}>
        <h3>{res.num}</h3>
        <span className={styles.resNum}>{res.threshold}</span>
      </div>
      <p className={styles.resDesc}>{res.desc}</p>
      <div className={styles.resVoteRow}>
        <button type="button" className={cls("yes")} onClick={() => cast("yes")}>
          {res.yesLabel}
        </button>
        <button type="button" className={cls("no")} onClick={() => cast("no")}>
          No · reject
        </button>
        <button type="button" className={cls("abstain")} onClick={() => cast("abstain")}>
          Abstain
        </button>
      </div>
      <div className={styles.resBar}>
        <span className={styles.y} style={{ width: `${res.bar.y}%` }} />
        <span className={styles.n} style={{ width: `${res.bar.n}%` }} />
        <span className={styles.a} style={{ width: `${res.bar.a}%` }} />
      </div>
      <div className={styles.resTally}>
        <span className={styles.jade}>
          Yes <b>{res.tally.yes.split(" · ")[0]}</b> · {res.tally.yes.split(" · ")[1]}
        </span>
        <span className={styles.accent}>
          No <b>{res.tally.no.split(" · ")[0]}</b> · {res.tally.no.split(" · ")[1]}
        </span>
        <span>
          Abstain <b>{res.tally.abstain.split(" · ")[0]}</b> · {res.tally.abstain.split(" · ")[1]}
        </span>
        {res.tally.extra}
      </div>
    </div>
  );
}

export function AnnualAssemblyPage() {
  const { showToast } = useToast();
  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>Annual Assembly · 14 November 2026 · Lisbon</div>
          <h1 className={styles.h1}>
            Two days, eleven <em>resolutions.</em>
          </h1>
          <p className={styles.dek}>
            QueerPulse's binding annual gathering. Where the manifesto gets revised, the
            budget gets approved, and any decision that can't be made by a circle goes to
            a member vote. <em>You can attend in person, online, or just read the minutes
            after</em> — but your vote counts the same.
          </p>
          <div className={styles.meta}>
            <span>
              <b>14 — 15 Nov</b>Two days · Sat &amp; Sun
            </span>
            <span>
              <b>
                <em>Atelier Pulso</em>
              </b>
              + video link
            </span>
            <span>
              <b>1,847</b>Members eligible to vote
            </span>
            <span>
              <b>
                <em>184</em>
              </b>
              Quorum · met
            </span>
          </div>
          <div className={styles.ctaRow}>
            <Button href="#vote" variant="primary">
              Vote now · 11 resolutions
            </Button>
            <Button type="button" variant="ghost-dark" onClick={() => showToast("RSVP saved", "success")}>
              RSVP in-person · 87 / 120 spots
            </Button>
            <Button type="button" variant="ghost-dark" onClick={() => showToast("Opening Zoom link…", "info")}>
              Join online · Zoom link
            </Button>
          </div>
        </div>
      </section>

      <div className={styles.page}>
        <section className={styles.sec}>
          <h2>
            The <em>agenda</em>
          </h2>
          <p className={styles.subText}>
            Roughly the order. Times are guidelines. We've never finished on time and we
            don't expect to.
          </p>
          <div className={styles.agenda}>
            {AGENDA.map((a, i) => (
              <div className={styles.agRow} key={i}>
                <div className={styles.agTime}>
                  {a.h}
                  <em>{a.m}</em>
                </div>
                <div className={styles.agInfo}>
                  <b>{a.title}</b>
                  <span>{a.sub}</span>
                </div>
                <span className={`${styles.agTag} ${styles[a.tagClass]}`}>{a.tag}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.sec} id="vote">
          <h2>
            Vote · <em>open until 14 Nov · 14:00</em>
          </h2>
          <p className={styles.subText}>
            Everyone votes — whether you're attending or not. Cast your vote any time; you
            can change it until the close. <em>One vote per member, per resolution.</em>
          </p>
          <div className={styles.quorumStrip}>
            <b>Quorum:</b> 184 votes required to validate a resolution.{" "}
            <em>Currently at 312 votes cast</em> — quorum met. <b>Yes/no thresholds:</b>{" "}
            simple majority for budget items; 60% supermajority for Code of Conduct &amp;
            manifesto changes.
          </div>
          {RESOLUTIONS.map((r, i) => (
            <ResolutionCard res={r} key={i} />
          ))}
          <p className={styles.showMore}>
            <a onClick={() => showToast("Loading 8 more resolutions…", "info")}>
              Show 8 more resolutions →
            </a>
          </p>
        </section>

        <div className={styles.attendCard}>
          <div>
            <h3>Can't make it in person?</h3>
            <p>
              Vote online any time until 14 Nov · 14:00. Watch the live stream of the
              in-person sessions with chat. Read the minutes the following Friday.
            </p>
          </div>
          <div className={styles.attendActions}>
            <Button href="#vote" variant="primary">
              Cast your vote
            </Button>
            <Button type="button" variant="ghost-dark" onClick={() => showToast("Opening live stream…", "info")}>
              Live stream link
            </Button>
          </div>
        </div>

        <section className={styles.sec}>
          <h2>
            Past <em>assemblies</em>
          </h2>
          <p className={styles.subText}>
            Every Annual Assembly's resolutions and minutes are public.
          </p>
          {HISTORY.map((h) => (
            <div className={styles.historyRow} key={h.y}>
              <div className={styles.histY}>
                202<em>{h.y}</em>
              </div>
              <div className={styles.histInfo}>
                <b>{h.title}</b>
                <span>{h.sub}</span>
              </div>
              <a className={styles.histLink} onClick={() => showToast("Opening minutes…", "info")}>
                Minutes →
              </a>
            </div>
          ))}
        </section>

        <div className={styles.footer}>
          Questions about your eligibility? <a href="#">Help →</a> · Want to submit a
          member proposal for next year? <a href="#">Write to us</a>.
        </div>
      </div>
    </PageShell>
  );
}
