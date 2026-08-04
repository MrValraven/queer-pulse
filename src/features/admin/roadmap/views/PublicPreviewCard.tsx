import { Button, Tag } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { TFunction } from "../../../../shared/i18n/types";
import type {
  AdminRoadmapItemDTO,
  RoadmapSlipEntryDTO,
} from "../../api/roadmapAdmin.types";
import styles from "./PublicPreviewView.module.css";

/** The 9 categories that have a dedicated `roadmap.categories.*` key —
 *  `category` is otherwise admin free text (see
 *  `roadmapChrome.data.ts`'s `getUniqueCategories` doc), so anything
 *  outside this set is shown exactly as authored rather than echoing an
 *  unresolved i18n key back at the admin. */
const KNOWN_CATEGORIES = new Set([
  "resources",
  "gatherings",
  "members",
  "safety",
  "content",
  "messaging",
  "community",
  "economy",
  "platform",
]);

function categoryLabel(t: TFunction, category: string): string {
  return KNOWN_CATEGORIES.has(category)
    ? t(`admin:roadmap.categories.${category}`)
    : category;
}

function latestSlip(slips: RoadmapSlipEntryDTO[]): RoadmapSlipEntryDTO | null {
  if (slips.length === 0) return null;
  return slips.reduce((latest, slip) =>
    slip.movedAt > latest.movedAt ? slip : latest,
  );
}

/**
 * One card in the Public preview's Building/Next-up/Someday/Shipped grids —
 * exactly what a member would see at `/roadmap`, plus a hover/focus-reveal
 * Edit affordance that opens the shared item drawer.
 */
export function PublicPreviewCard({
  item,
  onEdit,
}: {
  item: AdminRoadmapItemDTO;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const slip = latestSlip(item.slips);
  const showProgress = item.column === "building" && item.progress != null;

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.category}>{categoryLabel(t, item.category)}</span>
        <Button
          variant="ghost"
          className={styles.editButton}
          onClick={onEdit}
          title={t("admin:roadmap.publicPreview.editItemTooltip")}
        >
          {t("admin:roadmap.publicPreview.editCta")}
        </Button>
      </div>

      <div className={styles.badgeRow}>
        {item.requested && (
          <Tag className={styles.requestedTag}>
            {t("admin:roadmap.publicPreview.requestedTag")}
          </Tag>
        )}
        {item.committed ? (
          <Tag className={styles.committedTag}>
            {t("admin:roadmap.publicPreview.committedTag")}
          </Tag>
        ) : (
          <Tag>
            {t(`admin:roadmap.drawer.commitment.confidence.${item.confidence}.label`)}
          </Tag>
        )}
      </div>

      <h3 className={styles.cardTitle}>{item.name}</h3>
      {item.publicNote ? (
        <p className={styles.cardBody}>{item.publicNote}</p>
      ) : (
        <p className={styles.noPublicNote}>
          {t("admin:roadmap.publicPreview.noPublicNoteFallback")}
        </p>
      )}

      {slip && (
        <p className={styles.slipNote}>
          {t(
            item.slips.length > 1
              ? "admin:roadmap.publicPreview.movedMultiple"
              : "admin:roadmap.publicPreview.movedOnce",
            { from: slip.from, to: slip.to, count: item.slips.length },
          )}{" "}
          {slip.reason}
        </p>
      )}

      <footer className={styles.cardFooter}>
        {showProgress && (
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-valuenow={item.progress ?? 0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={item.name}
          >
            <div
              className={styles.progressFill}
              style={{ width: `${item.progress}%` }}
            />
          </div>
        )}
        <span className={styles.dateChip}>
          {item.column === "shipped"
            ? t("admin:roadmap.publicPreview.liveLabel")
            : (item.targetQuarter ?? t("admin:roadmap.publicPreview.noDateHonest"))}
        </span>
        <span className={styles.voteChip}>{item.votes + item.liveVotes}</span>
      </footer>
    </article>
  );
}
