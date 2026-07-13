import { FiAlertTriangle } from "react-icons/fi";
import { Button } from "../ui/Button";
import { routes } from "../../../app/routeMap";
import styles from "./ErrorFallback.module.css";

interface ErrorFallbackProps {
  onReset: () => void;
  /** A server correlation id or monitor event id, shown for support handoff. */
  referenceId?: string | null;
  /** "route" keeps the app frame around it; "app" is the whole-page catch. */
  level?: "app" | "route";
}

/**
 * Branded plum-panel shown when an ErrorBoundary catches a render error. Warm,
 * second-person, non-transactional voice; recovery actions instead of a dead
 * end. Never a white card (design-system rule) — plum panel on cream.
 */
export function ErrorFallback({ onReset, referenceId }: ErrorFallbackProps) {
  return (
    <div className={styles.wrap} role="alert">
      <div className={styles.panel}>
        <div className={styles.icon}>
          <FiAlertTriangle size={26} color="var(--accent)" aria-hidden />
        </div>
        <h2 className={styles.title}>
          Something broke on our <em>end</em>
        </h2>
        <p className={styles.body}>
          Nothing you did caused this, and nothing's lost. Try again, or head
          back home — we're already looking into it.
        </p>
        <div className={styles.actions}>
          <Button size="lg" variant="ghost-dark" onClick={onReset}>
            Try again
          </Button>
          <Button size="lg" variant="ghost-dark" to={routes.homepage}>
            Back to home
          </Button>
        </div>
        {referenceId && <p className={styles.ref}>Reference: {referenceId}</p>}
      </div>
    </div>
  );
}
