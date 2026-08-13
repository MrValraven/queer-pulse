import { useState } from "react";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { InlineEditModal } from "./InlineEditModal";
import { LAST_EDITED_AT } from "./manageGathering.data";
import { daysSince } from "./manageGatheringDates";
import styles from "./ManageGatheringPage.module.css";

export interface GatheringDetail {
  id: string;
  labelKey: string;
  value: string;
}

/** Live overview counts; when absent the tab shows its static demo trio. */
export interface OverviewCounts {
  going: number;
  waitlist: number;
  spotsLeft: number;
}

const Pencil = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M8 1.5L10.5 4l-6 6H2V7.5l6-6Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);

interface OverviewTabProps {
  details: GatheringDetail[];
  description: string;
  /** Live going/waitlist/spots-left; absent → the static demo trio. */
  counts?: OverviewCounts;
  onUpdateDetail: (id: string, value: string) => void;
  onUpdateDescription: (value: string) => void;
}

export function OverviewTab({
  details,
  description,
  counts,
  onUpdateDetail,
  onUpdateDescription,
}: OverviewTabProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [editing, setEditing] = useState<
    | { kind: "detail"; id: string; labelKey: string; value: string }
    | { kind: "description"; value: string }
    | null
  >(null);

  const lastEditedDays = daysSince(LAST_EDITED_AT);

  const stats: [number, string][] = [
    [counts?.going ?? 14, t("gatherings:manage.overview.stat.going")],
    [counts?.waitlist ?? 3, t("gatherings:manage.overview.stat.waitlist")],
    [counts?.spotsLeft ?? 6, t("gatherings:manage.overview.stat.spotsLeft")],
  ];

  return (
    <div>
      <div className={styles.statsRow}>
        {stats.map(([count, label]) => (
          <div className={styles.statChip} key={label}>
            <div className={styles.scN}>{count}</div>
            <div className={styles.scL}>{label}</div>
          </div>
        ))}
      </div>
      <div className={styles.detailBlock}>
        {details.map((detail) => (
          <div className={styles.detailRow} key={detail.id}>
            <div className={styles.drLabel}>{t(detail.labelKey)}</div>
            <div className={styles.drVal}>{detail.value}</div>
            <button
              type="button"
              className={styles.drEdit}
              onClick={() =>
                setEditing({
                  kind: "detail",
                  id: detail.id,
                  labelKey: detail.labelKey,
                  value: detail.value,
                })
              }
            >
              <Pencil /> {t("gatherings:manage.overview.editCta")}
            </button>
          </div>
        ))}
      </div>
      <div className={styles.descCard}>
        <div className={styles.descLabel}>
          {t("gatherings:manage.overview.descriptionLabel")}
          <button
            type="button"
            className={styles.drEdit}
            onClick={() =>
              setEditing({ kind: "description", value: description })
            }
          >
            {t("gatherings:manage.overview.editCta")}
          </button>
        </div>
        <div className={styles.descText}>{description}</div>
      </div>
      <div className={styles.lastEdit}>
        {t("gatherings:manage.overview.lastEdited", {
          time: fmt.relativeTime(lastEditedDays, "day"),
        })}
      </div>

      {editing?.kind === "detail" && (
        <InlineEditModal
          label={t(editing.labelKey).toLowerCase()}
          initialValue={editing.value}
          onClose={() => setEditing(null)}
          onSave={(value) => onUpdateDetail(editing.id, value)}
        />
      )}
      {editing?.kind === "description" && (
        <InlineEditModal
          label={t("gatherings:manage.overview.descriptionNoun")}
          initialValue={editing.value}
          multiline
          onClose={() => setEditing(null)}
          onSave={onUpdateDescription}
        />
      )}
    </div>
  );
}
