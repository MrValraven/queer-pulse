import { ApiError } from "../../../shared/api/client";
import {
  goTogetherErrorCode,
  saveGoTogetherHostConfig,
} from "../api/goTogether.api";

/**
 * Switching Go together on for a gathering that was just published. The
 * publish hook calls these after a successful live create with "Offer Go
 * together" on. Best effort throughout: the gathering is already saved.
 */

/** Opt-in closes 6 hours before the start; the server refuses any save
 *  after that (`GO_TOGETHER_UNAVAILABLE`, reason `closed`). */
const OPT_IN_CLOSE_LEAD_MS = 6 * 60 * 60 * 1000;

/**
 * Every saved date gets Go together, in series order. The first date is the
 * only one that can start within 6 hours (the rest come later in the series),
 * so it is left out when its opt-in has already closed. An unreadable start
 * leaves it in and lets the server decide.
 */
export function goTogetherSlugsToSwitchOn({
  slug,
  occurrenceSlugs,
  firstStartAt,
  nowMs,
}: {
  slug: string | undefined;
  occurrenceSlugs: string[] | undefined;
  firstStartAt: string;
  nowMs: number;
}): string[] {
  const slugs =
    occurrenceSlugs && occurrenceSlugs.length > 0
      ? occurrenceSlugs
      : slug
        ? [slug]
        : [];
  const firstStartMs = Date.parse(firstStartAt);
  const isFirstOptInClosed =
    !Number.isNaN(firstStartMs) && firstStartMs - nowMs <= OPT_IN_CLOSE_LEAD_MS;
  return isFirstOptInClosed ? slugs.slice(1) : slugs;
}

function isOptInClosedError(error: unknown): boolean {
  if (goTogetherErrorCode(error) !== "GO_TOGETHER_UNAVAILABLE") return false;
  const reason =
    error instanceof ApiError
      ? (error.data as { reason?: unknown } | null | undefined)?.reason
      : undefined;
  return reason === "closed";
}

/**
 * Switch Go together on for each slug, with no host questions and the default
 * cutoff. Resolves `true` when at least one failed in a way the host can fix
 * from Manage, so the caller shows one warning toast. A date whose opt-in
 * has already closed is skipped quietly: Manage could not change it either.
 */
export async function switchOnGoTogetherForSlugs(
  slugs: string[],
): Promise<boolean> {
  const results = await Promise.allSettled(
    slugs.map((slug) =>
      saveGoTogetherHostConfig(slug, {
        enabled: true,
        hostQuestions: [],
        meetingPointNote: null,
      }),
    ),
  );
  return results.some(
    (result) =>
      result.status === "rejected" && !isOptInClosedError(result.reason),
  );
}
