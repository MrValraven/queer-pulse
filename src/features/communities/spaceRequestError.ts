import { ApiError } from "../../shared/api/client";

/** The structured 409 code a failed space-request mutation carries, or
 *  undefined for anything else (network failure, 500, ...). Split out of
 *  `SpaceRequestPanel` to keep that component under the repo's 200-line cap. */
export function errorCodeOf(error: unknown): string | undefined {
  return error instanceof ApiError && error.status === 409
    ? (error.data as { code?: string } | undefined)?.code
    : undefined;
}

/** What a failed withdraw of a space request can say beyond the shared causes:
 *  the server answers 404 "No open space request" (no code) when the request
 *  was already answered or withdrawn while the page was open. */
export const SPACE_REQUEST_WITHDRAW_OVERRIDES = {
  "404": "communities:error.requestResolved",
} as const;
