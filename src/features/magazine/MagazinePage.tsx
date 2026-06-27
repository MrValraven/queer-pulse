import { PageShell } from "../../shared/components/layout";
import { MagazineCover } from "./MagazineCover";
import { MagazineMasthead } from "./MagazineMasthead";
import { MagazineSections } from "./MagazineSections";
import styles from "./MagazinePage.module.css";
import { NAV } from "./magazinePage.data";

export function MagazinePage() {
  return (
    <PageShell>
      <MagazineMasthead active="current" />

      <div className="wrap">
        <nav className={styles.inIssue} aria-label="In this issue">
          <span className={styles.inIssueLabel}>In this issue</span>
          <span className={styles.inIssueLinks}>
            {NAV.map((label) => (
              <a
                key={label}
                className={styles.inIssueLink}
                href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {label}
              </a>
            ))}
          </span>
        </nav>
      </div>

      <MagazineCover />

      <MagazineSections />
    </PageShell>
  );
}
