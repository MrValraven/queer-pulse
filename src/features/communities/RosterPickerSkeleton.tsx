import { SkeletonAvatar, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./RosterPickerSkeleton.module.css";

/** Row widths for the placeholder names, so the rows read as a list of
 *  different people. */
const NAME_WIDTHS = ["58%", "44%", "66%"];

/**
 * The roster picker's waiting state while the community's roster is still on
 * its way: a few member-shaped rows where the list will be, so the ownership
 * dialogs never claim the roster is empty before it has loaded. A screen
 * reader hears the loading line from the visually hidden text.
 */
export function RosterPickerSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className={styles.list}
      // No aria-busy: a busy live region holds back its own announcement,
      // and this one unmounts the moment the roster lands.
      role="status"
      aria-label={t("communities:ownershipOffer.rosterLoading")}
    >
      {/* The live region's spoken line; the rows below are decoration. */}
      <span className="visuallyHidden">
        {t("communities:ownershipOffer.rosterLoading")}
      </span>
      {NAME_WIDTHS.map((width) => (
        <div key={width} className={styles.row} aria-hidden>
          <SkeletonAvatar size={36} />
          <SkeletonLine width={width} />
        </div>
      ))}
    </div>
  );
}
