import { ANCHOR, type ListingDraft } from "../listBusiness.data";
import {
  ACCESSIBILITY_QUESTIONS,
  normalizeAccessibilityAnswers,
} from "../listingAccessibility.data";
import { isCoManaged } from "../ownerPersonalFields";

/**
 * Where each listing field shows up, so the live preview can outline the spot
 * a field fills while the member is on it, and say who sees the fields that
 * never reach the public listing.
 *
 * Card regions match the `data-preview-region` attributes in
 * `LocalBusinessCardBody` (and the placeholder card in
 * `ListingLivePreviewBody`); excerpt regions match the ones in
 * `ListingLivePreviewExcerpt`.
 */
export type ListingPreviewRegion =
  | "photo"
  | "badge"
  | "name"
  | "meta"
  | "desc"
  | "pills"
  | "access"
  | "status"
  | "host"
  | "tagline"
  | "whatItIs"
  | "goodFor"
  | "languages"
  | "hours"
  | "owner";

export type ListingFieldPlacement =
  | {
      kind: "preview";
      regions: ListingPreviewRegion[];
      captionKey: string;
      /** The placeholder card holds only stand-in text in this field's spot,
       *  so the field outlines nothing until the real card is drawn. */
      isNamedCardOnly?: boolean;
    }
  /** Shows publicly, only on the full listing page. */
  | { kind: "fullPage"; captionKey: string }
  /** Never shown publicly. */
  | { kind: "private"; captionKey: string }
  /** A choice about the listing itself, with no personal data in it. */
  | { kind: "setting"; captionKey: string }
  /** Saved with the listing, but no public view renders it right now. */
  | { kind: "notShown"; captionKey: string };

export type AnchorId = (typeof ANCHOR)[keyof typeof ANCHOR];

/** The regions the preview carries a `data-preview-region` attribute for. */
export const LISTING_PREVIEW_RENDERED_REGIONS: readonly ListingPreviewRegion[] =
  [
    "photo",
    "badge",
    "name",
    "meta",
    "desc",
    "pills",
    "access",
    "status",
    "host",
    "tagline",
    "whatItIs",
    "goodFor",
    "languages",
    "hours",
    "owner",
  ];

const CAPTION = "marketing:listBusiness.livePreview.caption";

/** Shown when no field is focused or hovered. */
export const LISTING_PREVIEW_IDLE_CAPTION_KEY = `${CAPTION}.idle`;

/** Shown for a card field while the preview still has the placeholder card
 *  (no name yet), so none of the field's spots are on screen. */
export const LISTING_PREVIEW_WILL_SHOW_CAPTION_KEY = `${CAPTION}.willShow`;

const preview = (
  captionName: string,
  ...regions: ListingPreviewRegion[]
): ListingFieldPlacement => ({
  kind: "preview",
  regions,
  captionKey: `${CAPTION}.${captionName}`,
});
const fullPage = (captionName: string): ListingFieldPlacement => ({
  kind: "fullPage",
  captionKey: `${CAPTION}.${captionName}`,
});
const hidden = (captionName: string): ListingFieldPlacement => ({
  kind: "private",
  captionKey: `${CAPTION}.${captionName}`,
});
const setting = (captionName: string): ListingFieldPlacement => ({
  kind: "setting",
  captionKey: `${CAPTION}.${captionName}`,
});
const notShown = (captionName: string): ListingFieldPlacement => ({
  kind: "notShown",
  captionKey: `${CAPTION}.${captionName}`,
});
/** A card spot the placeholder card only fakes: its meta line reads
 *  "category · neighbourhood" whatever the draft says, so "Online" is never
 *  on it and the caption falls back to the "once it has a name" line. */
const namedCardPreview = (
  captionName: string,
  ...regions: ListingPreviewRegion[]
): ListingFieldPlacement => ({
  kind: "preview",
  regions,
  captionKey: `${CAPTION}.${captionName}`,
  isNamedCardOnly: true,
});

/**
 * A fixed placement, or one that depends on the draft: the owner's chosen
 * visibility decides whether their name, role and profile link reach the
 * public listing at all (`submittedOwnerIdentity` in `api/directory.adapters`
 * and the backend's `ownerIdentity` hold the rules).
 */
export type ListingPlacementRule =
  ListingFieldPlacement | ((draft: ListingDraft) => ListingFieldPlacement);

/** Whether the card's accessibility row renders: `DirectoryCardAccess` shows
 *  it only when at least one answer is yes. */
export function hasCardAccessAnswers(draft: ListingDraft): boolean {
  const answers = normalizeAccessibilityAnswers(draft.accessibility?.answers);
  return ACCESSIBILITY_QUESTIONS.some(
    (question) => answers[question.slug] === "yes",
  );
}

/** Public: the page names the owner, and the card does too once the profile
 *  is linked. Role: only the role shows. Anonymous: nothing personal shows. */
