import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminStudioLandingPreviewDTO } from "./api/studioLandingAdmin.api";
import { ineligibleLabelKeyOf } from "./studioAdmin.model";
import { AdminChip, type AdminTone } from "./ui";
import css from "./StudioAdminLanding.module.css";

const STATUS_TONE: Record<AdminStudioLandingPreviewDTO["status"], AdminTone> = {
  pending: "amber",
  approved: "jade",
  declined: "ghost",
  withdrawn: "ghost",
};

const STATUS_LABEL_KEY: Record<AdminStudioLandingPreviewDTO["status"], string> =
  {
    pending: "admin:studioAdmin.landing.previews.status.pending",
    approved: "admin:studioAdmin.landing.previews.status.approved",
    declined: "admin:studioAdmin.landing.previews.status.declined",
    withdrawn: "admin:studioAdmin.landing.previews.status.withdrawn",
  };

/** The text of a preview row: track, artist and release, the status chips,
 *  who asked and (staff only) who answered. */
export function StudioAdminLandingPreviewInfo({
  preview,
}: {
  preview: AdminStudioLandingPreviewDTO;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  // An approved row that cannot play now says why; other rows wait on a
  // person, so a reason would only confuse.
  const mutedKey =
    preview.status === "approved"
      ? ineligibleLabelKeyOf(preview.ineligibleReason)
      : null;
  return (
    <div className={css.main}>
      <span className={css.rowTitle}>{preview.track.title}</span>
      <span className={css.rowMeta}>
        {preview.artist.name} · {preview.release.title}
      </span>
      <div className={css.chips}>
        <AdminChip tone={STATUS_TONE[preview.status]}>
          {t(STATUS_LABEL_KEY[preview.status])}
        </AdminChip>
        {preview.isOnLanding && (
          <AdminChip tone="coral">
            {t("admin:studioAdmin.landing.previews.onLanding")}
          </AdminChip>
        )}
        {mutedKey && <AdminChip tone="amber">{t(mutedKey)}</AdminChip>}
      </div>
      {preview.requestedBy && (
        <span className={css.rowMeta}>
          {t("admin:studioAdmin.landing.previews.askedBy", {
            name: preview.requestedBy.displayName,
            date: fmt.date(new Date(preview.requestedAt)),
          })}
        </span>
      )}
      {preview.decidedBy && preview.decidedAt && (
        <span className={css.rowMeta}>
          {t("admin:studioAdmin.landing.previews.answeredBy", {
            name: preview.decidedBy.displayName,
            date: fmt.date(new Date(preview.decidedAt)),
          })}
        </span>
      )}
    </div>
  );
}
