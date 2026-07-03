import { FiCheck, FiEye, FiShare2, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import type { Job } from "./jobs.data";
import styles from "./PostJobPage.module.css";

export function PostJobConfirmation({
  job,
  onPostAnother,
}: {
  job: Job;
  onPostAnother: () => void;
}) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  return (
    <div className={styles.confirm}>
      <div className={styles.confirmBadge} aria-hidden>
        <svg viewBox="0 0 36 36">
          <polyline points="10,19 16,25 27,12" />
        </svg>
      </div>
      <div className={styles.eyebrow} style={{ textAlign: "center" }}>
        {job.org}
      </div>
      <h1 className={styles.confirmTitle}>
        “{job.title}” is <em>live</em>
      </h1>
      <p className={styles.confirmSub}>
        Members can see it now. We&apos;ll notify you the moment someone
        responds, and nudge you before it expires in 60 days.
      </p>
      <div className={styles.confirmActions}>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate(`${routes.jobs}/${job.slug}`)}
        >
          View listing
        </Button>
        <Button variant="ghost" size="lg" onClick={onPostAnother}>
          Post another
        </Button>
      </div>

      <div className={styles.cpanels}>
        <div className={styles.cpanel}>
          <div className={styles.cpanelH}>
            <span className={styles.cpanelIc} aria-hidden>
              <FiEye size={15} />
            </span>
            <span className={styles.cpanelTitle}>Performance</span>
          </div>
          <div className={styles.cpanelBody}>
            Track views, saves, and responses over the life of your listing.
          </div>
          <div className={styles.cstatRow}>
            <div>
              <div className={styles.cstatN}>0</div>
              <div className={styles.cstatL}>Views</div>
            </div>
            <div>
              <div className={styles.cstatN}>0</div>
              <div className={styles.cstatL}>Saves</div>
            </div>
            <div>
              <div className={styles.cstatN}>0</div>
              <div className={styles.cstatL}>Replies</div>
            </div>
          </div>
        </div>

        <div className={styles.cpanel}>
          <div className={styles.cpanelH}>
            <span className={styles.cpanelIc} aria-hidden>
              <FiUsers size={15} />
            </span>
            <span className={styles.cpanelTitle}>Responses</span>
          </div>
          <div className={styles.cpanelBody}>
            Replies land in one place — review, message, or mark as filled from
            your listing manager.
          </div>
          <div style={{ marginTop: 14 }}>
            <Button
              variant="ghost"
              size="md"
              onClick={() => navigate(routes.applicationStatus)}
            >
              Open listing manager
            </Button>
          </div>
        </div>

        <div className={styles.cpanel}>
          <div className={styles.cpanelH}>
            <span className={styles.cpanelIc} aria-hidden>
              <FiShare2 size={15} />
            </span>
            <span className={styles.cpanelTitle}>Share it</span>
          </div>
          <div className={styles.cpanelBody}>
            Boost reach inside the community.
          </div>
          <div className={styles.shareRow}>
            <button
              type="button"
              className={styles.shareBtn}
              onClick={() => showToast("Shared to your feed", "success")}
            >
              Post to Feed
            </button>
            <button
              type="button"
              className={styles.shareBtn}
              onClick={() => showToast("Link copied", "success")}
            >
              Copy link
            </button>
          </div>
        </div>

        <div className={styles.cpanel}>
          <div className={styles.cpanelH}>
            <span className={styles.cpanelIc} aria-hidden>
              <FiCheck size={15} />
            </span>
            <span className={styles.cpanelTitle}>What&apos;s next</span>
          </div>
          <div className={styles.cpanelBody}>
            Your role now shows on the board and on your company profile. New
            listings carry a “not yet reviewed” note until the community vets
            them.
          </div>
        </div>
      </div>
    </div>
  );
}
