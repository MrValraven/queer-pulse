import { fundSteps } from "./openCalls.data";
import styles from "./CinemaOpenCalls.module.css";

export function CinemaOpenCallsHowItWorks() {
  return (
    <section className={styles.how}>
      <div className={`wrap ${styles.howInner}`}>
        <h2>
          How the <em>fund</em> works
        </h2>
        <div className={styles.howSteps}>
          {fundSteps.map((step) => (
            <div key={step.num} className={styles.hwStep}>
              <div className={styles.hwNum}>
                <em>{step.num}</em>
              </div>
              <div className={styles.hwTitle}>
                {step.titlePre}
                <em>{step.titleEm}</em>
              </div>
              <div className={styles.hwBody}>{step.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
