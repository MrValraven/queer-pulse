import { emptyHours, type ListingDraft } from "./listBusiness.data";
import { normalizeAccessibilityDraft } from "./listingAccessibility.data";
import { emptyMenuDraft } from "./listingMenu.data";

/** A brand-new draft's accessibility block: all six questions unanswered and
 *  no note. Unanswered is a real state, never a hidden "no". */
function emptyAccessibilityDraft() {
  return normalizeAccessibilityDraft(null);
}

/** Fields we can safely pre-fill from the signed-in member's profile (item #3).
 *  Only applied when building a BLANK draft — never over an edit/resumed one. */
export interface ListingSeed {
  ownerName?: string;
  ownerBio?: string;
}

/** A brand-new, un-submitted listing draft. Every field starts at its own
 *  "nothing chosen yet" value except the handful `seed` pre-fills from the
 *  signed-in member's profile. */
export function blankDraft(seed?: ListingSeed): ListingDraft {
  return {
    path: "",
    name: "",
    cats: [],
    hood: "",
    badge: "",
    evidence: "",
    price: "",
    blurb: "",
    tagline: "",
    // The description, one entry per paragraph: an empty field holds none.
    whatItIs: [],
    tags: [],
    goodFor: [],
    accessibility: emptyAccessibilityDraft(),
    services: [],
    pricingMode: "services",
    menu: emptyMenuDraft(),
    langs: [],
    online: false,
    address: "",
    geocoded: false,
    latitude: null,
    longitude: null,
    hours: emptyHours(),
    hoursNote: "",
    hoursExceptions: [],
    social: { instagram: "", website: "", email: "", phone: "" },
    photos: { wide: "", d1: "", d2: "", vibe: "" },
    alt: { wide: "", d1: "", d2: "", vibe: "" },
    rel: "",
    ownerName: seed?.ownerName ?? "",
    ownerRole: "",
    ownerBio: seed?.ownerBio ?? "",
    visibility: "public",
    linkToProfile: true,
    consentOuting: false,
    consentGuide: false,
    // Agreeing is the condition of listing at all, so a fresh draft starts
    // un-agreed and the submit stays out of reach until the member says yes.
    affirmingBaselineAccepted: false,
  };
}
