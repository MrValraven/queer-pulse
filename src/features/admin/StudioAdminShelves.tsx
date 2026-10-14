import { Button, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_CURATION_SHELVES } from "../studio/api/studio.types";
import { useAdminStudioCuration } from "./api/StudioAdminCurationHooks";
import { StudioAdminShelf } from "./StudioAdminShelf";
import { isStudioAdminForbidden, picksOnShelf } from "./studioAdmin.model";
import css from "./StudioAdminPage.module.css";

/** The Shelves tab: the featured slot, Staff picks and New this week. */
export function StudioAdminShelves() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useAdminStudioCuration();
  if (isLoading)
    return (
      <div className={css.shelves}>
        {[0, 1, 2].map((skeletonIndex) => (
          <SkeletonLine
            key={skeletonIndex}
            height={120}
            style={{ borderRadius: 14 }}
          />
        ))}
      </div>
    );
  if (data === undefined) {
    const isForbidden = isStudioAdminForbidden(error);
    return (
      <div className={css.notice}>
        <p className={css.noticeText}>
          {isForbidden
            ? t("admin:studioAdmin.forbidden")
            : t("admin:studioAdmin.loadError")}
        </p>
        {!isForbidden && (
          <Button variant="ghost" size="sm" onClick={() => void refetch()}>
            {t("admin:studioAdmin.retryCta")}
          </Button>
        )}
      </div>
    );
  }
  return (
    <div className={css.shelves}>
      {STUDIO_CURATION_SHELVES.map((shelf) => (
        <StudioAdminShelf
          key={shelf}
          shelf={shelf}
          picks={picksOnShelf(data, shelf)}
        />
      ))}
    </div>
  );
}
