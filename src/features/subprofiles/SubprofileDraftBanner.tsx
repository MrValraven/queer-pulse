import { FiEdit2 } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { subprofileEditPath } from "../../app/routeMap";
import styles from "./SubprofileDraftBanner.module.css";

/**
 * The owner-viewing-own-unpublished-draft bar (`.draftbar` in the design
 * ground truth): a pulsing dot, "nobody else can open this address yet",
 * a readiness summary, and Edit/Publish actions. Both actions route to the
 * owner editor (`subprofileEditPath`) rather than firing a raw publish
 * mutation here — the editor's `SubprofilePublishPanel` is the single place
 * that already runs the publish checklist and surfaces unmet requirements;
 * duplicating that logic in a banner with no visibility into *which*
 * requirements are unmet would be worse than just routing there.
 *
 * Mounted by `SubprofilePage` when `result.state === "ok"` AND
 * `data.status === "draft"` AND `data.viewerIsMember` — i.e. the owner or an
 * invited co-owner previewing their own not-yet-published persona at its
 * public URL (Phase 1b: the backend now serves a draft back to its own
 * owner instead of 404ing it like any other viewer). Everyone else hitting
 * that same URL still gets `"not-found"` — see `usePublicSubprofile`'s
 * `PublicSubprofileResult` for the full contract.
 */
export function SubprofileDraftBanner({
  subprofileId,
  readyCount,
  totalCount,
}: {
  subprofileId: string;
  /** How many of the publish checklist's requirements are currently met —
   *  a summary count only; the editor's checklist is the source of truth
   *  for *which* ones. */
  readyCount: number;
  totalCount: number;
}) {
  const { t } = useTranslation();
  const editHref = subprofileEditPath(subprofileId);

  return (
    <div className={styles.bar} role="status">
      <span className={styles.dot} aria-hidden />
      <p className={styles.message}>{t("subprofiles:draftBanner.message")}</p>
      <span className={styles.readiness}>
        {t("subprofiles:draftBanner.readiness", {
          ready: readyCount,
          total: totalCount,
        })}
      </span>
      <div className={styles.actions}>
        <Button variant="ghost-dark" size="sm" to={editHref}>
          <FiEdit2 aria-hidden /> {t("subprofiles:draftBanner.edit")}
        </Button>
        <Button variant="primary" size="sm" to={editHref}>
          {t("subprofiles:draftBanner.publish")}
        </Button>
      </div>
    </div>
  );
}
