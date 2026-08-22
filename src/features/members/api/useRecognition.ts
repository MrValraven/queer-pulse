import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getRecognition } from "./recognition.api";
import {
  emptyRecognition,
  recognitionToModel,
  type Recognition,
} from "./recognition.adapters";
import { demoRecognition } from "../recognition.demo";

export interface RecognitionState extends Recognition {
  /** True while the live query is in flight; always false in demo mode. */
  isLoading: boolean;
  /** True when the live fetch has errored; always false in demo mode. Callers
   *  should render an error state rather than the zeroed placeholder. */
  isError: boolean;
  /**
   * True once the returned model reflects trustworthy data: always in demo mode,
   * and in live mode only after the backend fetch has actually landed. While a
   * live fetch is pending or has errored this is false, so consumers can skeleton
   * (or show a loading/error state) rather than render a placeholder as if it
   * were the member's real level/badge/perk counts.
   */
  hasRealData: boolean;
}

/**
 * A member's Recognition (level, badges, perks). Demo returns the mock model;
 * live calls GET /me/recognition (own — pass no `slug`) or
 * `/profiles/:slug/recognition` (someone else — pass their `slug`). Only
 * `/me/recognition` triggers the backend's recompute-on-read and returns the
 * owner-only breakdown/perks/ledger, so `slug` must stay `undefined` for a
 * self-view rather than being defaulted to the caller's own slug — the two
 * routes are not interchangeable. The returned model is always a full
 * `Recognition` so field access never throws — but in LIVE mode the stand-in
 * while loading/on error is a ZEROED model (`emptyRecognition`), never the
 * demo fixtures, so no fictional level/badges/perks ever leak into
 * production. Callers gate on `isLoading`/`isError`/`hasRealData` to present
 * the right state. React Query dedupes the fetch, so the many components that
 * call this share one request.
 *
 * `force` (own view only) bypasses the backend's 5-minute recompute throttle
 * — use it sparingly, on surfaces where a member is expected to complete
 * several XP-earning actions within minutes (e.g. the Getting Started
 * checklist), so the XP shown doesn't lag behind actions already taken.
 */
export function useRecognition(
  slug?: string,
  options?: { force?: boolean },
): RecognitionState {
  const { demoMode } = useDemoMode();
  const force = Boolean(options?.force);
  // Key on the ROUTE this call actually fetches, never on the resolved person.
  // `slug ?? user.profile.slug` used to collapse both routes onto one key, so
  // "Preview as visitor" (which renders `<OtherMemberRecognition slug={own
  // slug} />`) wrote the by-slug answer — no perks, empty `xpBreakdown`, no
  // ledger — into the cache entry the hero, BadgesPage and PerksPage read for
  // the self view. Leaving the preview then showed the owner "0 perks" until a
  // refetch landed. The two endpoints are not interchangeable, so neither are
  // their keys.
  const { data, isPending, isError } = useQuery<Recognition>({
    queryKey: [
      "recognition",
      demoMode,
      slug ? (["slug", slug] as const) : "me",
      force,
    ],
    queryFn: async () => {
      if (demoMode) return demoRecognition;
      return recognitionToModel(await getRecognition(slug, force));
    },
  });
  // Demo mode always renders the mock model. Live mode renders real data once it
  // lands, and a zeroed placeholder (guarded by the flags below) meanwhile.
  const model = demoMode ? demoRecognition : (data ?? emptyRecognition);
  return {
    ...model,
    isLoading: !demoMode && isPending,
    isError: !demoMode && isError,
    hasRealData: demoMode || (!!data && !isError),
  };
}
