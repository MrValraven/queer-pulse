import { useState } from "react";
import {
  FiArrowUp,
  FiClock,
  FiFlag,
  FiSlash,
  FiStar,
  FiZap,
} from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  BuildingItem,
  NotBuildingItem,
  PlannedItem,
  RoadmapSlip,
  ShippedItem,
} from "./roadmap.data";
import { useMyRoadmapVotes, useRoadmapVote } from "./api/useRoadmapMutations";
import styles from "./RoadmapPage.module.css";

/** The "this is a promise" pill — shared across shipped/building/planned
 *  cards for a `committed` item. */
function CommittedBadge() {
  const { t } = useTranslation();
  return (
    <span className={styles.committedBadge}>
      <FiFlag aria-hidden /> {t("marketing:roadmap.card.committed")}
    </span>
  );
}

/** A quiet, warm callout for a committed card whose target date moved —
 *  members forgive a moved date, not a silently moved one. */
function SlipNote({ slip }: { slip: RoadmapSlip }) {
  const { t } = useTranslation();
  return (
    <p className={styles.slipNote}>
      <FiClock aria-hidden />{" "}
      {t("marketing:roadmap.card.slipNote", {
        from: slip.from,
        to: slip.to,
        reason: slip.reason,
      })}
    </p>
  );
}

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
        {item.committed && <CommittedBadge />}
      </div>
      {item.latestSlip && <SlipNote slip={item.latestSlip} />}
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
      {item.features && item.features.length > 0 && (
        <div className={styles.featureBlock}>
          <div className={styles.featureLabel}>
            {t("marketing:roadmap.card.plannedFeatures")}
          </div>
          <ul className={styles.featureList}>
            {item.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      )}
      {(item.requested || item.committed) && (
        <div className={styles.rcFooter} style={{ marginBottom: 4 }}>
          {item.requested && (
            <span className={styles.rcRequested}>
              <FiStar aria-hidden />{" "}
              {t("marketing:roadmap.card.memberRequested")}
            </span>
          )}
          {item.committed && <CommittedBadge />}
        </div>
      )}
      {item.latestSlip && <SlipNote slip={item.latestSlip} />}
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

export interface PlannedCardProps {
  item: PlannedItem;
  /** Which column is rendering this card — `"someday"` swaps the solid
   *  committed-plan border for a dashed one, honestly signalling "no firm
   *  date yet" (backlog items share `PlannedItem`'s shape). */
  column?: "planned" | "someday";
}

export function PlannedCard({ item, column = "planned" }: PlannedCardProps) {
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
    <article
      className={`${styles.rmCard} ${column === "someday" ? styles.somedayCard : styles.plannedCard}`}
    >
      <div className={styles.rcCat}>{item.category}</div>
      <h3 className={styles.rcName}>{item.name}</h3>
      <p className={styles.rcDesc}>{item.description}</p>
      {item.committed && (
        <div className={styles.rcFooter} style={{ marginBottom: 6 }}>
          <CommittedBadge />
        </div>
      )}
      {item.latestSlip && <SlipNote slip={item.latestSlip} />}
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

/** "Not building this, and why" — a dismissed idea whose decline reason is
 *  member-facing. No vote control (voting doesn't apply once we've said no);
 *  muted/dashed treatment sets it apart from the rest of the board. */
export function NotBuildingCard({ item }: { item: NotBuildingItem }) {
  const { t } = useTranslation();
  return (
    <article className={styles.notBuildingCard}>
      <div className={styles.rcCat}>{item.category}</div>
      <div className={styles.nbReason}>
        <FiSlash aria-hidden />{" "}
        {t(`marketing:roadmap.notBuilding.reason.${item.reason}.label`)}
      </div>
      <p className={styles.rcDesc}>{item.note}</p>
      <div className={styles.nbVotes}>
        {t("marketing:roadmap.notBuilding.votesAsked", { count: item.votes })}
      </div>
    </article>
  );
}
