import { Link } from "react-router-dom";
import { Reveal, SectionHead } from "../../../shared/components/ui";
import { linkToPath } from "../../../app/routeMap";
import { painPoints } from "../data/painPoints";
import styles from "./PainPoints.module.css";

export function PainPoints() {
  return (
    <section className={styles.pain} id="why">
      <div className="wrap">
        <Reveal>
          <SectionHead
            className={styles.head}
            title={
              <>
                We built this because we <em>felt these gaps.</em>
              </>
            }
            subtitle="Real questions the community kept asking. QueerPulse is the answer we wanted to exist."
          />
        </Reveal>

        <div className={styles.grid}>
          {painPoints.map((point, index) => (
            <Reveal
              key={point.headingPrefix}
              className={styles.card}
              delay={index * 40}
            >
              <div className={styles.question}>{point.question}</div>
              <h3 className={styles.title}>
                {point.headingPrefix}
                <em>{point.accent}</em>
                {point.headingSuffix}
              </h3>
              <p className={styles.body}>{point.body}</p>
              <Link to={linkToPath(point.href)} className={styles.cta}>
                {point.ctaLabel}
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
