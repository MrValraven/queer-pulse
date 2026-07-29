import { apiGet } from "../../../shared/api/client";
import { toItemsPage } from "../../../shared/api/pagination";
import type { Paginated } from "../../../shared/api/refs";
import type { ListingStatus } from "../../marketing/listBusiness/listBusiness.data";
import type { ListingDTO } from "../../marketing/listBusiness/api/listings.api";

/** One row in the moderation queue — the subset the admin page renders. */
export interface ListingQueueRow {
  ref: string;
  slug: string;
  name: string;
  hood: string;
  status: ListingStatus;
  submitterName: string;
  submitterSlug: string;
  createdAt: string;
}

/** Map a backend listing to the queue row shape. */
export function listingDtoToQueueRow(dto: ListingDTO): ListingQueueRow {
  const submitter = dto.submittedBy;
  return {
    ref: dto.ref,
    slug: dto.slug,
    name: dto.name,
    hood: dto.hood,
    status: dto.status,
    submitterName: submitter
      ? `${submitter.firstName} ${submitter.lastName}`.trim()
      : "",
    submitterSlug: submitter?.slug ?? "",
    createdAt: dto.createdAt,
  };
}

/** The moderation queue, optionally filtered by status. Moderator/Admin only. */
export async function getListingQueue(
  status?: ListingStatus,
  page = 1,
): Promise<Paginated<ListingDTO>> {
  const statusParam = status ? `&status=${status}` : "";
  const res = await apiGet<ListingDTO[] | Paginated<ListingDTO>>(
    `/listings/admin/queue?page=${page}${statusParam}`,
  );
  return toItemsPage(res);
}
