import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Outro } from "../../shared/components/ui";
import { PageShell } from "../../shared/components/layout";
import styles from "./SecurityPage.module.css";

const PGP_KEY = `-----BEGIN PGP PUBLIC KEY BLOCK-----

mQINBGX4tQ8BEAC7k2rZvWJhxS3mPn...
[Key fingerprint: A7F2 B4E1 93DC 5201 8BF3
                  4A9E 2D70 C1F8 E6B4 3A29]

-----END PGP PUBLIC KEY BLOCK-----`;

const IN_SCOPE = [
  "queerpulse.pt and *.queerpulse.pt",
  "Authentication & session management",
  "Data access & privilege escalation",
  "Stored and reflected XSS",
  "CSRF on authenticated endpoints",
  "SQL injection",
  "Insecure direct object references",
  "Sensitive data exposure",
];

const OUT_SCOPE = [
  "Denial of service attacks",
  "Social engineering of our team",
  "Physical attacks against infrastructure",
  "Spam or rate-limiting bypass",
  "Third-party infrastructure (Hetzner, Postmark, Backblaze)",
  "Clickjacking on non-sensitive pages",
  "Missing security headers (report only)",
];

const STEPS = [
  {
    n: 1,
    title: "Acknowledgement",
    text: "We'll confirm receipt within 48 hours and let you know we're looking at it. We'll assign a reference number so we can track it together.",
    note: "Target: 48 hours",
  },
  {
    n: 2,
    title: "Assessment",
    text: "We'll investigate and assess the severity. We'll keep you updated and may ask follow-up questions. If we can't reproduce it, we'll tell you why.",
    note: "Target: 5 working days",
  },
  {
    n: 3,
    title: "Fix",
    text: "For confirmed vulnerabilities, we'll fix and deploy a patch. The timeline depends on severity — critical issues are treated as emergencies.",
    note: "Critical: <72h · High: <7 days · Medium/Low: next release",
  },
  {
    n: 4,
    title: "Disclosure",
    text: "We'll coordinate a disclosure timeline with you. We'll credit you in our security acknowledgements unless you prefer anonymity.",
    note: "Default: 90-day coordinated disclosure",
  },
];

const HALL = [
  { init: "AK", name: "Alex K.", note: "XSS · Mar 2025" },
  { init: "SM", name: "Sara M.", note: "IDOR · Jan 2025" },
  { init: "TB", name: "Tiago B.", note: "Auth bypass · Oct 2024" },
];

export function SecurityPage() {
  const { showToast } = useToast();

  function copyPGP() {
    navigator.clipboard
      .writeText(PGP_KEY)
      .then(() => showToast("PGP key copied.", "success"))
      .catch(() =>
        showToast("Copy failed — select and copy manually.", "error"),
      );
  }

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.heroEye}>Vulnerability disclosure</div>
          <h1 className={styles.heroH}>
            Found something?
            <br />
            <em>Tell us.</em>
          </h1>
          <p className={styles.heroSub}>
            We take security seriously. If you've found a vulnerability in
            QueerPulse, we want to know about it. This page explains how to
            report it, what to expect, and how we handle disclosures.
          </p>
        </div>
      </header>

      <main className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              <div className={styles.proseSection}>
                <div className={styles.proseEye}>Our commitment</div>
                <h2 className={styles.proseH}>
                  We won't <em>punish</em> good faith.
                </h2>
                <p className={styles.prose}>
                  Security researchers who report vulnerabilities in good faith
                  will not face legal action from us. We will not contact your
                  employer, ISP, or law enforcement unless you use your access
                  to harm members. We believe security research makes everyone
                  safer, and we're grateful when people take the time to report
                  what they find.
                </p>
                <p className={styles.prose}>
                  We ask that you give us reasonable time to fix an issue before
                  disclosing it publicly. In return, we commit to acknowledging
                  your report within 48 hours, keeping you updated on progress,
                  and crediting you in our security acknowledgements if you'd
                  like.
                </p>
              </div>

              <div className={styles.proseSection}>
                <div className={styles.proseEye}>Scope</div>
                <h2 className={styles.proseH}>
                  What's <em>in scope.</em>
                </h2>
                <div className={styles.scopeGrid}>
                  <div className={`${styles.scopeCard} ${styles.scopeIn}`}>
                    <div className={styles.scopeHead}>
                      <div className={styles.scopeDot} />
                      In scope
                    </div>
                    <ul className={styles.scopeList}>
                      {IN_SCOPE.map((i) => (
                        <li key={i}>{i}</li>
                      ))}
                    </ul>
                  </div>
                  <div className={`${styles.scopeCard} ${styles.scopeOut}`}>
                    <div className={styles.scopeHead}>
                      <div className={styles.scopeDot} />
                      Out of scope
                    </div>
                    <ul className={styles.scopeList}>
                      {OUT_SCOPE.map((i) => (
                        <li key={i}>{i}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className={styles.proseSection}>
                <div className={styles.proseEye}>Process</div>
                <h2 className={styles.proseH}>
                  What happens <em>after you report.</em>
                </h2>
                <div className={styles.timeline}>
                  {STEPS.map((s) => (
                    <div key={s.n} className={styles.tlStep}>
                      <div className={styles.tlN}>{s.n}</div>
                      <div>
                        <div className={styles.tlTitle}>{s.title}</div>
                        <div className={styles.tlText}>{s.text}</div>
                        <div className={styles.tlNote}>{s.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.proseSection}>
                <div className={styles.proseEye}>Acknowledgements</div>
                <h2 className={styles.proseH}>
                  Security <em>researchers</em> who've helped.
                </h2>
                <p className={styles.prose}>
                  We're grateful to the following researchers who disclosed
                  vulnerabilities responsibly. (Listed with permission.)
                </p>
                <div className={styles.hallGrid}>
                  {HALL.map((h) => (
                    <div key={h.init} className={styles.hallCard}>
                      <div className={styles.hallInit}>{h.init}</div>
                      <div className={styles.hallName}>{h.name}</div>
                      <div className={styles.hallNote}>{h.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.reportCard}>
                <h3>
                  Report a<br />
                  <em>vulnerability</em>
                </h3>
                <p>
                  Encrypt your report using our PGP key and email us. Please
                  include steps to reproduce, the potential impact, and any
                  proof of concept.
                </p>
                <Button
                  variant="ghost-dark"
                  href="mailto:security@queerpulse.pt"
                >
                  Email security team
                </Button>
              </div>
              <div className={styles.pgpCard}>
                <div className={styles.pgpLabel}>PGP public key</div>
                <pre className={styles.pgpBlock}>{PGP_KEY}</pre>
                <Button
                  variant="ghost"
                  onClick={copyPGP}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Copy key
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Outro
        title={
          <>
            Security is
            <br />
            <em>community work.</em>
          </>
        }
        sub="Thank you to everyone who helps keep QueerPulse safe."
      >
        <Button
          variant="primary"
          size="lg"
          href="mailto:security@queerpulse.pt"
        >
          Contact the security team
        </Button>
      </Outro>
    </PageShell>
  );
}
