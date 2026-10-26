import { ApiError } from "../../../shared/api/client";
import { describeError } from "../../../shared/api/errorMessage";
import type { TFunction } from "../../../shared/i18n/types";

/**
 * The refusals a hide or unhide can meet, each with its own copy:
 * - `notFound`: the server answered `HIDDEN_COMMUNITY_NOT_FOUND`, an unknown
 *   slug or a private community the member is outside (one answer for both,
 *   so a private community's existence never leaks);
 * - `limitReached`: `HIDDEN_COMMUNITIES_LIMIT_REACHED`, the 200 cap;
 * - `rateLimited`: a 429 from the 20-per-minute throttle;
 * - `unreachable`: the request never got an answer (offline, DNS, CORS, or
 *   our own 408 timeout).
 */
export type HiddenCommunityRefusal =
  "notFound" | "limitReached" | "rateLimited" | "unreachable";

const HIDDEN_COMMUNITY_NOT_FOUND_CODE = "HIDDEN_COMMUNITY_NOT_FOUND";
const HIDDEN_COMMUNITIES_LIMIT_REACHED_CODE =
  "HIDDEN_COMMUNITIES_LIMIT_REACHED";
const REQUEST_TIMEOUT_STATUS = 408;

function errorCodeOf(error: ApiError): string | undefined {
  return (error.data as { code?: string } | null | undefined)?.code;
}

/** Which named refusal an error is, or null when it is none of them. */
export function hiddenCommunityRefusalOf(
  error: unknown,
): HiddenCommunityRefusal | null {
  if (!(error instanceof ApiError)) return "unreachable";
  const code = errorCodeOf(error);
  if (error.status === 404 && code === HIDDEN_COMMUNITY_NOT_FOUND_CODE) {
    return "notFound";
  }
  if (error.status === 409 && code === HIDDEN_COMMUNITIES_LIMIT_REACHED_CODE) {
    return "limitReached";
  }
  if (error.status === 429) return "rateLimited";
  if (error.status === REQUEST_TIMEOUT_STATUS) return "unreachable";
  return null;
}

/**
 * The toast line for a failed hide or unhide. A named refusal gets its own
 * sentence; anything else falls back to "Couldn't hide events from {name}"
 * framed by `describeError`, so a reason the server sent still shows.
 */
export function hiddenCommunityErrorMessage(
  error: unknown,
  mode: "hide" | "unhide",
  name: string,
  t: TFunction,
): string {
  switch (hiddenCommunityRefusalOf(error)) {
    case "notFound":
      return t("gatherings:hiddenCommunities.error.notFound", { name });
    case "limitReached":
      return t("gatherings:hiddenCommunities.error.limitReached");
    case "rateLimited":
      return t("gatherings:hiddenCommunities.error.rateLimited");
    case "unreachable":
      return mode === "hide"
        ? t("gatherings:hiddenCommunities.error.hideUnreachable", { name })
        : t("gatherings:hiddenCommunities.error.unhideUnreachable", { name });
    default:
      return describeError(
        mode === "hide"
          ? t("gatherings:hiddenCommunities.error.hideFailed", { name })
          : t("gatherings:hiddenCommunities.error.unhideFailed", { name }),
        error,
      );
  }
}

/** The hide toast line. `stayingTitle` names the co-hosted event the member
 *  hid from when a community they still see keeps it listed. */
export function hiddenCommunityToastMessage(
  name: string,
  stayingTitle: string | undefined,
  t: TFunction,
): string {
  return stayingTitle
    ? t("gatherings:hiddenCommunities.toast.hiddenEventStays", {
        name,
        title: stayingTitle,
      })
    : t("gatherings:hiddenCommunities.toast.hidden", { name });
}

/**
 * The hide toast still up for each community slug. Module-wide on purpose: the
 * hide often comes from a card menu that has since unmounted, and the unhide
 * from another surface (Settings, the Browse refine group), which then takes
 * the stale toast and its Undo down.
 */
const hideToastIdBySlug = new Map<string, number>();

export function rememberHideToast(slug: string, toastId: number): void {
  hideToastIdBySlug.set(slug, toastId);
}

/** The open hide toast's id for this slug, if any, forgotten as it is read. */
export function takeHideToast(slug: string): number | undefined {
  const toastId = hideToastIdBySlug.get(slug);
  hideToastIdBySlug.delete(slug);
  return toastId;
}
