import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  DRAFT_ACTION_LABEL_KEY,
  STATUS_LABEL_KEY,
  draftStatus,
  relativeAgo,
  type Draft,
  type DraftAction,
  type DraftMeta,
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

/** Resolve one `DraftMeta` line to a rendered node, given the owning draft
 * for the numeric fields (`createdMinutes`/`editedMinutes`/`deadlineDays`)
 * that the relative-time/deadline kinds read instead of storing their own
 * copy (§5.1 — never bake a formatted phrase next to the number it derives from). */
function renderMetaLabel(
  meta: DraftMeta,
  draft: Draft,
  t: ReturnType<typeof useTranslation>["t"],
  fmt: ReturnType<typeof useFormat>,
): ReactNode {
  switch (meta.kind) {
    case "startedAgo":
      return t("members:drafts.meta.startedAgo", {
        time: relativeAgo(draft.createdMinutes ?? 0, fmt),
      });
    case "lastEditedAgo":
      return t("members:drafts.meta.lastEditedAgo", {
        time: relativeAgo(draft.editedMinutes ?? 0, fmt),
      });
    case "savedAgo":
      return t("members:drafts.meta.savedAgo", {
        time: relativeAgo(draft.editedMinutes ?? 0, fmt),
      });
    case "closesOn": {
      const days = draft.deadlineDays ?? 0;
      const daysPhrase = t("members:drafts.meta.daysLeft", { count: days });
      return t("members:drafts.meta.closesOn", {
        date: fmt.date(meta.date, { day: "numeric", month: "short" }),
        daysPhrase,
      });
    }
    case "deletesIn": {
      const days = draft.deadlineDays ?? 0;
      const daysPhrase = t("members:drafts.meta.daysLeft", { count: days });
      return t("members:drafts.meta.deletesIn", { daysPhrase });
    }
    case "custom":
      return meta.label;
    default:
      return null;
  }
}

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
  const { t } = useTranslation();
  const fmt = useFormat();
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
        aria-label={t("members:drafts.row.selectAriaLabel")}
      />
      <div className={`${styles.kind} ${kindClass[draft.kindVariant]}`}>
        {draft.kind}
      </div>
      <div className={styles.info}>
        <div className={styles.titleLine}>
          <span className={`${styles.chip} ${chipClass[status]}`}>
            {t(STATUS_LABEL_KEY[status])}
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
              {renderMetaLabel(m, draft, t, fmt)}
            </span>
          ))}
        </div>
        <div className={styles.progress}>
          <div className={`${styles.bar} ${draft.ready ? styles.full : ""}`}>
            <span style={{ width: `${draft.progress}%` }} />
          </div>
          {draft.ready ? (
            <span className={styles.readyLabel}>
              {t(STATUS_LABEL_KEY.ready)}
            </span>
          ) : (
            <span>{draft.progress}%</span>
          )}
        </div>
      </div>
      <div className={styles.actions}>
        {draft.actions.map((action) => {
          const actionLabelKey = DRAFT_ACTION_LABEL_KEY[action.label];
          return (
            <button
              type="button"
              key={action.label}
              className={[
                styles.action,
                action.variant === "primary" && styles.primary,
                action.variant === "danger" && styles.danger,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onAction(draft, action)}
            >
              {actionLabelKey ? t(actionLabelKey) : action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
