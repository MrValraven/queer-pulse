import type { IconType } from "react-icons";
import {
  FiEdit3,
  FiHelpCircle,
  FiImage,
  FiLink,
  FiMail,
  FiMessageSquare,
  FiUsers,
} from "react-icons/fi";

/** Who is deleting: the listing's owner, or a moderator removing it. */
export type ListingDeleteFlowVariant = "owner" | "moderator";

/** The steps of the delete flow, in the order a variant walks them. */
export type ListingDeleteStepKind =
  "losses" | "acknowledge" | "reason" | "confirmName";

/** Strictly sequential. Only the moderator writes a reason, because the
 *  backend sends it to the owner as a direct message. */
export const LISTING_DELETE_STEPS: Record<
  ListingDeleteFlowVariant,
  readonly ListingDeleteStepKind[]
> = {
  owner: ["losses", "acknowledge", "confirmName"],
  moderator: ["losses", "acknowledge", "reason", "confirmName"],
};

const KEY_PREFIX = "marketing:listBusiness.deleteFlow";

export interface ListingDeleteLossItem {
  id: string;
  labelKey: string;
  icon: IconType;
}

/** Everything the backend's hard delete cascades away. Linked gatherings are
 *  kept (they only lose the place link), so they live in their own note. */
export const LISTING_DELETE_LOSS_ITEMS: readonly ListingDeleteLossItem[] = [
  {
    id: "reviews",
    labelKey: `${KEY_PREFIX}.losses.reviews`,
    icon: FiMessageSquare,
  },
  {
    id: "questions",
    labelKey: `${KEY_PREFIX}.losses.questions`,
    icon: FiHelpCircle,
  },
  { id: "enquiries", labelKey: `${KEY_PREFIX}.losses.enquiries`, icon: FiMail },
  {
    id: "coManagers",
    labelKey: `${KEY_PREFIX}.losses.coManagers`,
    icon: FiUsers,
  },
  { id: "offers", labelKey: `${KEY_PREFIX}.losses.offers`, icon: FiEdit3 },
  { id: "photos", labelKey: `${KEY_PREFIX}.losses.photos`, icon: FiImage },
  {
    id: "publicPage",
    labelKey: `${KEY_PREFIX}.losses.publicPage`,
    icon: FiLink,
  },
];

export interface ListingDeleteAcknowledgement {
  id: string;
  labelKey: string;
}

const PERMANENT_ACKNOWLEDGEMENT: ListingDeleteAcknowledgement = {
  id: "permanent",
  labelKey: `${KEY_PREFIX}.acknowledge.permanent`,
};

const REVIEWS_ACKNOWLEDGEMENT: ListingDeleteAcknowledgement = {
  id: "reviewsAndEnquiries",
  labelKey: `${KEY_PREFIX}.acknowledge.reviewsAndEnquiries`,
};

/** Three required ticks per variant. The moderator swaps the co-managers
 *  line for the message the owner receives with the reason. */
export const LISTING_DELETE_ACKNOWLEDGEMENTS: Record<
  ListingDeleteFlowVariant,
  readonly ListingDeleteAcknowledgement[]
> = {
  owner: [
    PERMANENT_ACKNOWLEDGEMENT,
    REVIEWS_ACKNOWLEDGEMENT,
    { id: "coManagers", labelKey: `${KEY_PREFIX}.acknowledge.coManagers` },
  ],
  moderator: [
    PERMANENT_ACKNOWLEDGEMENT,
    REVIEWS_ACKNOWLEDGEMENT,
    { id: "ownerMessage", labelKey: `${KEY_PREFIX}.acknowledge.ownerMessage` },
  ],
};

/** The visible footer line beside a disabled Continue or Delete, naming what is
 *  still missing. Step 1 has nothing to satisfy, so it has no hint. */
export const LISTING_DELETE_STEP_HINT_KEYS: Record<
  ListingDeleteStepKind,
  string | null
> = {
  losses: null,
  acknowledge: `${KEY_PREFIX}.hint.acknowledge`,
  reason: `${KEY_PREFIX}.hint.reason`,
  confirmName: `${KEY_PREFIX}.hint.confirmName`,
};
