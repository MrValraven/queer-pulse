import { useTranslation } from "../../shared/i18n/useTranslation";
import { useWaitingOwnershipOfferCount } from "./useCommunityOwnershipOfferBadge";

/**
 * The account menu trigger's dot while ownership offers wait, so a member
 * sees there is something to answer before opening the menu. The sentence
 * rides along for assistive tech, since the trigger's name is the member's
 * own. Renders nothing when nothing waits.
 */
export function OwnershipOfferTriggerDot({
  className,
}: {
  className?: string;
}) {
  const { t } = useTranslation();
  const count = useWaitingOwnershipOfferCount();
  if (count === 0) return null;
  return (
    <>
      <span className={className} aria-hidden />
      <span className="visuallyHidden">
        {t("communities:ownershipOffer.badgeLabel", { count })}
      </span>
    </>
  );
}
