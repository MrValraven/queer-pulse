import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formattedCountValues } from "./deskHeaderCopy";
import { useSettledCountAnnouncement } from "./useSettledCountAnnouncement";

/**
 * A visually hidden, polite status line that says how many pieces the desk
 * shows once search, a focus chip or a filter has settled the list, so a
 * screen reader hears what a sighted editor sees change. Quiet on first
 * load (`useSettledCountAnnouncement`). Mounted for the whole life of the
 * work area, since a live region must exist before its text changes.
 */
export function DeskShownCountStatus({ count }: { count: number }) {
  const { t } = useTranslation();
  const format = useFormat();
  const announcedCount = useSettledCountAnnouncement(count);

  return (
    <p role="status" className="visuallyHidden">
      {announcedCount === null
        ? ""
        : t(
            "magazine:desk.workArea.shownCount",
            formattedCountValues(announcedCount, format.number),
          )}
    </p>
  );
}
