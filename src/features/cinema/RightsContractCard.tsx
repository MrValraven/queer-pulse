import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { contractPoints } from "./cinemaRights.data";
import styles from "./CinemaRightsPage.module.css";

function Check() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function RightsContractCard() {
  const { showToast } = useToast();
  return (
    <div className={styles.contractCard}>
      <div className={styles.ccInner}>
        <div className={styles.ccEb}>The contract, in plain language</div>
        <div className={styles.ccTitle}>
          What you agree to — and what <em>we</em> agree to.
        </div>
        <div className={styles.ccPoints}>
          {contractPoints.map((p) => (
            <div key={p} className={styles.ccPoint}>
              <Check />
              {p}
            </div>
          ))}
        </div>
        <div className={styles.ccActions}>
          <Button
            onClick={() =>
              showToast("The full contract PDF is coming soon.", "info")
            }
          >
            Download the full contract (PDF)
          </Button>
          <Button variant="ghost-dark" to={routes.cinemaSubmit}>
            Submit your film
          </Button>
        </div>
      </div>
    </div>
  );
}
