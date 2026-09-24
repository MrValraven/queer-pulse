import type { RefObject } from "react";
import { FiCalendar } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  LISTING_DELETE_LOSS_ITEMS,
  type ListingDeleteFlowVariant,
} from "./listingDeleteFlow.data";
import { ListingDeleteGentlerExits } from "./ListingDeleteGentlerExits";
import { ListingDeleteStepHeading } from "./ListingDeleteStepHeading";
import styles from "./ListingDeleteFlow.module.css";

/**
 * Step 1: what the hard delete takes with it, what survives (linked gatherings,
 * without the place), and that it cannot be undone. The owner variant
 * also offers the two gentler exits, right under the intro, when the caller
 * wires them.
 */
export function ListingDeleteLossesStep({
  variant,
  headingRef,
  stepCountId,
  gentlerOptions,
}: {
  variant: ListingDeleteFlowVariant;
  headingRef: RefObject<HTMLHeadingElement | null>;
  stepCountId: string;
  gentlerOptions?: {
    onHideInstead: () => void;
    onMarkClosedInstead: () => void;
  };
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.step}>
      <ListingDeleteStepHeading
        headingRef={headingRef}
        stepCountId={stepCountId}
      >
        {t("marketing:listBusiness.deleteFlow.losses.heading")}
      </ListingDeleteStepHeading>
      <p className={styles.lead}>
        {variant === "owner"
          ? t("marketing:listBusiness.deleteFlow.losses.intro.owner")
          : t("marketing:listBusiness.deleteFlow.losses.intro.moderator")}
      </p>
      {/* Right under the intro, where it is seen before the list pushes it
          below the fold on small screens. */}
      {variant === "owner" && gentlerOptions && (
        <ListingDeleteGentlerExits
          onHideInstead={gentlerOptions.onHideInstead}
          onMarkClosedInstead={gentlerOptions.onMarkClosedInstead}
        />
      )}
      <ul className={styles.lossList}>
        {LISTING_DELETE_LOSS_ITEMS.map((lossItem) => (
          <li key={lossItem.id} className={styles.lossItem}>
            <lossItem.icon className={styles.lossIcon} aria-hidden />
            {t(lossItem.labelKey)}
          </li>
        ))}
      </ul>
      <p className={styles.keptNote}>
        <FiCalendar className={styles.lossIcon} aria-hidden />
        {t("marketing:listBusiness.deleteFlow.losses.gatheringsStay")}
      </p>
      <p className={styles.noUndo}>
        {/* The moderator path keeps an audit record with the reason, so only
            the owner's copy can promise that nothing is kept. */}
        {variant === "owner"
          ? t("marketing:listBusiness.deleteFlow.losses.noUndo.owner")
          : t("marketing:listBusiness.deleteFlow.losses.noUndo.moderator")}
      </p>
    </div>
  );
}
