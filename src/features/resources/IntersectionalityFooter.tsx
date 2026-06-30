import { Link } from "react-router-dom";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import {
  COMMITMENTS,
  COMMUNITIES,
  CONTACT,
  FORUM,
  GOVERNANCE,
  ORGS,
} from "./intersectionality.data";
import styles from "./IntersectionalityPage.module.css";

export function IntersectionalityFooter() {
  return (
    <>
      <Reveal as="section" className={styles.commitSec}>
        <div className="wrap">
          <div className={styles.commitInner}>
            <div className={styles.commitLeft}>
              <h2>
                What QueerPulse <em>commits to.</em>
              </h2>
              <p>
                These are specific things, not aspirations. We're accountable to
                them — if we're not doing them, say so.
              </p>
              <div className={styles.commitBtns}>
                <Button to={GOVERNANCE} variant="ghost-dark">
                  How we're governed →
                </Button>
                <Button to={CONTACT} variant="ghost-dark">
                  Hold us accountable →
                </Button>
              </div>
            </div>
            <div className={styles.commitCards}>
              {COMMITMENTS.map((c, i) => (
                <Reveal key={c.title} delay={i * 70}>
                  <div className={styles.commitCardD}>
                    <div className={styles.ccdTitle}>{c.title}</div>
                    <div className={styles.ccdText}>{c.text}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal
        as="section"
        className={styles.sec}
        id="orgs"
        style={{ paddingBottom: 100 }}
      >
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              Organisations &amp; <em>resources</em>
            </h2>
            <p>
              External organisations relevant to the specific intersections on
              this page.
            </p>
          </div>
          <div className={styles.orgsGrid}>
            {ORGS.map((o, i) => (
              <Reveal key={o.name} delay={Math.min(i, 8) * 60}>
                <div className={styles.orgCard}>
                  <div className={styles.orgFocus}>{o.focus}</div>
                  <div className={styles.orgName}>{o.name}</div>
                  <div className={styles.orgText}>{o.text}</div>
                  <Link to={o.link.href} className={styles.orgLink}>
                    {o.link.label}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>

      <Outro
        title={
          <>
            All of you <em>belongs here.</em>
          </>
        }
        sub="Not the parts that are easiest to hold. All of it."
      >
        <Button to={COMMUNITIES} variant="primary" size="lg">
          Find your community group
        </Button>
        <Button to={FORUM} variant="ghost-dark" size="lg">
          Forum →
        </Button>
      </Outro>
    </>
  );
}
