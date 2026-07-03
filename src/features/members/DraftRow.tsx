import { Link } from "react-router-dom";
import {
  STATUS_LABEL,
  draftStatus,
  type Draft,
  type DraftAction,
  type DraftStatus,
  type MetaVariant,
} from "./drafts.data";
import styles from "./DraftsPage.module.css";

const kindClass: Record<Draft["kindVariant"], string> = {
  job: styles.kindJob!,
  pitch: styles.kindPitch!,
  grant: styles.kindGrant!,
  post: styles.kindPost!,
};

const chipClass: Record<DraftStatus, string> = {
  draft: styles.chipDraft!,
  ready: styles.chipReady!,
  stale: styles.chipStale!,
  atrisk: styles.chipAtrisk!,
};

const metaClass: Record<MetaVariant, string> = {
  deadline: styles.metaDeadline!,
  pulse: styles.metaPulse!,
  stale: styles.metaStale!,
  warn: styles.metaWarn!,
};

export function DraftRow({
  draft,
  selected,
  removing,
  onToggle,
  onAction,
}: {
  draft: Draft;
  selected: boolean;
  removing: boolean;
  onToggle: (id: string, checked: boolean) => void;
  onAction: (draft: Draft, action: DraftAction) => void;
}) {
  const status = draftStatus(draft);
  const rowClass = [
    styles.row,
    status === "atrisk" && styles.rowAtrisk,
    selected && styles.rowSelected,
    removing && styles.rowRemoving,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rowClass}>
      <input
        type="checkbox"
        className={styles.cbx}
        checked={selected}
        onChange={(e) => onToggle(draft.id, e.target.checked)}
        aria-label="Select draft"
      />
      <div className={`${styles.kind} ${kindClass[draft.kindVariant]}`}>
        {draft.kind}
      </div>
      <div className={styles.info}>
        <div className={styles.titleLine}>
          <span className={`${styles.chip} ${chipClass[status]}`}>
            {STATUS_LABEL[status]}
          </span>
          {draft.href ? (
            <Link to={draft.href} className={styles.title}>
              {draft.title}
            </Link>
          ) : (
            <span className={styles.title}>{draft.title}</span>
          )}
        </div>
        <span className={styles.sub}>{draft.desc}</span>
        <div className={styles.meta}>
          {draft.meta.map((m, i) => (
            <span
              key={i}
              className={m.variant ? metaClass[m.variant] : undefined}
            >
              {m.label}
            </span>
          ))}
        </div>
        <div className={styles.progress}>
          <div className={`${styles.bar} ${draft.ready ? styles.full : ""}`}>
            <span style={{ width: `${draft.progress}%` }} />
          </div>
          {draft.ready ? (
            <span className={styles.readyLabel}>Ready</span>
          ) : (
            <span>{draft.progress}%</span>
          )}
        </div>
      </div>
      <div className={styles.actions}>
        {draft.actions.map((a) => (
          <button
            type="button"
            key={a.label}
            className={[
              styles.action,
              a.variant === "primary" && styles.primary,
              a.variant === "danger" && styles.danger,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onAction(draft, a)}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