function ownerNamePlacement(draft: ListingDraft): ListingFieldPlacement {
  if (draft.visibility === "anon") return hidden("ownerNameAnon");
  if (draft.visibility === "role") return hidden("ownerNameRoleMode");
  return preview("ownerName", "host", "owner");
}

/**
 * A co-manager's draft holds blank stand-ins for the owner's visibility
 * (`ownerPersonalFields`), so their caption cannot know the owner's mode and
 * names the one case that hides the role.
 */
function ownerRolePlacement(draft: ListingDraft): ListingFieldPlacement {
  if (isCoManaged(draft)) return preview("ownerRoleCoManager", "owner");
  if (draft.visibility === "anon") return hidden("ownerRoleAnon");
  if (draft.visibility === "role") return preview("ownerRoleInPlace", "owner");
  return preview("ownerRole", "owner");
}

/** The backend links the owner's profile only for public visibility
 *  (`isOwnerPubliclyNamed`), so the toggle does nothing in the other modes.
 *  Linked, the card gains the "run by" line and the Member-run pill
 *  (`submittedToPlace`'s `member`), and the byline links the profile. */
function linkProfilePlacement(draft: ListingDraft): ListingFieldPlacement {
  if (draft.visibility === "anon" || draft.visibility === "role") {
    return hidden("linkProfileUnused");
  }
  return preview("linkProfile", "host", "pills", "owner");
}

/**
 * The detail page drops its whole hours section for an online listing
 * (`DirectoryHoursSection`), note and special dates included, and the editor
 * hides the hours fields then. The card keeps its open or closed line, which
 * `DirectoryCardStatus` still works out from the saved hours.
 */
function hoursPlacement(draft: ListingDraft): ListingFieldPlacement {
  return draft.online
    ? preview("hoursOnline", "status")
    : preview("hours", "status", "hours");
}

/**
 * A full `Record`, so adding an `ANCHOR` without saying where it shows fails
 * the typecheck. Each entry was checked against `submittedToPlace`, the card
 * body, the preview excerpt and the public detail DTO.
 */
export const LISTING_FIELD_PLACEMENTS: Record<AnchorId, ListingPlacementRule> =
  {
    [ANCHOR.path]: hidden("path"),
    [ANCHOR.name]: preview("name", "name"),
    [ANCHOR.cats]: preview("cats", "meta"),
    // An online listing's card prints "Online" where the neighbourhood goes.
    [ANCHOR.hood]: (draft) =>
      draft.online
        ? namedCardPreview("hoodOnline", "meta")
        : preview("hood", "meta"),
    [ANCHOR.badge]: preview("badge", "badge"),
    // Co-managers receive the evidence too: it is no owner-personal field.
    [ANCHOR.evidence]: hidden("evidence"),
    [ANCHOR.price]: preview("price", "pills"),
    [ANCHOR.blurb]: preview("blurb", "desc"),
    [ANCHOR.tagline]: preview("tagline", "tagline"),
    [ANCHOR.whatItIs]: preview("whatItIs", "whatItIs"),
    [ANCHOR.tags]: preview("tags", "pills"),
    [ANCHOR.goodFor]: preview("goodFor", "goodFor"),
    [ANCHOR.langs]: preview("langs", "languages"),
    [ANCHOR.address]: fullPage("address"),
    [ANCHOR.online]: namedCardPreview("online", "meta"),
    [ANCHOR.hours]: hoursPlacement,
    // "Copy Monday to all days" and "Mark all closed" sit above the grid
    // that carries `ANCHOR.hours`, and they fill the same spots.
    [ANCHOR.hoursTools]: hoursPlacement,
    // `DirectoryHoursSection` prints the note; the preview excerpt does not.
    [ANCHOR.hoursNote]: (draft) =>
      draft.online ? notShown("hoursNoteOnline") : fullPage("hoursNote"),
    // The card's status line follows a special date on the day.
    [ANCHOR.hoursExceptions]: (draft) =>
      draft.online
        ? preview("hoursExceptionsOnline", "status")
        : fullPage("hoursExceptions"),
    [ANCHOR.social]: fullPage("social"),
    [ANCHOR.photos]: preview("photos", "photo"),
    [ANCHOR.rel]: hidden("rel"),
    [ANCHOR.ownerName]: ownerNamePlacement,
    [ANCHOR.ownerRole]: ownerRolePlacement,
    // The public detail payload carries the bio (public and role modes), but
    // no public component renders it since `DirectoryOwnerByline` replaced
    // the "Who runs it" card. The caption says only that, and makes no claim
    // about who can read it.
    [ANCHOR.ownerBio]: notShown("ownerBio"),
    [ANCHOR.ownerVisibility]: (draft) =>
      draft.visibility === "anon"
        ? hidden("ownerVisibilityAnon")
        : preview("ownerVisibility", "owner", "host"),
    [ANCHOR.linkProfile]: linkProfilePlacement,
    [ANCHOR.contactEmail]: hidden("contactEmail"),
    [ANCHOR.consent]: hidden("consent"),
    [ANCHOR.pricingMode]: fullPage("pricingMode"),
    [ANCHOR.services]: fullPage("services"),
    // The preview draft carries no trading state, so the outline marks where
    // the live card prints it (in place of the open or closed line). A
    // permanently closed listing also leaves the directory's lists
    // (`excludeHiddenFromDirectory` in the backend), and its page stays up.
    [ANCHOR.operatingState]: preview("operatingState", "status"),
    // A pause withdraws the card from every directory read and 404s the page.
    [ANCHOR.directoryVisibility]: setting("directoryVisibility"),
    [ANCHOR.accessibility]: (draft) =>
      hasCardAccessAnswers(draft)
        ? preview("accessibilityCard", "access")
        : fullPage("accessibility"),
    [ANCHOR.affirmingBaseline]: fullPage("affirmingBaseline"),
    [ANCHOR.coManagers]: setting("coManagers"),
  };

