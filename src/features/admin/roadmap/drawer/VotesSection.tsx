import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { AdminVoteBreakdownDTO } from "../../api/roadmapAdmin.types";
import { Button } from "../../../../shared/components/ui";
import { AdminChip } from "../../ui";
import styles from "./ItemDrawer.module.css";

/**
 * Member votes — a bar per top-voting community, total, notified state,
 * spike flag, and the "notify voters" shortcut (opens the Notify modal,
 * a sibling task; this section never sends anything itself). Edit mode
 * only — a not-yet-created item has no voters.
 */
export function VotesSection({
  votes,
  voteBreakdown,
  notified,
  spikeFlag,
  onNotify,
}: {
  votes: number;
  voteBreakdown: AdminVoteBreakdownDTO;
  notified: boolean;
  spikeFlag: boolean;
  onNotify: () => void;
}) {
  const { t } = useTranslation();
  const maxCount = Math.max(
    1,
    ...voteBreakdown.top.map((entry) => entry.count),
    voteBreakdown.other,
  );

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>
        {t("admin:roadmap.drawer.votes.title")}
      </h3>

      <div className={styles.voteBars}>
        {voteBreakdown.top.map((entry) => (
          <div key={entry.communityName} className={styles.voteBarRow}>
            <span className={styles.voteBarLabel}>{entry.communityName}</span>
            <span className={styles.voteBarTrack}>
              <span
                className={styles.voteBarFill}
                style={{ width: `${(entry.count / maxCount) * 100}%` }}
              />
            </span>
            <span className={styles.voteBarCount}>{entry.count}</span>
          </div>
        ))}
        {voteBreakdown.other > 0 && (
          <div className={styles.voteBarRow}>
            <span className={styles.voteBarLabel}>
              {t("admin:roadmap.drawer.votes.otherCommunitiesLabel")}
            </span>
            <span className={styles.voteBarTrack}>
              <span
                className={styles.voteBarFill}
                style={{ width: `${(voteBreakdown.other / maxCount) * 100}%` }}
              />
            </span>
            <span className={styles.voteBarCount}>{voteBreakdown.other}</span>
          </div>
        )}
      </div>

      <div className={styles.voteMetaRow}>
        <span>
          {t("admin:roadmap.drawer.votes.totalLabel")}{" "}
          <span className={styles.voteMetaValue}>{votes}</span>
        </span>
        <span>
          {t("admin:roadmap.drawer.votes.notifiedLabel")}{" "}
          <span className={styles.voteMetaValue}>
            {notified
              ? t("admin:roadmap.drawer.votes.notifiedYes")
              : t("admin:roadmap.drawer.votes.notifiedNo")}
          </span>
        </span>
        <span>
          {t("admin:roadmap.drawer.votes.spikeLabel")}{" "}
          <AdminChip tone={spikeFlag ? "danger" : "ghost"} dot={spikeFlag}>
            {spikeFlag
              ? t("admin:roadmap.drawer.votes.spikeFlagged")
              : t("admin:roadmap.drawer.votes.spikeNormal")}
          </AdminChip>
        </span>
      </div>

      <Button
        variant="ghost"
        size="md"
        disabled={votes === 0}
        onClick={onNotify}
      >
        {t("admin:roadmap.drawer.votes.notifyCta", { count: votes })}
      </Button>
    </div>
  );
}
