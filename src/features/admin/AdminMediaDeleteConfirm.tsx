import { FiAlertTriangle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { AdminMediaReferenceList } from "./AdminMediaReferences";
import { AdminModal } from "./ui";
import type { AdminMediaCoverHolder } from "./api/adminMedia.api";
import type { MediaReference } from "../../shared/media/mediaReferences";
import styles from "./AdminMediaPage.module.css";

/** What the server itself said when it refused the delete, so the second pass
 *  can show the admin the authoritative answer rather than the console's own
 *  (possibly stale) reference snapshot. `isUnverified` is the `503` case. */
export interface AdminMediaDeleteRefusal {
  references: MediaReference[];
  isUnverified: boolean;
  /** Set for a `media_live_cover` refusal: the scenes and releases whose cover
   *  this image is. */
  coverHolders?: AdminMediaCoverHolder[];
}

/** The two Studio page photo slots that have their own translated line. */
const LANDING_PHOTO_SLOT_KEY: Record<string, string> = {
  hero: "admin:media.delete.liveCoverLandingPhoto.hero",
  manifesto: "admin:media.delete.liveCoverLandingPhoto.manifesto",
};

/** The line for each kind of live-cover holder. A scene and a release take the
 *  server's label; a landing photo has one translated line per slot, and an
 *  unknown slot id renders the server label as it came. */
const COVER_HOLDER_LINE: Record<
  AdminMediaCoverHolder["kind"],
  (holder: AdminMediaCoverHolder, t: TFunction) => string
> = {
  "studio-scene": (holder, t) =>
    t("admin:media.delete.liveCoverScene", { label: holder.label }),
  "studio-release": (holder, t) =>
    t("admin:media.delete.liveCoverRelease", { label: holder.label }),
  "studio-landing-photo": (holder, t) => {
    const slotKey = Object.hasOwn(LANDING_PHOTO_SLOT_KEY, holder.entityId)
      ? LANDING_PHOTO_SLOT_KEY[holder.entityId]
      : undefined;
    return slotKey ? t(slotKey) : holder.label;
  },
};

/**
 * Pre-delete confirmation for one stored object. Deletion stays available
 * whether or not the object is still referenced — this only changes what the
 * admin is told before they commit: a plain confirmation when nothing points
 * at it, or a warning plus the full "where it's used" list when something
 * does, so deleting an in-use file is a deliberate choice, not a surprise.
 *
 * A `refusal` means the server rejected the first attempt (the key picked up a
 * reference after this page loaded, or the check could not run). The modal then
 * shows the server's own answer and turns the confirm into an explicit
 * "delete anyway" override, so the forced delete is a second, informed click.
 */
export function AdminMediaDeleteConfirm({
  references,
  degraded,
  isPending,
  refusal,
  onCancel,
  onConfirm,
}: {
  references: MediaReference[];
  /** When true, some reference checks failed, so an empty set is UNVERIFIED —
   *  the "no references found" reassurance is replaced with a caution. */
  degraded: boolean;
  isPending: boolean;
  /** Set once the server has refused this delete; drives the override step. */
  refusal: AdminMediaDeleteRefusal | null;
  onCancel: () => void;
  onConfirm: (isForced: boolean) => void;
}) {
  const { t } = useTranslation();
  const isReferenced = references.length > 0;
  // The admin has already been shown what breaks, so the first attempt carries
  // the override for a knowingly in-use or unverifiable file. A refusal always
  // forces, because by then the server has stated its own case.
  const isForced = refusal !== null || isReferenced || degraded;

  return (
    <AdminModal
      eyebrow={t("admin:media.delete.eyebrow")}
      title={
        refusal
          ? t("admin:media.delete.refusedTitle")
          : t("admin:media.delete.confirmTitle")
      }
      onClose={() => (isPending ? undefined : onCancel())}
      footer={
        <>
          <Button
            variant="ghost"
            type="button"
            disabled={isPending}
            onClick={onCancel}
          >
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="danger"
            type="button"
            disabled={isPending}
            onClick={() => onConfirm(isForced)}
          >
            {isPending
              ? t("admin:media.delete.pending")
              : isForced
                ? t("admin:media.delete.confirmAnyway")
                : t("admin:media.delete.confirm")}
          </Button>
        </>
      }
    >
      {refusal ? (
        <>
          <p className={styles.referenceWarning}>
            <FiAlertTriangle aria-hidden />
            {refusal.coverHolders
              ? t("admin:errors.mediaLiveCover")
              : refusal.isUnverified
                ? t("admin:media.delete.refusedUnverified")
                : t("admin:media.delete.refusedInUse", {
                    count: refusal.references.length,
                  })}
          </p>
          {refusal.coverHolders && (
            <ul className={styles.referencesList}>
              {refusal.coverHolders.map((holder) => (
                <li key={`${holder.kind}-${holder.entityId}`}>
                  {COVER_HOLDER_LINE[holder.kind]?.(holder, t) ?? holder.label}
                </li>
              ))}
            </ul>
          )}
          {refusal.references.length > 0 && (
            <AdminMediaReferenceList references={refusal.references} />
          )}
        </>
      ) : isReferenced ? (
        <>
          <p className={styles.referenceWarning}>
            <FiAlertTriangle aria-hidden />
            {t("admin:media.delete.confirmBodyInUse", {
              count: references.length,
            })}
          </p>
          <AdminMediaReferenceList references={references} />
        </>
      ) : degraded ? (
        <p className={styles.referenceWarning}>
          <FiAlertTriangle aria-hidden />
          {t("admin:media.references.unverified")}
        </p>
      ) : (
        <p>{t("admin:media.delete.confirmBody")}</p>
      )}
    </AdminModal>
  );
}
