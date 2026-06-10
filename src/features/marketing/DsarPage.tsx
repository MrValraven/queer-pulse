import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import styles from "./DsarPage.module.css";
import { Button } from '../../shared/components/ui'

const PRIVACY = linkToPath("QueerPulse Privacy.html");

interface Right {
  art: number;
  label: React.ReactNode;
  desc: string;
  formTitle: string;
  formSub: string;
}
const RIGHTS: Right[] = [
  { art: 15, label: <>Access · <em>copy of all</em></>, desc: "The full record of what we hold on you · including internal notes.", formTitle: "Article 15 · access", formSub: "We'll compile the full record of what we hold on you. Delivered as a downloadable archive, usually within 7 working days." },
  { art: 16, label: <>Rectification</>, desc: "Correct data we hold that is wrong, outdated, or incomplete.", formTitle: "Article 16 · rectification", formSub: "Tell us what's wrong and what it should be. We verify, then update — usually within 7 working days." },
  { art: 17, label: <>Erasure · <em>"forget me"</em></>, desc: "Permanently delete what we hold · within 30 days · with carve-outs.", formTitle: "Article 17 · erasure", formSub: "We'll permanently delete what we hold, within 30 days, except records we're legally required to retain." },
  { art: 21, label: <>Object · <em>specific use</em></>, desc: "Object to specific processing (e.g. analytics, partner sharing) without deleting.", formTitle: "Article 21 · objection", formSub: "Object to a specific kind of processing without deleting your account. Tell us which use you object to." },
];

const SCOPES = [
  { b: "Profile data", s: "Name, pronouns, city, bio, interests", checked: true },
  { b: "Connections & vouches", s: "Who you've vouched for · who's vouched for you" },
  { b: "Activity & posts", s: "What you've written · saved · RSVP'd to" },
  { b: "Billing & receipts", s: "Receipts, donations, membership history" },
  { b: "Moderation records", s: "Any reports, warnings, or appeals about you" },
];

export function DsarPage() {
  const { showToast } = useToast();
  const [art, setArt] = useState(16);
  const [scopes, setScopes] = useState<boolean[]>(SCOPES.map((s) => !!s.checked));
  const right = RIGHTS.find((r) => r.art === art)!;

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={PRIVACY} className={styles.back}>
          ← Privacy
        </Link>
        <div className={styles.eyebrow}>GDPR · Data Subject Access Request</div>
        <h1 className={styles.h1}>
          Your data, <em>your rights.</em>
        </h1>
        <p className={styles.lead}>
          Use this form to exercise any of the four GDPR rights below. Requests are
          handled by a real person on the privacy team, <b>not automated</b>. We respond
          within <em>30 days</em>, usually within 7.
        </p>

        <div className={styles.gdprStrip}>
          <b>Quick win:</b> if you only want a copy of your data, the self-serve data
          export is faster — instant download, no review required. Use this form for
          everything else.
        </div>

        <div className={styles.rightLabel}>Which right are you exercising?</div>
        <div className={styles.rightGrid}>
          {RIGHTS.map((r) => (
            <button
              key={r.art}
              type="button"
              className={[styles.rightCard, art === r.art && styles.rightCardSelected]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                setArt(r.art);
                showToast(`Showing form for Article ${r.art}`, "info");
              }}
            >
              <div className={styles.art}>Art. {r.art}</div>
              <h3>{r.label}</h3>
              <p>{r.desc}</p>
            </button>
          ))}
        </div>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            showToast("Request submitted · ref QP-DSAR-2026-0019", "success", 3500);
          }}
        >
          <h2>
            Request · <em>{right.formTitle}</em>
          </h2>
          <p className={styles.formSub}>{right.formSub}</p>

          <div className={styles.field}>
            <label>Member account · pre-filled from your session</label>
            <input type="text" value="tomas@example.com · Tomás Mendes" readOnly style={{ opacity: 0.7 }} />
          </div>

          <div className={styles.field}>
            <label>What needs to change</label>
            <textarea placeholder="My recorded city is Lisbon. It should be Porto, where I've been based since March 2026. This affects which city's gatherings I see by default." />
            <div className={styles.fieldHint}>
              Be specific. Quote the existing value if you can. We'll send you a
              confirmation before any change goes live.
            </div>
          </div>

          <div className={styles.field}>
            <label>Which records · scope</label>
            <div className={styles.scopeList}>
              {SCOPES.map((sc, i) => (
                <label
                  key={sc.b}
                  className={[styles.scopeRow, scopes[i] && styles.scopeRowChecked]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <input
                    type="checkbox"
                    checked={scopes[i]}
                    onChange={() =>
                      setScopes((prev) => prev.map((v, j) => (j === i ? !v : v)))
                    }
                  />
                  <div>
                    <b>{sc.b}</b>
                    <span>{sc.s}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label>
              Supporting documents <span className={styles.opt}>— optional · helpful if available</span>
            </label>
            <input type="file" multiple style={{ padding: "8px 12px", background: "transparent", borderStyle: "dashed" }} />
            <div className={styles.fieldHint}>
              For rectification: anything showing the correct value (e.g. utility bill
              for city). <em>Documents are deleted after verification.</em>
            </div>
          </div>

          <div className={styles.field}>
            <label>Anything we should know · context</label>
            <textarea placeholder="Optional · e.g. if you need a faster response for a specific reason" />
          </div>

          <div className={styles.legalStrip}>
            <b>Legal note:</b> certain records cannot be erased even on request —
            moderation case files retained for 36 months under Constitution §8·3,
            financial records retained for 10 years under Portuguese tax law, and content
            authored by you that has been quoted by other members under their own
            copyright. <Link to={`${PRIVACY}#retention`}>Full retention schedule →</Link>
          </div>

          <div className={styles.actions}>
            <div className="info">
              Goes directly to the privacy team. Response within <b>30 days max</b>,
              usually 7. You'll get a written reply by email.
            </div>
            <Button variant="primary" type="submit">
              Submit request
            </Button>
          </div>
        </form>

        <div className={styles.pastH}>Your past requests</div>
        <div className={styles.pastRow}>
          <span className={styles.num}>QP-DSAR-2026-018</span>
          <span>
            <b>Article 15 · access</b> · submitted 14 Mar 2026 · responded 17 Mar (3 days)
          </span>
          <span className={`${styles.status} ${styles.statusDone}`}>Resolved</span>
        </div>
        <div className={styles.pastRow}>
          <span className={styles.num}>QP-DSAR-2025-184</span>
          <span>
            <b>Article 21 · object to analytics</b> · submitted 11 Nov 2025 · responded 13 Nov
          </span>
          <span className={`${styles.status} ${styles.statusDone}`}>Resolved</span>
        </div>
      </div>
    </PageShell>
  );
}