export function isListingAnchor(id: string): id is AnchorId {
  return Object.prototype.hasOwnProperty.call(LISTING_FIELD_PLACEMENTS, id);
}

/** The placement for a field anchor as this draft shows it; null for no
 *  field or an unknown id. */
export function placementForAnchor(
  anchor: string | null,
  draft: ListingDraft,
): ListingFieldPlacement | null {
  if (anchor === null || !isListingAnchor(anchor)) return null;
  const rule = LISTING_FIELD_PLACEMENTS[anchor];
  return typeof rule === "function" ? rule(draft) : rule;
}

/** Excerpt blocks that always render: filled, or as a placeholder line while
 *  highlighted. The hours block is left out for an online listing, as the
 *  detail page leaves out its hours section. */
const ALWAYS_DRAWN_EXCERPT: readonly ListingPreviewRegion[] = [
  "tagline",
  "whatItIs",
  "goodFor",
  "languages",
];

/**
 * What the excerpt's owner block shows as the name: the role under "role"
 * visibility (the name stays private), the name otherwise, and nothing for an
 * anonymous owner.
 */
export function shownOwnerName(draft: ListingDraft): string {
  if (draft.visibility === "anon") return "";
  return (
    draft.visibility === "role" ? draft.ownerRole : draft.ownerName
  ).trim();
}

const PLACEHOLDER = "marketing:listBusiness.livePreview.placeholder";

/** The line an empty owner block shows while highlighted: role mode only
 *  ever prints the role there, so it promises nothing about the name. */
export function ownerPlaceholderKey(draft: ListingDraft): string {
  return draft.visibility === "role"
    ? `${PLACEHOLDER}.ownerRoleMode`
    : `${PLACEHOLDER}.owner`;
}

/**
 * The regions the preview draws for this draft. Mirrors the render rules of
 * the card (`LocalBusinessCardBody` via `submittedToPlace`), the placeholder
 * card and the excerpt, counting an empty excerpt block as drawn because it
 * shows a placeholder line while highlighted.
 */
export function renderedPreviewRegions(
  draft: ListingDraft,
): ReadonlySet<ListingPreviewRegion> {
  const regions = new Set<ListingPreviewRegion>(ALWAYS_DRAWN_EXCERPT);
  if (!draft.online) regions.add("hours");
  // An anonymous owner shows nowhere, so the owner block stays out. Any other
  // owner block is drawn: filled from `shownOwnerName`, or as a placeholder.
  if (draft.visibility !== "anon") regions.add("owner");

  if (draft.name.trim().length === 0) {
    // The placeholder card only has name, meta and one-liner lines.
    regions.add("name").add("meta").add("desc");
    return regions;
  }

  // Always in the card's markup, filled or not: `.desc` and `.pillsRow` even
  // keep a min-height while empty.
  regions
    .add("photo")
    .add("badge")
    .add("name")
    .add("meta")
    .add("desc")
    .add("pills");
  // Every draft carries a weekday grid, so the card always has a status line.
  if (Object.keys(draft.hours).length > 0) regions.add("status");
  if (hasCardAccessAnswers(draft)) regions.add("access");
  // The real card names the owner only for a public, profile-linked listing.
  if (
    draft.linkToProfile &&
    draft.visibility === "public" &&
    draft.ownerName.trim().length > 0
  ) {
    regions.add("host");
  }
  return regions;
}

/**
 * The regions to outline for a placement: its regions that are drawn right
 * now. Empty for a private or full-page field, and for a preview field whose
 * spots are not on screen yet, so the preview then stays undimmed and the
 * caption alone says where the field will show. With the placements above,
 * the only such case is the placeholder card (no name yet), which is what
 * `LISTING_PREVIEW_WILL_SHOW_CAPTION_KEY` says.
 */
export function highlightedRegionsFor(
  placement: ListingFieldPlacement | null,
  draft: ListingDraft,
): ListingPreviewRegion[] {
  if (placement?.kind !== "preview") return [];
  const isPlaceholderCard = draft.name.trim().length === 0;
  if (placement.isNamedCardOnly && isPlaceholderCard) return [];
  const rendered = renderedPreviewRegions(draft);
  return placement.regions.filter((region) => rendered.has(region));
}
