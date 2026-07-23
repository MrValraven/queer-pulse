import { Button, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { type Venue } from "./map.data";
import { MapVenueCard } from "./MapVenueCard";
import s from "./LocalVenueCard.module.css";

/**
 * A venue in the unified Local list: the existing MapVenueCard (inline expand +
 * been-here) plus, when expanded, a "See full details" link to the venue detail
 * page. The link is a sibling of MapVenueCard's clickable region so it navigates
 * instead of toggling the card.
 */
export function LocalVenueCard({
  venue,
  isExpanded,
  beenCount,
  marked,
  onToggle,
  onMarkBeen,
  index,
}: {
  venue: Venue;
  isExpanded: boolean;
  beenCount: number;
  marked: boolean;
  onToggle: () => void;
  onMarkBeen: () => void;
  index: number;
}) {
  const { t } = useTranslation();
  return (
    <FadeIn delay={Math.min(index, 8) * 60} className={s.wrap}>
      <MapVenueCard
        v={venue}
        isExpanded={isExpanded}
        beenCount={beenCount}
        marked={marked}
        onToggle={onToggle}
        onMarkBeen={onMarkBeen}
      />
      {isExpanded && (
        <div className={s.detailLink}>
          <Button variant="ghost" to={`${routes.venue}/${venue.id}`}>
            {t("marketing:local.card.seeFullDetails")}
          </Button>
        </div>
      )}
    </FadeIn>
  );
}
