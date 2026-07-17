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
  onWithdraw: (p: Pitch) => void;
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
          <b>{pitch.note.author} wrote:</b> {pitch.note.body}
        </p>
      )}
      {pitch.outline && <p className={styles.outline}>{pitch.outline}</p>}

      <div className={styles.actions}>
        {pitch.actions.map((a) => {
          const cls = [styles.action, a.primary && styles.actionPrimary]
            .filter(Boolean)
            .join(" ");
          if (a.to) {
            return (
              <Link key={a.label} to={a.to} className={cls}>
                {a.label}
              </Link>
            );
          }
          return (
            <button
              key={a.label}
              type="button"
              className={cls}
              onClick={() => (a.withdraw ? onWithdraw(pitch) : onStub(a.label))}
            >
              {a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
