import { Link } from "react-router-dom";
import { Button, Outro } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { CONTACTS, type Path } from "./transHealthcare.data";
import styles from "./TransHealthcarePage.module.css";

export function TransHealthcareHero() {
  return (
    <header className={styles.hero}>
      <div className="wrap">
        <div className={styles.eye}>Trans Healthcare · Portugal</div>
        <h1 className={styles.title}>
          Your journey,
          <br />
          <em>step by step.</em>
        </h1>
        <p className={styles.sub}>
          How to access gender-affirming healthcare in Portugal — through the
          SNS or privately. Legal name change. What to bring, who to call, what
          to expect.
        </p>
        <p className={styles.disclaimer}>
          This guide reflects the system as of June 2026. Always verify current
          waiting times and procedures with ILGA Portugal or your GP. This is
          community knowledge, not legal or medical advice.
        </p>
      </div>
    </header>
  );
}

export function TransHealthcareJourney({ path }: { path: Path }) {
  return (
    <div className={styles.journey}>
      {path.sections.map((sec) => (
        <div className={styles.jSection} key={sec.title}>
          <div className={styles.jSectionTitle}>{sec.title}</div>
          {sec.steps.map((s) => (
            <div className={styles.step} key={s.n}>
              <div className={styles.stepNum}>{s.n}</div>
              <div className={styles.stepBody}>
                <div className={styles.stepTitle}>{s.title}</div>
                <div className={styles.stepDesc}>{s.desc}</div>
                <div className={styles.stepMeta}>
                  {s.time && (
                    <span className={`${styles.metaPill} ${styles.pillTime}`}>
                      ⏱ {s.time}
                    </span>
                  )}
                  {s.cost && (
                    <span className={`${styles.metaPill} ${styles.pillCost}`}>
                      € {s.cost}
                    </span>
                  )}
                </div>
                {s.tip && <div className={styles.stepTip}>{s.tip}</div>}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function TransHealthcareSidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sbCard}>
        <div className={styles.sbcTitle}>Key contacts</div>
        {CONTACTS.map((c) => (
          <div className={styles.sbcItem} key={c.org}>
            <div className={styles.sbcOrg}>{c.org}</div>
            <div className={styles.sbcRole}>{c.role}</div>
            <div className={styles.sbcContact}>{c.contact}</div>
          </div>
        ))}
      </div>
      <div className={styles.sbAlert}>
        <div className={styles.sbAlertTitle}>Community tip</div>
        <div className={styles.sbAlertBody}>
          ILGA Portugal offers free legal accompaniment for trans people
          navigating the SNS system. You do not have to do this alone — call
          them before your first appointment.
        </div>
      </div>
      <div className={styles.sbCard}>
        <div className={styles.sbcTitle}>Related on QueerPulse</div>
        <div className={styles.sbcItem}>
          <Link to={routes.solidarity} className={styles.sbcLink}>
            Solidarity Pricing Registry →
          </Link>
          <div className={styles.sbcRole}>
            Trans-affirming GPs, psychiatrists
          </div>
        </div>
        <div className={styles.sbcItem}>
          <Link to={routes.legal} className={styles.sbcLink}>
            Legal Resources →
          </Link>
          <div className={styles.sbcRole}>Name change documents</div>
        </div>
        <div className={styles.sbcItem}>
          <Link to={routes.mentalHealth} className={styles.sbcLink}>
            Mental Health →
          </Link>
          <div className={styles.sbcRole}>Support through the process</div>
        </div>
      </div>
    </aside>
  );
}

export function TransHealthcareOutro() {
  return (
    <Outro
      title={
        <>
          You deserve <em>good care.</em>
        </>
      }
      sub="The QueerPulse community includes trans-affirming GPs, therapists, and legal professionals. You do not have to navigate this alone."
    >
      <Button to={routes.solidarity} variant="primary" size="lg">
        Find solidarity pricing
      </Button>
    </Outro>
  );
}
