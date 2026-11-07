import { ApiError } from "../../shared/api/client";
import {
  apiErrorCode,
  causeErrorKey,
  type CauseErrorCopy,
  type CauseErrorOverrides,
} from "../../shared/api/causeErrorKey";

/**
 * The magazine forms' layer over the shared cause classifier
 * (`shared/api/causeErrorKey.ts`). Each magazine error mapper hands in only
 * the lines its own form can say; everything else falls through to the shared
 * `shared:apiError.*` cause for the status.
 *
 * Resolution order, first match wins:
 *
 *  1. A machine code with a line in `codeKeys`. A field-check 400 from a
 *     coded magazine DTO carries every failing code in `codes`, in the order
 *     of the English sentences in `message` (queerpulse-backend
 *     `magazine/magazine-validation-code.interceptor.ts`). The FIRST code in
 *     `codes` that has a line wins, so the member reads about the first field
 *     the backend checked that this form can name. A service refusal carries a
 *     single `code` and no `codes`; it is tried after `codes`.
 *  2. `causeErrorKey` with the same map, so a code with no line here (a newer
 *     backend) falls back to `statusKeys` and then to the shared status line.
 *  3. `sharedKeys` swaps a shared cause for this form's own wording of the
 *     same cause (its own "no connection" or "server fault" line), keeping any
 *     values the shared line interpolates.
 *
 * Machine codes only: nothing here reads the backend's English prose.
 */

/**
 * The code `PlatformLockdownGuard` (queerpulse-backend
 * `common/platform-lockdown.guard.ts`) puts on its 503 while an admin has the
 * platform locked. `shared/api/client.ts` reads the same code to raise the
 * maintenance screen.
 */
export const PLATFORM_LOCKED_CODE = "PLATFORM_LOCKED";

/** The lines one magazine form can say about a failed request. */
export interface MagazineCauseLines {
  /** Backend machine `code` to the full catalog key that names it. */
  codeKeys: CauseErrorOverrides;
  /** HTTP status (as a number or string) to the form's own catalog key. */
  statusKeys?: CauseErrorOverrides;
  /** A shared `shared:apiError.*` key to the form's own wording of it. */
  sharedKeys?: CauseErrorOverrides;
}

/**
 * Every machine code on a failed request, in the order a mapper tries them:
 * the `codes` list of a coded field-check 400 first (message order), then the
 * single `code`, without repeats. Empty for anything that is not an
 * `ApiError` or that carries no code.
 */
export function apiErrorCodes(error: unknown): string[] {
  if (!(error instanceof ApiError)) return [];
  const body = error.data;
  const listedCodes =
    typeof body === "object" && body !== null
      ? (body as { codes?: unknown }).codes
      : undefined;
  const orderedCodes: string[] = Array.isArray(listedCodes)
    ? listedCodes.filter(
        (entry: unknown): entry is string =>
          typeof entry === "string" && entry.length > 0,
      )
    : [];
  const singleCode = apiErrorCode(error);
  if (singleCode !== null && !orderedCodes.includes(singleCode)) {
    orderedCodes.push(singleCode);
  }
  return orderedCodes;
}

function lineFor(
  lines: CauseErrorOverrides | undefined,
  lookupKey: string,
): string | null {
  if (!lines || !Object.hasOwn(lines, lookupKey)) return null;
  return lines[lookupKey] ?? null;
}

/** The catalog key naming why a magazine request failed, per `lines`. */
export function magazineCauseErrorCopy(
  error: unknown,
  lines: MagazineCauseLines,
): CauseErrorCopy {
  for (const code of apiErrorCodes(error)) {
    const codeKey = lineFor(lines.codeKeys, code);
    if (codeKey) return { key: codeKey };
  }
  const sharedCopy = causeErrorKey(error, {
    ...lines.codeKeys,
    ...lines.statusKeys,
  });
  const ownKey = lineFor(lines.sharedKeys, sharedCopy.key);
  return ownKey ? { ...sharedCopy, key: ownKey } : sharedCopy;
}
