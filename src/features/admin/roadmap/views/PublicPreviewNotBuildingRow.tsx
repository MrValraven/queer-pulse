import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { AdminRoadmapIdeaDTO } from "../../api/roadmapAdmin.types";
import styles from "./PublicPreviewView.module.css";

/** The 9 categories that have a dedicated `roadmap.categories.*` key — same
 *  set `PublicPreviewCard.tsx` guards with. Duplicated rather than shared,
 *  matching this view's own "don't couple to a sibling's internals"
 *  convention (see `PublicPreviewView.tsx`'s header comment). */
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

/**
 * One declined idea in the Public preview's "Not building this, and why"
 * section (`PublicPreviewView.tsx`) — the same set the public `/roadmap`
 * page reads, mirrored here from live admin data. Read-only: unlike
 * `NotBuildingView.tsx`'s admin row, there is no reopen action — this is a
 * preview of what members see, not the admin tool itself.
 */
export function PublicPreviewNotBuildingRow({
  idea,
}: {
  idea: AdminRoadmapIdeaDTO;
}) {
  const { t } = useTranslation();
  const reasonKey = idea.declineReason ?? "scope";
  const categoryLabel = KNOWN_CATEGORIES.has(idea.category)
    ? t(`admin:roadmap.categories.${idea.category}`)
    : idea.category;

  return (
    <li className={styles.notBuildingRow}>
      <div className={styles.notBuildingMeta}>
        <span className={styles.category}>{categoryLabel}</span>
        <span className={styles.notBuildingReason}>
          {t(`admin:roadmap.modals.decline.reason.${reasonKey}.label`)}
        </span>
      </div>
      <p className={styles.notBuildingTitle}>{idea.text}</p>
      {idea.declineNote && (
        <p className={styles.notBuildingWording}>{idea.declineNote}</p>
      )}
      <p className={styles.notBuildingAsked}>
        {idea.votes} {t("admin:roadmap.notBuildingView.hadAskedLabel")}
      </p>
    </li>
  );
}
