import { Link } from "react-router-dom";
import type { Pitch, PitchStatus } from "./pitchTracker.data";
import { PitchStages } from "./PitchStages";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./PitchTrackerPage.module.css";

const STATUS_CLASS: Record<PitchStatus, string> = {
  review: styles.statusReview!,
  editing: styles.statusEditing!,
  commissioned: styles.statusCommissioned!,
  published: styles.statusPublished!,
  rejected: styles.statusRejected!,
};

export function PitchCard({
  pitch,
  onWithdraw,
  onStub,
}: {
  pitch: Pitch;
  /** Opens the withdraw confirmation. Withdrawing is destructive in live mode,
   *  so the card never performs it directly. */
  onWithdraw: (pitch: Pitch) => void;
  onStub: (label: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div
      className={[styles.card, pitch.dimmed && styles.cardDimmed]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.headRow}>
        <div className={styles.title}>
          {pitch.href ? (
            <Link to={pitch.href}>{pitch.title}</Link>
          ) : (
            pitch.title
          )}
        </div>
        <span className={[styles.status, STATUS_CLASS[pitch.status]].join(" ")}>
          {t(pitch.statusLabelKey)}
        </span>
      </div>

      <div className={styles.meta}>
        {pitch.meta.map((m, i) => (
          <span key={i}>
            <b>{m}</b>
          </span>
        ))}
      </div>

      <PitchStages stages={pitch.stages} />

      {pitch.note && (
        <p className={styles.note}>
          <b>
            {t("magazine:pitchTracker.card.noteWrote", {
              author: pitch.note.author,
            })}
          </b>{" "}
          {pitch.note.body}
        </p>
      )}
      {pitch.outline && <p className={styles.outline}>{pitch.outline}</p>}

      <div className={styles.actions}>
        {pitch.actions.map((action) => {
          // `labelKey` is what the live adapter emits (translated); `label` is
          // the demo registry's plain-English copy. See `PitchAction`.
          const label = action.labelKey
            ? t(action.labelKey)
            : (action.label ?? "");
          const className = [
            styles.action,
            action.primary && styles.actionPrimary,
            action.withdraw && styles.actionDanger,
          ]
            .filter(Boolean)
            .join(" ");
          const key = action.labelKey ?? action.label ?? "";
          if (action.to) {
            return (
              <Link key={key} to={action.to} className={className}>
                {label}
              </Link>
            );
          }
          return (
            <button
              key={key}
              type="button"
              className={className}
              onClick={() =>
                action.withdraw ? onWithdraw(pitch) : onStub(label)
              }
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
