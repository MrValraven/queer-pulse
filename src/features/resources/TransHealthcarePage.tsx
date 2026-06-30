import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { PATHS } from "./transHealthcare.data";
import {
  TransHealthcareHero,
  TransHealthcareJourney,
  TransHealthcareSidebar,
  TransHealthcareOutro,
} from "./TransHealthcareSections";
import styles from "./TransHealthcarePage.module.css";

export function TransHealthcarePage() {
  const [active, setActive] = useState("hrt-sns");
  const path = PATHS.find((p) => p.id === active) ?? PATHS[0]!;

  return (
    <PageShell>
      <TransHealthcareHero />

      <div className={styles.pathBar}>
        <div className={styles.pbInner}>
          {PATHS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={[styles.pathBtn, active === p.id && styles.pathBtnActive]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setActive(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="wrap">
        <div className={styles.body}>
          <TransHealthcareJourney path={path} />
          <TransHealthcareSidebar />
        </div>
      </div>

      <TransHealthcareOutro />
    </PageShell>
  );
}
