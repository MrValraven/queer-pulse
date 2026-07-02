import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import styles from "./GrantsPage.module.css";

export function GrantsSidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sideCard}>
        <h4>
          Our <em>Micro Grants</em>
        </h4>
        <p>
          QueerPulse runs its own micro grant programme (€200–€2,000) for
          community projects in Lisbon. Faster and simpler than most external
          grants.
        </p>
        <Link to={routes.grants}>Apply now →</Link>
      </div>
      <div className={styles.sideCard}>
        <h4>Skills Exchange</h4>
        <p>
          If you need support but grants feel too formal, the barter board
          connects members who can swap skills — no money involved.
        </p>
        <Link to={routes.barter}>Explore the exchange →</Link>
      </div>
      <div
        className={styles.sideCard}
        style={{
          background: "rgba(var(--jade-rgb),.05)",
          borderColor: "rgba(var(--jade-rgb),.2)",
        }}
      >
        <h4>
          Get <em>application help</em>
        </h4>
        <p>
          Members with grant-writing experience offer workshops and one-to-one
          support via the skills exchange.
        </p>
        <Link to={routes.skills}>Find a mentor →</Link>
      </div>
    </aside>
  );
}
