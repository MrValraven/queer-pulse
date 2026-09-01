import { apiGet, type ResponseValidator } from "../../../shared/api/client";
import { LIVE_RESULT_TYPES, type LiveResultType } from "./search.api";

/** `GET /search/types` — the result types the backend will actually search. */
export interface SearchTypesResponseDTO {
  types: LiveResultType[];
}

/**
 * Validates a `GET /search/types` body.
 *
 * An unrecognised token is DROPPED rather than thrown on, which is the
 * opposite of `search.api.ts`'s result-row validator and deliberate. A row
 * with an unknown `type` would render a broken card, so that one fails loud.
 * Here the list only decides which category tabs to offer: a token this build
 * has no label, icon or route for is a tab it cannot render anyway, and a
 * backend that ships a thirteenth result type should not blank the tab strip
 * of every frontend deployed before it.
 */
const validateSearchTypesResponse: ResponseValidator<SearchTypesResponseDTO> = (
  data,
) => {
  const body = data as Partial<SearchTypesResponseDTO> | null;
  if (!body || typeof body !== "object" || !Array.isArray(body.types)) {
    throw new Error("expected a search types response with a types array");
  }
  return {
    types: body.types.filter((type): type is LiveResultType =>
      LIVE_RESULT_TYPES.includes(type),
    ),
  };
};

/**
 * The result types search can currently answer with (live mode, session
 * required). Reads a compile-time registry on the backend, so the answer only
 * changes on deploy and a caller can hold it for the life of a session.
 */
export function getSearchTypes(
  signal?: AbortSignal,
): Promise<SearchTypesResponseDTO> {
  return apiGet<SearchTypesResponseDTO>(
    "/search/types",
    undefined,
    validateSearchTypesResponse,
    signal,
  );
}
