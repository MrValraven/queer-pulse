import { type ReactNode, useState } from "react";
import { FiCheck, FiClock, FiMessageSquare } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { routes } from "../../../app/routeMap";
import type { ListingStatus, PendingListing } from "./listBusiness.data";
import styles from "./ListBusinessPage.module.css";

const STAGES: { id: ListingStatus; label: string; icon: typeof FiClock }[] = [
  { id: "review", label: "In review", icon: FiClock },
  { id: "question", label: "Quick question", icon: FiMessageSquare },
  { id: "live", label: "Live in the directory", icon: FiCheck },
];

const NOTE: Record<ListingStatus, ReactNode> = {
  review: (
    <>
      Thank you for adding to the directory.{" "}
      <b>A real person on the community team reads every listing</b> before it
      goes live — that's the promise behind our community-verified badge. We'll
      review within <b>a few days</b> and email you the moment it's live.
    </>
  ),
  question: (
    <>
      <b>The team has a small question</b> before it goes live — check your
      email. Nothing's wrong; a quick reply is all it takes and you're back on
      track.
    </>
  ),
  live: (
    <>
      <b>It's live in the directory.</b> Your place is now searchable by the
      community. Thank you for making the map a little fuller.
    </>
  ),
};

const TITLE: Record<ListingStatus, { text: string; em: string }> = {
  review: { text: "It's with", em: "the community now." },
  question: { text: "Just", em: "one quick thing." },
  live: { text: "You're", em: "on the map." },
};

export function ListBusinessSuccess({
  listing,
  onSetStage,
  onEdit,
  onWithdraw,
  onAnother,
}: {
  listing: PendingListing;
  onSetStage: (s: ListingStatus) => void;
  onEdit: () => void;
  onWithdraw: () => void;
  onAnother: () => void;
}) {
  const currentIndex = STAGES.findIndex((s) => s.id === listing.status);
  const title = TITLE[listing.status];
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  return (
    <div className={styles.statusPanel}>
      <div className={styles.statusInner}>
        <div className={styles.statusCheck}>
          <FiCheck size={34} />
        </div>
        <h2 className={styles.statusTitle}>
          {title.text} <em>{title.em}</em>
        </h2>
        <div className={styles.bizEcho}>{listing.name || "Your place"}</div>

        <div className={styles.tracker}>
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const cls =
              i < currentIndex
                ? styles.tkDone
                : i === currentIndex
                  ? styles.tkCurrent
                  : undefined;
            return (
              <div
                key={stage.id}
                className={[styles.tk, cls].filter(Boolean).join(" ")}
              >
                <span className={styles.tkDot}>
                  <Icon size={15} />
                </span>
                <span className={styles.tkL}>{stage.label}</span>
              </div>
            );
          })}
        </div>

        <div className={styles.statusNote}>
          <p>{NOTE[listing.status]}</p>
        </div>

        {confirmWithdraw ? (
          <div className={styles.withdrawConfirm} role="alertdialog">
            <p>
              Withdraw <b>{listing.name || "this listing"}</b>? This takes it
              out of review — you can always list it again later.
            </p>
            <div className={styles.statusActions}>
              <Button
                variant="ghost-dark"
                onClick={() => setConfirmWithdraw(false)}
              >
                Keep it
              </Button>
              <Button variant="primary" onClick={onWithdraw}>
                Yes, withdraw
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.statusActions}>
            <Button variant="ghost-dark" to={routes.directory}>
              Back to the directory
            </Button>
            {listing.linkToProfile && (
              <Button variant="ghost-dark" to={routes.accountProfile}>
                View on your profile →
              </Button>
            )}
            <Button variant="ghost-dark" onClick={onEdit}>
              Edit submission
            </Button>
            <Button variant="ghost-dark" onClick={onAnother}>
              List another place
            </Button>
            <Button
              variant="ghost-dark"
              onClick={() => setConfirmWithdraw(true)}
            >
              Withdraw
            </Button>
          </div>
        )}

        <div className={styles.statusMeta}>
          Reference · <b>{listing.ref}</b> &nbsp;·&nbsp; keep it somewhere
        </div>

        <div className={styles.demoFlip}>
          <span>Prototype · preview review states:</span>
          {STAGES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={
                listing.status === s.id ? styles.demoFlipOn : undefined
              }
              onClick={() => onSetStage(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
