import { useState } from "react";
import { FiArrowUp, FiStar, FiZap } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import type { BuildingItem, PlannedItem, ShippedItem } from "./roadmap.data";
import styles from "./RoadmapPage.module.css";

export function ShippedCard({ item }: { item: ShippedItem }) {
  return (
    <article className={styles.rmCard}>
      <div className={styles.rcCat}>{item.category}</div>
      <h3 className={styles.rcName}>{item.name}</h3>
      <p className={styles.rcDesc}>{item.desc}</p>
      <div className={styles.rcFooter}>
        <span className={styles.rcDate}>{item.date}</span>
        {item.requested && (
          <span className={styles.rcRequested}>
            <FiStar aria-hidden /> Member requested
          </span>
        )}
      </div>
    </article>
  );
}

export function BuildingCard({ item }: { item: BuildingItem }) {
  return (
    <article className={`${styles.rmCard} ${styles.inProgress}`}>
      <div className={styles.rcCat}>{item.category}</div>
      <h3 className={styles.rcName}>{item.name}</h3>
      <p className={styles.rcDesc}>{item.desc}</p>
      {item.requested && (
        <div className={styles.rcFooter} style={{ marginBottom: 4 }}>
          <span className={styles.rcRequested}>
            <FiStar aria-hidden /> Member requested
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
          aria-label={`${item.name} progress`}
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
  const { showToast } = useToast();
  const [voted, setVoted] = useState(false);

  const count = item.votes + (voted ? 1 : 0);

  function toggleVote() {
    setVoted((prev) => {
      if (!prev) showToast("Vote recorded", "success");
      return !prev;
    });
  }

  return (
    <article className={`${styles.rmCard} ${styles.plannedCard}`}>
      <div className={styles.rcCat}>{item.category}</div>
      <h3 className={styles.rcName}>{item.name}</h3>
      <p className={styles.rcDesc}>{item.desc}</p>
      <div className={styles.voteRow}>
        {item.hot ? (
          <span className={styles.hotTag}>
            <FiZap aria-hidden /> Most wanted
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          className={`${styles.voteBtn} ${voted ? styles.voted : ""}`}
          onClick={toggleVote}
          aria-pressed={voted}
        >
          <FiArrowUp aria-hidden /> <span>{count}</span> votes
        </button>
      </div>
    </article>
  );
}
