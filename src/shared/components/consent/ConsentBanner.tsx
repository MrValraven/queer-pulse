import { Link } from "react-router-dom";
import { Button } from "../ui";
import { routes } from "../../../app/routeMap";
import { useConsent } from "../../../app/providers/ConsentProvider";
import styles from "./Consent.module.css";

/**
 * App-wide consent banner (spec 07). A quiet bottom sheet on cream — never a
 * full-page wall, and the app stays fully usable behind it (necessary cookies
 * need no consent). Reject is exactly as prominent as Accept. Shown only while
 * no choice has been made under the current policy version.
 */
export function ConsentBanner() {
  const { status, prefsOpen, acceptAll, rejectAll, openPreferences } =
    useConsent();
  // Hide the banner while the preference center is open, so the bottom sheet
  // doesn't overlap the modal.
  if (status !== "unknown" || prefsOpen) return null;

  return (
    <div
      className={styles.banner}
      role="region"
      aria-label="Cookie and privacy choices"
    >
      <div className={styles.bannerInner}>
        <div className={styles.bannerText}>
          <h2 className={styles.bannerTitle}>
            A quiet word about <em>cookies.</em>
          </h2>
          <p className={styles.bannerBody}>
            We only store what keeps you logged in and safe by default.
            Analytics and error reporting stay off unless you say yes — no ads,
            no profiling, ever. Change your mind any time in settings.{" "}
            <Link to={routes.privacy} className={styles.bannerLink}>
              Read the policy
            </Link>
            .
          </p>
        </div>
        <div className={styles.bannerActions}>
          <Button variant="ghost" onClick={() => rejectAll("banner")}>
            Reject non-essential
          </Button>
          <Button variant="ghost" onClick={openPreferences}>
            Choose
          </Button>
          <Button variant="primary" onClick={() => acceptAll("banner")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
