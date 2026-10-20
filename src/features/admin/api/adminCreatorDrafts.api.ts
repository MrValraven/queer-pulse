import { apiGet } from "../../../shared/api/client";
import { toItemsPage, type ItemsPage } from "../../../shared/api/pagination";
import type { GatheringDraftSnapshot } from "../../gatherings/useGatheringForm";
import type { CommunityDraft } from "../../communities/startCommunity/startCommunity.data";
import type { CreatorDraftProgress } from "../../creatorDrafts/api/creatorDrafts.types";
import type {
  ListingDraft,
  PhotoKey,
} from "../../marketing/listBusiness/listBusiness.data";
import type { ListingShopItem } from "../../marketing/listBusiness/listingShop.data";
import type { StudioReleaseDTO } from "../../studio/api/studio.types";
import type { SubprofilePublicDTO } from "../../subprofiles/api/subprofiles.api";
import type { ListingDraftOwnerDTO } from "./adminListingDrafts.api";

export const CREATOR_DRAFT_KINDS = [
  "persona",
  "studio_release",
  "studio_episode",
  "listing",
  "event",
  "listing_edit",
  "community",
] as const;
export type CreatorDraftKind = (typeof CREATOR_DRAFT_KINDS)[number];

export function isCreatorDraftKind(
  value: string | null | undefined,
): value is CreatorDraftKind {
  return (CREATOR_DRAFT_KINDS as readonly string[]).includes(value ?? "");
}

const CREATOR_DRAFT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True for an id the server's UUID check accepts. Live drafts are keyed by
 *  UUID, so any other id can never load and is better left unasked: the
 *  server would answer 400. Demo ids are free-form and skip this check. */
export function isCreatorDraftId(value: string): boolean {
  return CREATOR_DRAFT_ID_PATTERN.test(value);
}

/** `slug` null: nothing live to link (a persona draft, a draft persona's
 *  Studio work, a listing that is not live); render `name` as plain text. */
export interface CreatorDraftMadeFor {
  kind: "community" | "listing" | "persona";
  name: string;
  slug: string | null;
}

export type CreatorDraftOwner = ListingDraftOwnerDTO;

export interface AdminCreatorDraftRow {
  kind: CreatorDraftKind;
  id: string;
  title: string | null;
  madeFor: CreatorDraftMadeFor | null;
  owner: CreatorDraftOwner | null;
  lastSavedAt: string;
  progress: CreatorDraftProgress | null;
  missing: string[] | null;
}

export const EVENT_DRAFT_PREVIEW_KEYS = [
  "title",
  "description",
  "family",
  "format",
  "otherText",
  "formatDetails",
  "cap",
  "showAttendeeCount",
  "date",
  "time",
  "endDate",
  "endTime",
  "repeats",
  "cadence",
  "endType",
  "endCount",
  "endUntil",
  "hood",
  "communitySlug",
  "audienceScope",
  "venue",
  "venueListing",
  "lang",
  "cost",
  "costKind",
  "accessibilityAnswers",
  "accessNotes",
  "themes",
  "contentNotes",
  "houseRules",
  "rsvpCutoff",
  "rsvpQuestions",
  "customRsvpQuestion",
  "allowWaitlist",
  "goTogetherEnabled",
] as const satisfies readonly (keyof GatheringDraftSnapshot)[];

export type EventDraftPreview = Partial<
  Pick<GatheringDraftSnapshot, (typeof EVENT_DRAFT_PREVIEW_KEYS)[number]>
> & {
  community: { slug: string; name: string } | null;
  /** `slug` null: the listing is not live, so its name shows as plain text. */
  runByListing: { slug: string | null; name: string } | null;
};

export const COMMUNITY_DRAFT_PREVIEW_KEYS = [
  "name",
  "purpose",
  "type",
  "whoFor",
  "accessTier",
  "features",
  "rules",
  "nowReading",
  "tint",
  "coverImageUrl",
  "avatarImageUrl",
  "tagline",
  "handle",
  "tags",
] as const satisfies readonly (keyof CommunityDraft)[];

/** Images the server cannot resolve arrive as null where the wizard stores "". */
export type CommunityDraftPreview = Omit<
  Partial<Pick<CommunityDraft, (typeof COMMUNITY_DRAFT_PREVIEW_KEYS)[number]>>,
  "coverImageUrl" | "avatarImageUrl"
> & { coverImageUrl?: string | null; avatarImageUrl?: string | null };

/** A listing draft as staff receive it: allow-listed keys only, and every
 *  image the server cannot resolve arrives as null (settled 2026-10-19). */
export type ListingDraftPreview = Omit<
  Partial<ListingDraft>,
  "photos" | "coverPhoto" | "shopItems" | "menu"
> & {
  /** A shape the server did not expect leaves as null. */
  photos?: Partial<Record<PhotoKey, string | null>> | null;
  coverPhoto?: { image: string | null; alt: string } | null;
  shopItems?:
    | (Omit<ListingShopItem, "photo"> & {
        photo: { image: string | null; alt: string; caption: string } | null;
      })[]
    | null;
  menu?: ListingDraft["menu"] | null;
};

export type AdminCreatorDraftDetail = AdminCreatorDraftRow &
  (
    | { kind: "persona"; preview: SubprofilePublicDTO }
    | { kind: "studio_release"; preview: StudioReleaseDTO }
    /** `preview.tracks` holds the draft episode (id `episodeTrackId`, `isDraft: true`). */
    | {
        kind: "studio_episode";
        preview: StudioReleaseDTO;
        episodeTrackId: string;
      }
    | { kind: "listing"; preview: ListingDraftPreview }
    /** `listing.slug` is null when the listing is not live. */
    | {
        kind: "listing_edit";
        preview: ListingDraftPreview;
        listing: { ref: string; slug: string | null; name: string };
      }
    | { kind: "event"; preview: EventDraftPreview }
    | { kind: "community"; preview: CommunityDraftPreview }
  );

/**
 * GET /admin/creator-drafts?kind=&page= - every kind of unfinished creator
 * draft, newest save first, in the `{ items, total, page, pageSize }`
 * envelope. Admin only. Both params are left out when absent.
 */
export const getAdminCreatorDrafts = async (query: {
  kind: CreatorDraftKind | null;
  page: number;
}): Promise<ItemsPage<AdminCreatorDraftRow>> => {
  const searchParams = new URLSearchParams();
  if (query.kind) searchParams.set("kind", query.kind);
  if (query.page) searchParams.set("page", String(query.page));
  const querySuffix = searchParams.toString();
  const response = await apiGet<
    AdminCreatorDraftRow[] | ItemsPage<AdminCreatorDraftRow>
  >(`/admin/creator-drafts${querySuffix ? `?${querySuffix}` : ""}`);
  return toItemsPage(response);
};

/**
 * GET /admin/creator-drafts/:kind/:id - one draft with its public-shaped
 * preview. Admin only. Every successful read writes one Platform log row, so
 * callers read it once per open.
 */
export const getAdminCreatorDraft = (
  kind: CreatorDraftKind,
  id: string,
): Promise<AdminCreatorDraftDetail> =>
  apiGet<AdminCreatorDraftDetail>(
    `/admin/creator-drafts/${kind}/${encodeURIComponent(id)}`,
  );
