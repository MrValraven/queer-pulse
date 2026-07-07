import { FaRainbow } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { SectionHead } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useCompanies } from "./api/useCompanies";

import styles from "./JobsPage.module.css";

/**
 * The "employers we trust" grid at the foot of the job board. Sources its
 * companies from `useCompanies` — demo returns the mock EMPLOYERS registry
 * (slugs pre-resolved), live calls GET /companies.
 */
export function JobsEmployers() {
  const { data: employers = [] } = useCompanies();

  return (
    <section className={styles.employers}>
      <div className="wrap">
        <SectionHead
          title={
            <>
              Queer-run employers <em>we trust</em>
            </>
          }
          subtitle="These organisations are run by or for the queer community. Working here means your money stays in the network."
        />
        <div className={styles.empGrid}>
          {employers.map((emp) => (
            <Link
              key={emp.slug ?? emp.name}
              to={emp.slug ? `${routes.company}/${emp.slug}` : routes.jobs}
              className={styles.empCard}
            >
              <div
                className={styles.empLogo}
                style={{ background: emp.bg, color: emp.text }}
              >
                {emp.logo}
              </div>
              <div className={styles.empName}>{emp.name}</div>
              <div className={styles.empType}>{emp.type}</div>
              <span
                className={styles.empBadge}
                style={{ background: emp.badgeBg, color: emp.badgeText }}
              >
                {emp.qr ? (
                  <>
                    <FaRainbow />{" "}
                  </>
                ) : (
                  ""
                )}
                {emp.badge}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
