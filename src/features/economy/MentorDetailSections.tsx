import type { Mentor } from "./mentorship.data";
import styles from "./MentorDetailPage.module.css";

/** Main column: how they mentor, who they fit, and the step-by-step process. */
export function MentorDetailSections({
  m,
  first,
}: {
  m: Mentor;
  first: string;
}) {
  const fit = [
    { label: "You'd benefit if…", text: m.fitFor[0] },
    { label: "And ideally…", text: m.fitFor[1] },
    { label: "And maybe…", text: m.fitFor[2] },
    { label: "Not the right call if…", text: m.fitNot[0] },
  ].filter((x) => x.text);

  return (
    <main>
      <section className={styles.sec}>
        <h2>
          How {first} <em>mentors</em>
        </h2>
        {m.howParas.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </section>

      <section className={styles.sec}>
        <h2>
          Who you'd <em>be a fit for</em>
        </h2>
        <div className={styles.whatGrid}>
          {fit.map((item) => (
            <div key={item.label} className={styles.what}>
              <b>{item.label}</b>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.sec}>
        <h2>
          The <em>process</em>, step by step
        </h2>
        <div>
          {m.process.map((step) => (
            <div key={step.num} className={styles.procRow}>
              <div className={styles.procNum}>
                {step.num.charAt(0)}
                <em>{step.num.charAt(1)}</em>
              </div>
              <div>
                <b>{step.title}</b>
                <span>{step.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
