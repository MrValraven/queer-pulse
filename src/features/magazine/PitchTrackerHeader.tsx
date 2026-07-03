import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import styles from "./PitchTrackerPage.module.css";

export function PitchTrackerHeader() {
  return (
    <header className={styles.head}>
      <div>
        <div className={styles.eyebrow}>Magazine · your pitches</div>
        <h1 className={styles.h1}>
          Where every pitch <em>actually is.</em>
        </h1>
        <p className={styles.lead}>
          7 pitches active · 4 published all-time. Editorial replies within{" "}
          <b>~ 6 days</b>.
        </p>
      </div>
      <Button variant="primary" to={routes.submitStory}>
        + New pitch
      </Button>
    </header>
  );
}
