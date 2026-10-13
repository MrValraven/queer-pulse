import type { IconType } from "react-icons";
import { FiCalendar, FiMoon, FiUsers } from "react-icons/fi";
import { Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  cardHighlights,
  DIRECTORY_CARD_BADGE_CAP,
  DIRECTORY_CARD_BADGE_LABEL_KEYS,
  DIRECTORY_CARD_BADGE_ORDER,
  directoryCardBadges,
  type DirectoryCardBadge,
  priceBandLabel,
} from "./directoryCardFacts";
import type { DirectoryPlace } from "./directoryPlaces";
import {
  attributeLabel,
  type ListingAttributeSlug,
} from "./listBusiness/listingAttributes.data";
import {
  OWNED_BY_TAG_KEYS,
  type ListingOwnedBy,
} from "./listBusiness/listingOwnedBy.data";
import s from "./DirectoryPage.module.css";

/** How many "who runs it" tags the card names before the "+N" count. */
const OWNED_BY_SHOWN_CAP = 1;

const BADGE_ICONS: Record<DirectoryCardBadge, IconType> = {
  openLate: FiMoon,
  openSundays: FiCalendar,
  hostsGatherings: FiUsers,
};

/** The highlight that already says what a badge would, so the badge stays
 *  off a card that shows it. */
const BADGE_REPEATED_BY_HIGHLIGHT: Record<
  DirectoryCardBadge,
  ListingAttributeSlug | null
> = {
  openLate: "kitchen-open-late",
  openSundays: null,
  hostsGatherings: "hosts-events",
};

/**
 * The badges this card shows: the ones it earns, less any its highlights
 * already say, at most two. `directoryCardBadges` caps its answer at two, so
 * Hosts gatherings (earned by its flag alone, and last in the order) joins
 * the earned set again before the repeats drop out and the cap applies.
 */
function shownCardBadges(place: DirectoryPlace): DirectoryCardBadge[] {
  const highlights: readonly string[] = place.highlights ?? [];
  const earned = new Set(directoryCardBadges(place));
  if (place.hostsGatherings === true) earned.add("hostsGatherings");
  return DIRECTORY_CARD_BADGE_ORDER.filter((badge) => {
    const repeatedBy = BADGE_REPEATED_BY_HIGHLIGHT[badge];
    const isRepeated = repeatedBy !== null && highlights.includes(repeatedBy);
    return earned.has(badge) && !isRepeated;
  }).slice(0, DIRECTORY_CARD_BADGE_CAP);
}

/**
 * The first "who runs it" tag, then a plain "+N" for the rest with their
 * names on hover. The whole card is a link, so the count takes no focus; a
 * visually hidden line reads the hidden tags out for screen readers.
 */
function OwnedByPills({ ownedBy }: { ownedBy: readonly ListingOwnedBy[] }) {
  const { t } = useTranslation();
  const hiddenLabels = ownedBy
    .slice(OWNED_BY_SHOWN_CAP)
    .map((value) => t(OWNED_BY_TAG_KEYS[value]));
  return (
    <>
      {ownedBy.slice(0, OWNED_BY_SHOWN_CAP).map((value) => (
        <span key={value} className={`${s.pill} ${s.pillOwnedBy}`}>
          {t(OWNED_BY_TAG_KEYS[value])}
        </span>
      ))}
      {hiddenLabels.length > 0 && (
        <>
          <span className={s.moreChip} aria-hidden>
            <Tooltip label={hiddenLabels.join(", ")} placement="floating-top">
              <span>
                {t("marketing:directory.card.moreCount", {
                  count: hiddenLabels.length,
                })}
              </span>
            </Tooltip>
          </span>
          <span className="visuallyHidden">{hiddenLabels.join(", ")}</span>
        </>
      )}
    </>
  );
}

/** The second row: what the card works out for itself, each with its icon so
 *  it reads apart from the owner's highlights in either theme. */
function DirectoryCardBadgeRow({
  badges,
}: {
  badges: readonly DirectoryCardBadge[];
}) {
  const { t } = useTranslation();
  return (
    <div className={s.badgeRow}>
      {badges.map((badge) => {
        const BadgeIcon = BADGE_ICONS[badge];
        return (
          <span key={badge} className={`${s.pill} ${s.pillBadge}`}>
            <BadgeIcon aria-hidden />
            <span className={s.pillBadgeLabel}>
              {t(DIRECTORY_CARD_BADGE_LABEL_KEYS[badge])}
            </span>
          </span>
        );
      })}
    </div>
  );
}

/**
 * The card's pills, in two rows. Row one: "Member-run" and the first of the
 * owner's own "who runs it" tags lead, so they survive a narrow column
 * (someone filtering for a trans-owned place must see why each card matched),
 * then the price band and the owner's three highlights. That row is one line
 * tall; what does not fit is clipped, last first. Row two holds the badges the
 * card works out for itself (`shownCardBadges`) and is drawn only when there
 * is one, so a card without badges keeps its height.
 */
export function DirectoryCardPills({
  place,
  isMemberShown = true,
  isHiddenWhenEmpty = false,
}: {
  place: DirectoryPlace;
  /** The Online tab's card names no member-run pill. */
  isMemberShown?: boolean;
  /** The list card keeps its empty first row (it holds the card's height);
   *  the Online tab's card drops it. */
  isHiddenWhenEmpty?: boolean;
}) {
  const { t } = useTranslation();
  const price = priceBandLabel(t, place.price);
  const highlights = cardHighlights(place.highlights);
  const badges = shownCardBadges(place);
  const ownedBy = place.ownedBy ?? [];
  const isMemberPillShown = isMemberShown && Boolean(place.member);
  const isFirstRowEmpty =
    !isMemberPillShown &&
    ownedBy.length === 0 &&
    !price &&
    highlights.length === 0;
  const isFirstRowShown = !isFirstRowEmpty || !isHiddenWhenEmpty;
  if (!isFirstRowShown && badges.length === 0) return null;

  return (
    <div className={s.pillRows} data-preview-region="pills">
      {isFirstRowShown && (
        <div className={s.pillsRow}>
          {isMemberPillShown && (
            <span className={`${s.pill} ${s.pillMember}`}>
              {t("marketing:directory.card.memberRun")}
            </span>
          )}
          <OwnedByPills ownedBy={ownedBy} />
          {price && <span className={`${s.pill} ${s.pillPrice}`}>{price}</span>}
          {highlights.map((slug) => (
            <span key={slug} className={s.pill}>
              {attributeLabel(t, slug)}
            </span>
          ))}
        </div>
      )}
      {badges.length > 0 && <DirectoryCardBadgeRow badges={badges} />}
    </div>
  );
}
