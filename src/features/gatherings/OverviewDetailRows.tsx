import { FiEdit2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import { businessPath } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ManageGatheringPage.module.css";

export interface GatheringDetail {
  id: string;
  labelKey: string;
  value: string;
}

/**
 * The Overview tab's Edit control: a pencil and "Edit", named for the field it
 * opens ("Edit date") so a screen-reader list of buttons says which row each
 * one belongs to. `fieldLabel` is the field's already-translated, lower-cased
 * noun.
 *
 * The tonal `soft` pill reads as a button at rest, which matters on a phone
 * where no hover state ever arrives. On a mouse-driven screen it rests in
 * quiet ink and turns coral with its row's hover or focus (see `.drEdit` in
 * ManageGatheringPage.module.css), so a column of them stays below the page's
 * primary action. `data-tap-target` lifts its 40px `sm` height to the 44px
 * hit-area floor.
 */
export function OverviewEditButton({
  fieldLabel,
  onClick,
}: {
  fieldLabel: string;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Button
      variant="soft"
      size="sm"
      data-tap-target
      className={styles.drEdit}
      aria-label={t("gatherings:manage.overview.editAria", {
        label: fieldLabel,
      })}
      onClick={onClick}
    >
      <FiEdit2 aria-hidden="true" className={styles.drEditIcon} />
      {t("gatherings:manage.overview.editCta")}
    </Button>
  );
}

/**
 * The Overview tab's details card: one row per fact, each with its own Edit.
 *
 * The row itself stays a plain container: the venue row holds a link to the
 * venue's directory page, and a row-sized button around it would nest one
 * interactive element inside another. The row tints on hover and while its
 * Edit has focus, so it still reads as one editable unit.
 *
 * `isEditable` decides which rows get an Edit at all; a row the tab has no
 * editor for renders without one.
 */
export function OverviewDetailRows({
  details,
  venueListing,
  isEditable,
  onEdit,
}: {
  details: GatheringDetail[];
  venueListing: { slug: string; name: string } | null;
  isEditable: (detail: GatheringDetail) => boolean;
  onEdit: (detail: GatheringDetail) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.detailBlock}>
      {details.map((detail) => (
        <div className={styles.detailRow} key={detail.id}>
          <div className={styles.drLabel}>{t(detail.labelKey)}</div>
          <div className={styles.drVal}>
            {detail.id === "venue" && venueListing ? (
              <Link
                to={businessPath(venueListing.slug)}
                className={styles.venueLink}
              >
                {detail.value}
              </Link>
            ) : (
              detail.value
            )}
          </div>
          {isEditable(detail) && (
            <OverviewEditButton
              fieldLabel={t(detail.labelKey).toLowerCase()}
              onClick={() => onEdit(detail)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
