import type {
  AdminResourceListingDTO,
  ResourceListingCategory,
  ResourceListingStatus,
  ResourceListingWriteBody,
} from "./api/adminResourceListings.api";

/**
 * Controlled-form mirror of `ResourceListingWriteBody`. Every field is a
 * plain string so each input can stay a simple controlled `<input>` /
 * `<textarea>` / `<Select>`; `draftToWriteBody` trims them back on submit.
 */
export interface ListingFormDraft {
  category: ResourceListingCategory;
  title: string;
  description: string;
  region: string;
  phone: string;
  email: string;
  website: string;
  status: ResourceListingStatus;
}

export function draftFromListing(
  listing: AdminResourceListingDTO | null,
): ListingFormDraft {
  return {
    category: listing?.category ?? "legal_aid",
    title: listing?.title ?? "",
    description: listing?.description ?? "",
    region: listing?.region ?? "",
    phone: listing?.phone ?? "",
    email: listing?.email ?? "",
    website: listing?.website ?? "",
    status: listing?.status ?? "active",
  };
}

export function draftToWriteBody(
  draft: ListingFormDraft,
): ResourceListingWriteBody {
  return {
    category: draft.category,
    title: draft.title.trim(),
    description: draft.description.trim(),
    region: draft.region.trim(),
    phone: draft.phone.trim(),
    email: draft.email.trim(),
    website: draft.website.trim(),
    status: draft.status,
  };
}
