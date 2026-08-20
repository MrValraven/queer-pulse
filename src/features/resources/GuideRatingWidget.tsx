import { useState } from "react";
import { FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useGuideRating } from "./api/useGuideRating";
import styles from "./GuideRatingWidget.module.css";

/**
 * "Was this guide helpful?" — mounted at the bottom of one guide section
 * (Legal's Right cards, Sexual Health's GuidesTab cards, Mental Health's
 * Experience cards). `contentKey` matches the i18n dot-path prefix that
 * already addresses the section (e.g. `legal.workplace.dismissal`) — see the
 * CNT-18 design doc, "Why content-key-based, not a guide entity". No counts
 * are shown (raw counts on a "was this helpful" widget can bias responses) —
 * just the two buttons and a thanks-state once the caller has voted, with a
 * small "change your answer" link back to the buttons (exercises the same
 * toggle-clear/toggle-change the backend already supports).
 */
export function GuideRatingWidget({ contentKey }: { contentKey: string }) {
  const { t } = useTranslation();
  const { myVote, isPending, vote } = useGuideRating(contentKey);
  const [editing, setEditing] = useState(false);

  if (myVote && !editing) {
    return (
      <div className={styles.thanks} role="status">
        <span>{t("resources:rating.thanks")}</span>
        <button
          type="button"
          className={styles.changeCta}
          onClick={() => setEditing(true)}
        >
          {t("resources:rating.changeCta")}
        </button>
      </div>
    );
  }

  return (
    <div
      className={styles.widget}
      role="group"
      aria-label={t("resources:rating.prompt")}
    >
      <span className={styles.prompt}>{t("resources:rating.prompt")}</span>
      <div className={styles.buttons}>
        <button
          type="button"
          className={styles.btn}
          disabled={isPending}
          aria-pressed={myVote === "helpful"}
          onClick={() => {
            vote("helpful");
            setEditing(false);
          }}
        >
          <FiThumbsUp aria-hidden /> {t("resources:rating.helpfulCta")}
        </button>
        <button
          type="button"
          className={styles.btn}
          disabled={isPending}
          aria-pressed={myVote === "not_helpful"}
          onClick={() => {
            vote("not_helpful");
            setEditing(false);
          }}
        >
          <FiThumbsDown aria-hidden /> {t("resources:rating.notHelpfulCta")}
        </button>
      </div>
    </div>
  );
}
