import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import styles from "./StoryPage.module.css";
import { StoryArticle } from "./StoryArticle";

const PROFILE = routes.profile;
const STORY = routes.story;
const INVITE = routes.invite;

export function StoryPage() {
  return (
    <PageShell>
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroLabel}>
          <div className="wrap">
            <div className={styles.cat}>Field Notes</div>
            <h1>
              How a Príncipe Real studio became a quiet home for{" "}
              <em>queer designers</em>
            </h1>
            <div className={styles.heroByline}>
              <span className={styles.bylineAv}>IT</span>
              <span>
                Words by <Link to={PROFILE}>Inês Tavares</Link>
              </span>
              <span className={styles.bDot} />
              <span>6 min read</span>
              <span className={styles.bDot} />
              <span>June 2026</span>
            </div>
          </div>
        </div>
      </div>

      <StoryArticle profilePath={PROFILE} storyPath={STORY} invitePath={INVITE} />
    </PageShell>
  );
}
