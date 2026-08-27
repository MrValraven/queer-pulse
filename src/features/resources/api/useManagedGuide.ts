import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import { getResourceGuide, type ResourceResponseDTO } from "./resources.api";

/**
 * The three answers this lookup can get, kept apart because two of them used
 * to collapse into one `null` and now mean opposite things.
 *
 * `gated` is the backend saying no: the guide is unpublished, or no editor has
 * reviewed it. `unavailable` is the backend saying nothing at all — a 5xx, a
 * timeout, a dropped connection. The first hides the page; the second must
 * not, or a backend blip would blank harm reduction and trans healthcare for
 * everyone reading them.
 */
type ManagedGuideLookup =
  | { kind: "guide"; guide: ResourceResponseDTO }
  | { kind: "gated" }
  | { kind: "unavailable" };

export interface ManagedGuideResult {
  /** The guide's database row, whether or not it has a body yet. A row with
   *  no sections is still worth having: it carries the review dates the
   *  footer prints under the hardcoded page. Null means no visible row. */
  guide: ResourceResponseDTO | null;
  /** True when the row carries prose, so the renderer takes the page over. */
  hasManagedBody: boolean;
  /** True when the backend definitively has no publicly visible guide at this
   *  slug, so the page must not render at all. */
  isGated: boolean;
  /** True while the live lookup is in flight. Demo resolves immediately. */
  isLoading: boolean;
}

/**
 * Asks whether one guide is publicly visible, and whether its prose is managed
 * in the database yet (CON-08).
 *
 * Every `/resources/*` guide page renders through `ManagedGuide`, which calls
 * this. A guide with a non-empty `sections` array is rendered from the
 * database, so an editor changing a paragraph is an admin-panel edit rather
 * than an engineer editing two i18n catalogs and shipping a deploy.
 *
 * A visible row with no sections still matters: the hardcoded page renders
 * unchanged, and the row's review dates print in its footer, which is how the
 * freshness line reaches all ~31 guides and not only the ones already taken
 * over.
 *
 * `retry: false` is deliberate: a 404 here is an expected, meaningful answer,
 * and a health guide must never sit on a spinner waiting for retries to give
 * up. What that 404 MEANS changed with the editorial review gate — it is now
 * "this guide is not public", which hides the page, so it is separated from
 * every other failure, which does not. The guide reads are `@Public()` on the
 * backend precisely so a logged-out visitor gets that real answer instead of a
 * 401 the page would have to fall open on.
 *
 * Demo mode never queries. The demo guide pages ARE the hardcoded pages, so
 * asking the backend would either 401 or contradict the fixture — and demo is
 * never gated, or a reviewer browsing it would find the shelves empty.
 */
export function useManagedGuide(slug: string): ManagedGuideResult {
  const { demoMode } = useDemoMode();

  const query = useQuery<ManagedGuideLookup>({
    queryKey: ["resources", "managed-guide", slug],
    enabled: !demoMode,
    retry: false,
    queryFn: async () => {
      try {
        return { kind: "guide", guide: await getResourceGuide(slug) };
      } catch (error) {
        // Only the server's own "there is nothing public here" gates the
        // page. Everything else — offline, 5xx, timeout, a 401 if these reads
        // ever stop being public — falls open to the hardcoded page.
        if (error instanceof ApiError && error.status === 404) {
          return { kind: "gated" };
        }
        return { kind: "unavailable" };
      }
    },
  });

  if (demoMode) {
    return {
      guide: null,
      hasManagedBody: false,
      isGated: false,
      isLoading: false,
    };
  }
  const lookup = query.data;
  const guide = lookup?.kind === "guide" ? lookup.guide : null;
  return {
    guide,
    hasManagedBody: (guide?.sections.length ?? 0) > 0,
    isGated: lookup?.kind === "gated",
    isLoading: query.isPending,
  };
}
