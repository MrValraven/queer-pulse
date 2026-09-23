import { ApiError } from "../../shared/api/client";

/** The structured 409 code a failed space-request mutation carries, or
 *  undefined for anything else (network failure, 500, ...). Split out of
 *  `SpaceRequestPanel` to keep that component under the repo's 200-line cap. */
export function errorCodeOf(error: unknown): string | undefined {
  return error instanceof ApiError && error.status === 409
    ? (error.data as { code?: string } | undefined)?.code
    : undefined;
}
