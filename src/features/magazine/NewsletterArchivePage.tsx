import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import styles from "./NewsletterArchivePage.module.css";
import { Button } from '../../shared/components/ui'

type Stream = "dispatch" | "long" | "trans";
interface Row {
  stream: Stream;
  num: string;
  numLabel: string;
  title: React.ReactNode;
  ed?: string;
  dek: string;
  date: string;
  streamMeta: string;
  opens: string;
  rate: string;
}
interface Year {
  label: React.ReactNode;
  meta: string;
  rows: Row[];
}

const YEARS: Year[] = [
  {
    label: <>2026 <em>· in flight</em></>,
    meta: "22 issues sent so far · open rate averaging 58%",
    rows: [
      { stream: "dispatch", num: "52", numLabel: "Dispatch", title: <>The summer slowdown <em>edition.</em></>, ed: "Just sent", dek: "Summer reading list, July gatherings calendar, and the new vetted-therapist additions.", date: "8 Jun 2026", streamMeta: "Community · fortnightly", opens: "8.4k", rate: "opens · 61%" },
      { stream: "long", num: "18", numLabel: "Long", title: <>Five things I learned <em>navigating Lisbon's trans health system.</em></>, dek: "The full long-form sent direct from Sara Pinheiro — Issue 09 cover story, distributed as the monthly long-reads pick.", date: "6 Jun 2026", streamMeta: "Long reads · monthly", opens: "2.1k", rate: "opens · 72%" },
      { stream: "dispatch", num: "51", numLabel: "Dispatch", title: <>Pride month, and the <em>boring stuff that matters.</em></>, dek: "March schedule, legal observer recruitment, an open call for 2026 grants. Plus a small piece on the Mercearia Rosa.", date: "25 May 2026", streamMeta: "Community · fortnightly", opens: "8.3k", rate: "opens · 59%" },
      { stream: "trans", num: "08", numLabel: "Trans Hub", title: <>The 2026 vetted-providers list — <em>refreshed.</em></>, dek: "47 names, all re-checked in 90 days. Includes new endocrinology and gynaecology entries. Anonymised case notes.", date: "20 May 2026", streamMeta: "Trans Hub · monthly", opens: "1.6k", rate: "opens · 74%" },
      { stream: "dispatch", num: "50", numLabel: "Dispatch", title: <>Fiftieth dispatch. A little <em>thank you.</em></>, dek: "A two-year retrospective, plus the usual: gatherings, jobs, new members, what we're reading.", date: "11 May 2026", streamMeta: "Community · fortnightly", opens: "8.4k", rate: "opens · 68%" },
      { stream: "long", num: "17", numLabel: "Long", title: <>What the SNS gets right (and <em>where it still leaves you waiting</em>).</>, dek: "Sara Pinheiro's six-month report from three regional clinics.", date: "8 May 2026", streamMeta: "Long reads · monthly", opens: "2.0k", rate: "opens · 69%" },
      { stream: "dispatch", num: "49", numLabel: "Dispatch", title: <>May Day. The queer history of <em>the trade union.</em></>, dek: "A short reading list, this year's march logistics, and the Caregivers cohort opening soon.", date: "27 Apr 2026", streamMeta: "Community · fortnightly", opens: "8.2k", rate: "opens · 57%" },
    ],
  },
  {
    label: "2025",
    meta: "38 issues · biggest single open day was the launch of Issue 06",
    rows: [
      { stream: "dispatch", num: "30", numLabel: "Dispatch", title: <>The end-of-year issue.</>, dek: "2025 in numbers, the Year in Review (with its caveats), and what's planned for 2026.", date: "22 Dec 2025", streamMeta: "Community", opens: "7.6k", rate: "opens · 64%" },
      { stream: "long", num: "12", numLabel: "Long", title: <>The visa queue is <em>a kind of closet.</em></>, dek: "Three queer migrants on what it means to wait for a residency permit.", date: "18 Dec 2025", streamMeta: "Long reads", opens: "1.9k", rate: "opens · 71%" },
      { stream: "dispatch", num: "29", numLabel: "Dispatch", title: <>Cold weather, <em>warm rooms.</em></>, dek: "A list of the indoor gatherings, the chosen-family Christmas dinner, and the open clinic schedule.", date: "8 Dec 2025", streamMeta: "Community", opens: "7.4k", rate: "opens · 58%" },
      { stream: "dispatch", num: "28", numLabel: "Dispatch", title: <>Trans Day of Remembrance.</>, dek: "The names we're holding, the gathering, and a quiet ask.", date: "20 Nov 2025", streamMeta: "Community", opens: "7.3k", rate: "opens · 73%" },
      { stream: "trans", num: "04", numLabel: "Trans Hub", title: <>Hormone supply shortages — <em>what to do.</em></>, dek: "A practical guide, plus the pharmacist we trust.", date: "3 Nov 2025", streamMeta: "Trans Hub", opens: "1.4k", rate: "opens · 78%" },
    ],
  },
];

const TABS: { id: Stream | "all"; label: string; count: string }[] = [
  { id: "all", label: "All", count: "78" },
  { id: "dispatch", label: "Community dispatch", count: "52" },
  { id: "long", label: "Long reads · monthly", count: "18" },
  { id: "trans", label: "Trans Hub bulletin", count: "8" },
];

const STREAM_CLASS: Record<Stream, string> = {
  dispatch: "",
  long: "streamLong",
  trans: "streamTrans",
};

export function NewsletterArchivePage() {
  const { showToast } = useToast();
  const [stream, setStream] = useState<Stream | "all">("all");

  return (
    <PageShell>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>Newsletter archive · since 2024</div>
            <h1 className={styles.h1}>
              Every email we've <em>sent.</em>
            </h1>
            <p className={styles.dek}>
              Three newsletters: a fortnightly community dispatch, a monthly long-read
              companion, and a Trans Hub bulletin. All free. Read any of them here — or
              subscribe and we'll send them straight.
            </p>
            <form
              className={styles.sub}
              onSubmit={(e) => {
                e.preventDefault();
                showToast("Almost there — check your inbox", "success");
              }}
            >
              <input type="email" placeholder="you@example.com" required />
              <Button variant="primary" type="submit">
                Subscribe →
              </Button>
            </form>
            <p className={styles.subFoot}>
              Pick which newsletters you want in step 2. Unsubscribe one-tap from any
              email. We never share your address.
            </p>
            <div className={styles.stats}>
              <span>
                <b>
                  <em>78</em>
                </b>
                Issues in the archive
              </span>
              <span>
                <b>3</b>Active newsletter streams
              </span>
              <span>
                <b>8,420</b>Subscribers across all streams
              </span>
              <span>
                <b>
                  <em>2</em>
                </b>
                Languages · EN &amp; PT
              </span>
            </div>
          </div>
        </section>

        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={[styles.tab, stream === t.id && styles.tabActive]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setStream(t.id)}
            >
              {t.label} <span className={styles.badge}>{t.count}</span>
            </button>
          ))}
        </div>

        <section className={styles.latest}>
          <div className={styles.latestCard}>
            <div className={styles.latestInner}>
              <div>
                <div className={styles.latestMeta}>
                  Latest · sent yesterday · 8,420 inboxes
                </div>
                <h2>
                  The summer slowdown <em>edition.</em>
                </h2>
                <p>
                  What we're reading, who's hosting in July, the new vetted-therapist
                  list, and the back room of Café Beirão schedule. Plus: Sara's cover
                  piece pulled into a shorter take.
                </p>
                <div className={styles.latestInfo}>
                  <span>
                    Community dispatch · <b>Issue 52</b>
                  </span>
                  <span>
                    Sent <b>8 Jun 2026</b>
                  </span>
                  <span>
                    Read time <b>~ 8 min</b>
                  </span>
                  <span>
                    Open rate <b>61%</b>
                  </span>
                </div>
              </div>
              <Button
                type="button" variant="primary"
                onClick={() => showToast("Opening in browser…", "info")}
              >
                Read in browser →
              </Button>
            </div>
          </div>
        </section>

        <section className={styles.list}>
          {YEARS.map((y, yi) => (
            <div key={yi}>
              <div className={styles.year}>
                <h3>{y.label}</h3>
                <div className={styles.yearMeta}>{y.meta}</div>
              </div>
              {y.rows
                .filter((r) => stream === "all" || r.stream === stream)
                .map((r, ri) => (
                  <button
                    type="button"
                    key={ri}
                    className={[styles.row, STREAM_CLASS[r.stream] && styles[STREAM_CLASS[r.stream]]]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => showToast("Opening newsletter…", "info")}
                    style={{ textAlign: "left", border: "none", background: "none", width: "100%", font: "inherit", cursor: "pointer" }}
                  >
                    <div>
                      <div className={styles.rowNum}>
                        №<em>{r.num}</em>
                      </div>
                      <div className={styles.rowNumL}>{r.numLabel}</div>
                    </div>
                    <div>
                      <div className={styles.rowH}>
                        {r.title}
                        {r.ed && <span className={styles.ed}>{r.ed}</span>}
                      </div>
                      <div className={styles.rowDek}>{r.dek}</div>
                    </div>
                    <div className={styles.rowMeta}>
                      <b>{r.date}</b>
                      <span>{r.streamMeta}</span>
                    </div>
                    <div className={styles.rowStats}>
                      <b>{r.opens}</b>
                      <span className={styles.label}>{r.rate}</span>
                    </div>
                  </button>
                ))}
            </div>
          ))}
          <div className={styles.loadMore}>
            <Button
              type="button" variant="ghost"
              onClick={() => showToast("Loading older issues…", "info")}
            >
              Load 66 older issues
            </Button>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
