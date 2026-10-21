import { Link } from "react-router-dom";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseCardView } from "./api/studio.adapters";
import type { StudioReleaseStatus } from "./api/studio.types";
import { studioEpisodeUploadPath, studioUploadPath } from "./studioPaths";
import { outDateOf } from "./studioUpcoming";
import ownerStyles from "./StudioArtistOwner.module.css";

export interface OwnerRow {
  release: StudioReleaseCardView;
  status: StudioReleaseStatus;
  statusLabelKey: string;
  takedownReason: string | null;
  /** Set while scheduled (Studio v3). */
  publishAt: string | null;
}

export type OwnerAction = "publish" | "unpublish" | "delete" | "previewLink";

/** One of the artist's own releases with the actions its status allows:
 *  a draft can be edited, previewed by link, published or deleted; a
 *  scheduled release can be edited or previewed by link; a published
 *  release can be edited or unpublished; a taken-down one shows staff's
 *  reason. A busy button stays focusable (aria-disabled) and ignores
 *  presses. */
export function StudioOwnerReleaseRow({
  row,
  isBusy,
  errorKey,
  onAction,
}: {
  row: OwnerRow;
  isBusy: boolean;
  errorKey: string | null;
  onAction: (action: OwnerAction, row: OwnerRow) => void;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const { release, status } = row;
  const outLine =
    status === "scheduled" ? outDateOf(row.publishAt, formatters) : null;

  function actionButton(
    action: OwnerAction,
    labelKey: string,
    ariaKey: string,
  ) {
    return (
      <Button
        variant="quiet"
        size="sm"
        aria-disabled={isBusy || undefined}
        aria-label={t(ariaKey, { title: release.title })}
        onClick={() => {
          if (!isBusy) onAction(action, row);
        }}
      >
        {t(labelKey)}
      </Button>
    );
  }

  return (
    <li className={ownerStyles.row}>
      <span className={ownerStyles.cover}>
        <ImageSlot
          src={release.coverUrl ?? undefined}
          tint={release.tint}
          width={44}
          height={44}
          radius={6}
          placeholder=""
        />
      </span>
      <div className={ownerStyles.info}>
        <Link to={release.href} className={ownerStyles.title}>
          {release.title}
        </Link>
        <span className={ownerStyles.status} data-status={status}>
          {t(row.statusLabelKey)}
        </span>
        {outLine && (
          <span className={ownerStyles.when}>
            {t("studio:upcoming.outOn", outLine)}
          </span>
        )}
        {status === "taken_down" && row.takedownReason && (
          <p className={ownerStyles.reason}>
            {t("studio:owner.takedownReason", { reason: row.takedownReason })}
          </p>
        )}
        {errorKey && (
          <p className={ownerStyles.error} role="alert">
            {t(errorKey)}
          </p>
        )}
      </div>
      <div className={ownerStyles.actions}>
        {status !== "taken_down" && (
          <Button
            variant="quiet"
            size="sm"
            to={studioUploadPath(release.id)}
            aria-label={t("studio:owner.editAria", { title: release.title })}
          >
            {t("studio:owner.edit")}
          </Button>
        )}
        {/* Studio artist kinds: episodes are added one by one once the show
            is live (spec 6.2). A scheduled show offers Edit only. */}
        {release.isShow && status === "published" && (
          <Button
            variant="quiet"
            size="sm"
            to={studioEpisodeUploadPath(release.id)}
            aria-label={t("studio:owner.addEpisodeAria", {
              title: release.title,
            })}
          >
            {t("studio:show.addEpisodeCta")}
          </Button>
        )}
        {(status === "draft" || status === "scheduled") &&
          actionButton(
            "previewLink",
            "studio:owner.v3.previewLink",
            "studio:owner.v3.previewLinkAria",
          )}
        {status === "draft" &&
          actionButton(
            "publish",
            "studio:owner.publish",
            "studio:owner.publishAria",
          )}
        {status === "published" &&
          actionButton(
            "unpublish",
            "studio:owner.unpublish",
            "studio:owner.unpublishAria",
          )}
        {status === "draft" &&
          actionButton(
            "delete",
            "studio:owner.delete",
            "studio:owner.deleteAria",
          )}
      </div>
    </li>
  );
}
