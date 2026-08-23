import {
  routes,
  businessPath,
  personaPath,
  communityPath,
} from "../../app/routeMap";
import { gatheringPath } from "../../features/gatherings/data";

/**
 * Every place an uploaded image can be in use. Mirrors the backend
 * `MediaReferenceType` (`queerpulse-backend/src/media-references/media-reference.types.ts`)
 * exactly — keep the two unions in lockstep.
 */
export type MediaReferenceType =
  | "profile-photo" // Profile.avatarUrl
  | "showcase" // WorkItem.imageUrl
  | "story-cover" // MagazineIssue.coverUrl
  | "event-photo" // EventPhoto.storageKey
  | "event-cover" // Event.coverImageUrl
  | "group-avatar" // Conversation.avatarUrl
  | "listing" // Listing.photos.*
  | "persona-avatar" // Subprofile.avatarUrl
  | "persona-cover" // Subprofile.coverUrl
  | "persona-item" // SubprofileItem.imageUrl
  | "community-post" // CommunityPost.image
  | "community-cover" // Community.coverImageUrl
  | "community-avatar" // Community.avatarImageUrl
  | "card-crest" // CommunityCard.crestMediaKey
  | "card-background" // CommunityCard.backgroundMediaKey
  | "cinema-cover" // CinemaTitle.coverImageUrl
  | "landlord" // Landlord.photo
  | "company-work" // Company.work[].imageUrl
  | "housing" // HousingListing.gallery[]
  | "magazine-author" // MagazineAuthor.avatarUrl
  | "changemaker" // Changemaker.imageUrl
  | "collection" // Collection.cover
  | "magazine-article" // MagazineArticle.blocks[].src / .socialImage
  | "magazine-deck" // MagazineDeck.cover / .slides[] image refs
  | "message-photo"; // Message.attachment (a photo sent in a conversation)

/** One place an uploaded image is referenced. The backend owns `entityId`/
 *  `label`/`slug`; the frontend owns turning `type` into a localized label
 *  and a clickable route. */
export interface MediaReference {
  type: MediaReferenceType;
  /** UUID of the referencing row (the parent persona for a persona-item). */
  entityId: string;
  /** Human title of the item, e.g. "Décima Casa". May be '' if the row has none. */
  label: string;
  /** Slug where the entity has one, for building the frontend link. */
  slug?: string;
}

/** i18n key for the category label, e.g. "shared:mediaRef.persona-avatar". */
export function mediaReferenceLabelKey(type: MediaReferenceType): string {
  return `shared:mediaRef.${type}`;
}

/**
 * Route to the referenced item, or `null` when no viewer-appropriate route
 * exists for that reference (renders as a plain label instead of a link).
 *
 * Every case below was confirmed against the real router
 * (`src/app/routeMap.ts` + each feature's `routes.tsx`) rather than
 * hand-written:
 * - `profile-photo` / `showcase` → member profile `/members/:slug`
 *   (`src/features/members/routes.tsx`).
 * - `event-cover` → gathering detail `/gatherings/:slug`; `event-photo` →
 *   its photo album `/gatherings/:slug/photos`
 *   (`src/features/gatherings/routes.tsx`).
 * - `listing` → the local directory's real `businessPath(slug)` builder.
 * - `persona-avatar` / `persona-cover` / `persona-item` → the standalone
 *   persona route via `personaPath(slug)` (`/p/:handle`).
 * - `cinema-cover` → the live catalogue deep-links a title by id, not slug
 *   (`WatchPage.tsx` reads `?title=<id>`), so this uses `entityId`.
 * - `landlord` → `/work/landlord/:slug`; `company-work` →
 *   `${routes.company}/:slug` (both real routes in
 *   `src/features/economy/routes.tsx`) — despite the plan's draft assuming
 *   these had no deep link, the routes exist.
 * - `housing` → `${routes.housing}/:slug` (`HousingListingPage`).
 * - `magazine-author` → `${routes.author}/:slug` (`AuthorPage`, which does
 *   fetch a live author by slug) — also a real route the plan's draft
 *   assumed didn't exist.
 * - `changemaker` → `/changemaker/:slug` (`ChangemakerStoryPage`).
 * - `community-cover` / `community-avatar` → `communityPath(slug)`.
 * - `card-crest` / `card-background` → the ISSUING community's page: a
 *   membership-card programme is designed in a modal on that page and has no
 *   route of its own, and the backend already resolves the reference to the
 *   community rather than to the `community_cards` row.
 * - `magazine-article` / `magazine-deck` → `?id=<slug>` query links, since
 *   both routes read the slug from a search param rather than a path segment.
 * - `group-avatar` (private conversation), `community-post` (no
 *   single-post route — posts render inline in a community's tabs),
 *   `story-cover` (the issue route has no `:number` param yet — it always
 *   shows the current issue), `collection` (`/account/collections` is
 *   the owner-only list rather than a per-collection page), and
 *   `message-photo` (a private conversation the cross-user admin console
 *   must never deep-link into) have no viewer-appropriate route today →
 *   label only.
 */
export function mediaReferenceHref(reference: MediaReference): string | null {
  const { type, entityId, slug } = reference;
  switch (type) {
    case "profile-photo":
    case "showcase":
      return slug ? `${routes.members}/${slug}` : null;
    case "event-cover":
      return slug ? gatheringPath(slug) : null;
    case "event-photo":
      return slug ? `${gatheringPath(slug)}/photos` : null;
    case "listing":
      return slug ? businessPath(slug) : null;
    case "persona-avatar":
    case "persona-cover":
    case "persona-item":
      return slug ? personaPath(slug) : null;
    case "community-cover":
    case "community-avatar":
      return slug ? communityPath(slug) : null;
    // A card programme has no page of its own: the backend already resolves
    // these to the ISSUING community, and a collective-issued programme comes
    // back slugless, which falls through to a plain label.
    case "card-crest":
    case "card-background":
      return slug ? communityPath(slug) : null;
    case "cinema-cover":
      return entityId ? `${routes.cinemaWatch}?title=${entityId}` : null;
    case "landlord":
      return slug ? `/work/landlord/${slug}` : null;
    case "company-work":
      return slug ? `${routes.company}/${slug}` : null;
    case "housing":
      return slug ? `${routes.housing}/${slug}` : null;
    case "magazine-author":
      return slug ? `${routes.author}/${slug}` : null;
    case "changemaker":
      return slug ? `/changemaker/${slug}` : null;
    // `ArticlePage`/`DeckPage` are registered WITHOUT a `:slug` param and read
    // the slug from `?id=` (`useSearchParams().get("id")`), so a path segment
    // here would 404.
    case "magazine-article":
      return slug ? `${routes.article}?id=${slug}` : null;
    case "magazine-deck":
      return slug ? `${routes.deck}?id=${slug}` : null;
    // group-avatar (private conversation), community-post (no single-post
    // route), story-cover (issue route has no per-issue param yet), collection
    // (the owner-only /account/collections list has no per-collection page),
    // and message-photo (a private conversation, which the cross-user admin
    // console must never deep-link into) → no viewer-appropriate route.
    case "group-avatar":
    case "community-post":
    case "story-cover":
    case "collection":
    case "message-photo":
      return null;
    default: {
      const exhaustiveCheck: never = type;
      void exhaustiveCheck;
      return null;
    }
  }
}
