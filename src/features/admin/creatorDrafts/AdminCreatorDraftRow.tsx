import { useId } from "react";
import { Link } from "react-router-dom";
import { adminCreatorDraftPath } from "../../../app/routeMap";
import { memberRefToPerson } from "../../../shared/api/refs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatDate } from "../../../shared/lib/date";
import type { AdminCreatorDraftRow as AdminCreatorDraftRowData } from "../api/adminCreatorDrafts.api";
import { AdminAvatar, AdminChip, type AvatarTone } from "../ui";
import {
  CREATOR_DRAFT_KIND_LABEL_KEYS,
  creatorDraftMadeForText,
  creatorDraftMissingLabels,
  creatorDraftProgressText,
  creatorDraftTitleText,
} from "./adminCreatorDraftLabels";
import styles from "./AdminCreatorDrafts.module.css";

/** How many missing labels a row names before folding the rest into "+N more". */
const VISIBLE_MISSING_LIMIT = 3;

/**
 * One unfinished creator draft in the admin list. The title link is the row's
 * only interactive element: reaching out and the preview live on the detail
 * page. Who the draft is for stays plain text even when it has a public
 * address, so the row never offers a second link.
 */
export function AdminCreatorDraftRow({
  row,
}: {
  row: AdminCreatorDraftRowData;
}) {
  const { t, language } = useTranslation();
  const owner = memberRefToPerson(row.owner);
  const madeForText = creatorDraftMadeForText(row.madeFor, t);
  const progressText = creatorDraftProgressText(row.progress, t);
  const missingLabels = creatorDraftMissingLabels(row.kind, row.missing, t);
  const visibleMissingLabels = missingLabels.slice(0, VISIBLE_MISSING_LIMIT);
  const hiddenMissingCount = missingLabels.length - visibleMissingLabels.length;
  // Two drafts can share a title (both "Untitled"), so the link carries the
  // kind, who it is for and who started it as its description.
  const rowId = useId();
  const kindId = `${rowId}-kind`;
  const madeForId = `${rowId}-made-for`;
  const ownerId = `${rowId}-owner`;
  const describedBy = [kindId, madeForText ? madeForId : null, ownerId]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <Link
          className={styles.titleLink}
          to={adminCreatorDraftPath(row.kind, row.id)}
          aria-describedby={describedBy}
        >
          {creatorDraftTitleText(row, t)}
        </Link>
        <AdminChip tone="plum">
          <span id={kindId}>{t(CREATOR_DRAFT_KIND_LABEL_KEYS[row.kind])}</span>
        </AdminChip>
      </div>

      <p className={styles.meta}>
        {madeForText && (
          <span id={madeForId} className={styles.metaItem}>
            {madeForText}
          </span>
        )}
        {progressText && (
          <span className={styles.metaItem}>{progressText}</span>
        )}
        <span className={styles.metaItem}>
          {t("admin:creatorDrafts.lastSaved", {
            date: formatDate(row.lastSavedAt, language),
          })}
        </span>
      </p>

      <div className={styles.owner}>
        <span aria-hidden>
          <AdminAvatar
            initials={owner?.initials ?? "?"}
            tone={(owner?.tint as AvatarTone | undefined) ?? "anon"}
            size="sm"
            src={owner?.avatarUrl ?? undefined}
          />
        </span>
        <span id={ownerId} className={styles.ownerName}>
          {t("admin:creatorDrafts.startedBy", {
            name: owner?.name ?? t("admin:creatorDrafts.unknownOwner"),
          })}
        </span>
      </div>

      {visibleMissingLabels.length > 0 && (
        <p className={styles.missing}>
          <span className={styles.missingLabel}>
            {t("admin:creatorDrafts.strip.missing")}
          </span>
          {visibleMissingLabels.map((label) => (
            <AdminChip key={label} tone="ghost">
              {label}
            </AdminChip>
          ))}
          {hiddenMissingCount > 0 && (
            <span className={styles.missingMore}>
              {t("admin:creatorDrafts.moreMissing", {
                count: hiddenMissingCount,
              })}
            </span>
          )}
        </p>
      )}
    </article>
  );
}
