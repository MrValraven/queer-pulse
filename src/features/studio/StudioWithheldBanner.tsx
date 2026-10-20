import { FiCloudOff } from "react-icons/fi";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import css from "./StudioClaimPanel.module.css";

/** The one line, above the owner's claim panels, that says a claim holds a
 *  track offline (spec 5.3). The track page leaves out `heldTrackCount`; the
 *  release page passes it, since its panels may cover several tracks. */
export function StudioWithheldBanner({
  isShown,
  heldTrackCount,
}: {
  isShown: boolean;
  heldTrackCount?: number;
}) {
  const { t } = useTranslation();
  return (
    <Collapse isOpen={isShown}>
      <p className={css.banner}>
        <FiCloudOff aria-hidden />
        {heldTrackCount === undefined
          ? t("studio:claimPanel.withheldBanner")
          : t("studio:claimPanel.withheldBannerRelease", {
              count: heldTrackCount,
            })}
      </p>
    </Collapse>
  );
}

/** The owner's tracklist row for a track a claim holds offline: the row
 *  stays whole, and this tag says listeners can't play it right now. */
export function StudioOfflineTag() {
  const { t } = useTranslation();
  return (
    <span className={css.offlineTag}>
      <FiCloudOff aria-hidden />
      {t("studio:claimPanel.offlineTag")}
    </span>
  );
}
