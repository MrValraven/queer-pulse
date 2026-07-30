import { useState } from "react";
import { FiArrowUp, FiStar, FiZap } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { BuildingItem, PlannedItem, ShippedItem } from "./roadmap.data";
import {
  useMyRoadmapVotes,
  useRoadmapVote,
} from "./api/useRoadmapMutations";
import styles from "./RoadmapPage.module.css";

export function ShippedCard({ item }: { item: ShippedItem }) {
  const { t } = useTranslation();
  return (
    <article className={styles.rmCard}>
      <div className={styles.rcCat}>{item.category}</div>
      <h3 className={styles.rcName}>{item.name}</h3>
      <p className={styles.rcDesc}>{item.description}</p>
      <div className={styles.rcFooter}>
        <span className={styles.rcDate}>{item.date}</span>
        {item.requested && (
          <span className={styles.rcRequested}>
            <FiStar aria-hidden /> {t("marketing:roadmap.card.memberRequested")}
          </span>
        )}
      </div>
    </article>
  );
}

export function BuildingCard({ item }: { item: BuildingItem }) {
  const { t } = useTranslation();
  return (
    <article className={`${styles.rmCard} ${styles.inProgress}`}>
      <div className={styles.rcCat}>{item.category}</div>
      <h3 className={styles.rcName}>{item.name}</h3>
      <p className={styles.rcDesc}>{item.description}</p>
      {item.requested && (
        <div className={styles.rcFooter} style={{ marginBottom: 4 }}>
          <span className={styles.rcRequested}>
            <FiStar aria-hidden /> {t("marketing:roadmap.card.memberRequested")}
          </span>
        </div>
      )}
      <div className={styles.progWrap}>
        <div className={styles.progLabel}>
          <span>{item.stage}</span>
          <span>{item.eta}</span>
        </div>
        <div
          className={styles.progBar}
          role="progressbar"
          aria-valuenow={item.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t("marketing:roadmap.card.progressAria", {
            name: item.name,
          })}
        >
          <div
            className={styles.progFill}
            style={{ width: `${item.progress}%` }}
          />
        </div>
      </div>
    </article>
  );
}

export function PlannedCard({ item }: { item: PlannedItem }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const myVotes = useMyRoadmapVotes();
  const { demoMode, vote: castVote } = useRoadmapVote();
  const [justVoted, setJustVoted] = useState(false);

  const voted = justVoted || myVotes.has(item.id);
  const count = item.votes + (demoMode && justVoted ? 1 : 0);

  function toggleVote() {
    if (voted) return;
    setJustVoted(true);
    showToast(t("marketing:roadmap.topIdeas.toast.voted"), "success");
    if (!demoMode) {
      castVote(
        { targetType: "item", targetId: item.id },
        // Roll back the optimistic "voted" state on failure so the button
        // re-enables and the member can retry (the global error toast
        // already fires since this mutation doesn't set meta.silentError).
        { onError: () => setJustVoted(false) },
      );
    }
  }

  return (
    <article className={`${styles.rmCard} ${styles.plannedCard}`}>
      <div className={styles.rcCat}>{item.category}</div>
      <h3 className={styles.rcName}>{item.name}</h3>
      <p className={styles.rcDesc}>{item.description}</p>
      <div className={styles.voteRow}>
        {item.hot ? (
          <span className={styles.hotTag}>
            <FiZap aria-hidden /> {t("marketing:roadmap.card.mostWanted")}
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          className={`${styles.voteBtn} ${voted ? styles.voted : ""}`}
          onClick={toggleVote}
          aria-pressed={voted}
          disabled={voted}
        >
          <FiArrowUp aria-hidden /> <span>{count}</span>{" "}
          {t("marketing:roadmap.card.votesSuffix")}
        </button>
      </div>
    </article>
  );
}
