import { Link } from "react-router-dom";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioReleaseCardView } from "./api/studio.adapters";
import type { StudioReleaseStatus } from "./api/studio.types";
import { studioUploadPath } from "./studioPaths";
import ownerStyles from "./StudioArtistOwner.module.css";

export interface OwnerRow {
  release: StudioReleaseCardView;
  status: StudioReleaseStatus;
  statusLabelKey: string;
  takedownReason: string | null;
}

export type OwnerAction = "publish" | "unpublish" | "delete";

/** One of the artist's own releases with the actions its status allows:
 *  a draft can be edited, published or deleted; a published release can be
 *  edited or unpublished; a taken-down one shows staff's reason. A busy
 *  button stays focusable (aria-disabled) and ignores presses. */
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
  const { release, status } = row;

  function actionButton(
    action: OwnerAction,
    labelKey: string,
    ariaKey: string,
  ) {
    return (
      <button
        type="button"
        className={ownerStyles.action}
        aria-disabled={isBusy || undefined}
        aria-label={t(ariaKey, { title: release.title })}
        onClick={() => {
          if (!isBusy) onAction(action, row);
        }}
      >
        {t(labelKey)}
      </button>
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
          <Link
            to={studioUploadPath(release.id)}
            className={ownerStyles.action}
            aria-label={t("studio:owner.editAria", { title: release.title })}
          >
            {t("studio:owner.edit")}
          </Link>
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
