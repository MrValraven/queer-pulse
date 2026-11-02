import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import type {
  AdminDirectoryPartnerDTO,
  AdminDirectoryPartnerSearchResultDTO,
} from "../../marketing/api/directoryPartners.api";

/**
 * The admin partner routes (contract section 3,
 * `@Controller('admin/listings/partners')`). Every write answers with the full
 * new list in position order.
 */
const PARTNERS_PATH = "/admin/listings/partners";

/** GET /admin/listings/partners: every pick, ordered by position. */
export function getAdminDirectoryPartners(): Promise<
  AdminDirectoryPartnerDTO[]
> {
  return apiGet<AdminDirectoryPartnerDTO[]>(PARTNERS_PATH);
}

/** GET /admin/listings/partners/search?q=: live, publicly listed listings
 *  that are not 18+, at most 20. */
export function searchAdminDirectoryPartnerCandidates(
  query: string,
  signal?: AbortSignal,
): Promise<AdminDirectoryPartnerSearchResultDTO[]> {
  return apiGet<AdminDirectoryPartnerSearchResultDTO[]>(
    `${PARTNERS_PATH}/search?q=${encodeURIComponent(query)}`,
    undefined,
    undefined,
    signal,
  );
}

/** POST /admin/listings/partners: appends a pick. */
export function addAdminDirectoryPartner(body: {
  listingId: string;
  note?: string;
}): Promise<AdminDirectoryPartnerDTO[]> {
  return apiPost<AdminDirectoryPartnerDTO[]>(PARTNERS_PATH, body);
}

/** PATCH /admin/listings/partners/:id: a null note clears it. */
export function updateAdminDirectoryPartnerNote(
  pickId: string,
  body: { note: string | null },
): Promise<AdminDirectoryPartnerDTO[]> {
  return apiPatch<AdminDirectoryPartnerDTO[]>(
    `${PARTNERS_PATH}/${encodeURIComponent(pickId)}`,
    body,
  );
}

/** PATCH /admin/listings/partners/order: every pick id, each once. */
export function reorderAdminDirectoryPartners(body: {
  ids: string[];
}): Promise<AdminDirectoryPartnerDTO[]> {
  return apiPatch<AdminDirectoryPartnerDTO[]>(`${PARTNERS_PATH}/order`, body);
}

/** DELETE /admin/listings/partners/:id: the positions after it close up. */
export function removeAdminDirectoryPartner(
  pickId: string,
): Promise<AdminDirectoryPartnerDTO[]> {
  return apiDelete<AdminDirectoryPartnerDTO[]>(
    `${PARTNERS_PATH}/${encodeURIComponent(pickId)}`,
  );
}
