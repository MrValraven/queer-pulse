import type { IconType } from "react-icons";
import { FiCheckCircle, FiClock, FiMapPin, FiSlash } from "react-icons/fi";
import type { ListingOperatingState } from "../api/listings.api";
import {
  listingConfirmationAgeInDays,
  STALE_AFTER_DAYS,
} from "../../listingFreshness";

/**
 * The four states a business can report about itself, in the order an owner
 * would reach for them: still trading, on a break, gone for good, moved.
 *
 * Operating state is the BUSINESS's report about itself. It is not the
 * moderation `status`, it never triggers a re-review, and an approved listing
 * stays approved through every one of these.
 */
export interface OperatingStateOption {
  id: ListingOperatingState;
  icon: IconType;
  labelKey: string;
  descKey: string;
}

export const OPERATING_STATE_OPTIONS: OperatingStateOption[] = [
  {
    id: "open",
    icon: FiCheckCircle,
    labelKey: "marketing:listBusiness.trading.state.open.label",
    descKey: "marketing:listBusiness.trading.state.open.desc",
  },
  {
    id: "temporarily_closed",
    icon: FiClock,
    labelKey: "marketing:listBusiness.trading.state.temporarilyClosed.label",
    descKey: "marketing:listBusiness.trading.state.temporarilyClosed.desc",
  },
  {
    id: "moved",
    icon: FiMapPin,
    labelKey: "marketing:listBusiness.trading.state.moved.label",
    descKey: "marketing:listBusiness.trading.state.moved.desc",
  },
  {
    id: "permanently_closed",
    icon: FiSlash,
    labelKey: "marketing:listBusiness.trading.state.permanentlyClosed.label",
    descKey: "marketing:listBusiness.trading.state.permanentlyClosed.desc",
  },
];

/** Catalog key for a state's short name, used by the "currently" line. */
export const OPERATING_STATE_LABEL_KEYS: Record<ListingOperatingState, string> =
  Object.fromEntries(
    OPERATING_STATE_OPTIONS.map((option) => [option.id, option.labelKey]),
  ) as Record<ListingOperatingState, string>;

/** Server ceiling on the owner's public explanation. */
export const OPERATING_STATE_NOTE_MAX = 300;
/** Server ceiling on a moved business's forwarding address. */
export const MOVED_ADDRESS_MAX = 300;

/**
 * How loudly to ask for a "still accurate" confirmation.
 *
 * A directory's quiet failure is not a wrong entry, it is an entry nobody has
 * looked at in two years, so the ask escalates with age rather than nagging
 * from day one. A listing that has NEVER been confirmed counts as stale: we
 * have no evidence anyone checked it since it was written.
 */
export type DetailsFreshness = "fresh" | "ageing" | "stale";

/** Under this many days old, the confirmation is a quiet aside. */
export const DETAILS_AGEING_DAYS = 90;
/** Past this many days old, the confirmation is the loudest thing on the page.
 *  Shared with the visitor-facing freshness stamp, which draws its own line at
 *  the same six months. */
export const DETAILS_STALE_DAYS = STALE_AFTER_DAYS;

/**
 * Three tiers over the shared age reading. A listing with no usable
 * confirmation timestamp lands on "stale": the editor has a louder card to
 * show, and the age helper reports that case as a null age.
 */
export function detailsFreshness(
  detailsConfirmedAt: string | null,
  now: number = Date.now(),
): DetailsFreshness {
  const ageInDays = listingConfirmationAgeInDays(
    detailsConfirmedAt,
    new Date(now),
  );
  if (ageInDays === null) return "stale";
  if (ageInDays < DETAILS_AGEING_DAYS) return "fresh";
  if (ageInDays < DETAILS_STALE_DAYS) return "ageing";
  return "stale";
}
