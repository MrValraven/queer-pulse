import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  demoStats,
  getSpace,
  REMOVED_SPACES,
  VERIFIED_SPACES,
  type AnySpace,
  type RemovedSpace,
  type VerifiedSpace,
} from "../safeSpaces";
import {
  safeSpaceDetailDtoToSpace,
  safeSpaceListToView,
} from "./safeSpaces.adapters";
import { getSafeSpace, getSafeSpaces } from "./safeSpaces.api";

export const SAFE_SPACES_KEY = "safeSpaces";

interface SafeSpacesView {
  verified: VerifiedSpace[];
  removed: RemovedSpace[];
  stats: { verified: number; reviews: number; removed: number };
}

function demoSafeSpaces(): SafeSpacesView {
  return {
    verified: VERIFIED_SPACES,
    removed: REMOVED_SPACES,
    stats: demoStats(),
  };
}

/**
 * Source for the safe-spaces directory grid (`/safe-spaces`).
 *
 * Demo mode returns the prototype's own mock arrays and never hits the
 * network. Live mode fetches the public `GET /directory/safe-spaces` (every
 * verified + removed listing plus the header stats) and adapts each card —
 * so with "Populate platform" OFF the page shows real safe spaces.
 */
export function useSafeSpaces(): SafeSpacesView & { isLoading: boolean } {
  const { demoMode } = useDemoMode();
  const query = useQuery<SafeSpacesView>({
    queryKey: [SAFE_SPACES_KEY, demoMode],
    initialData: demoMode ? demoSafeSpaces() : undefined,
    queryFn: async () => {
      if (demoMode) return demoSafeSpaces();
      const dto = await getSafeSpaces();
      return safeSpaceListToView(dto);
    },
  });
  return {
    verified: query.data?.verified ?? [],
    removed: query.data?.removed ?? [],
    stats: query.data?.stats ?? { verified: 0, reviews: 0, removed: 0 },
    isLoading: query.isLoading,
  };
}

/**
 * A single safe space by slug, for the detail page (`/safe-spaces/:slug`).
 * Demo resolves against the mock registry via `getSpace`; live fetches the
 * public `GET /directory/safe-spaces/:slug` and adapts the discriminated
 * verified/removed payload.
 *
 * Returns `{ space, isLoading }` rather than a bare value: the live fetch is
 * async, so the detail page must distinguish "still loading" (show a
 * skeleton) from "settled, not found" (redirect) instead of redirecting on
 * the initial undefined. A 404 resolves to `undefined` with `isLoading` false.
 */
export function useSafeSpace(slug: string | undefined): {
  space: AnySpace | undefined;
  isLoading: boolean;
} {
  const { demoMode } = useDemoMode();
  const query = useQuery<AnySpace | undefined>({
    queryKey: [SAFE_SPACES_KEY, "detail", slug, demoMode],
    enabled: slug !== undefined,
    initialData: demoMode ? getSpace(slug) : undefined,
    queryFn: async () => {
      if (demoMode) return getSpace(slug);
      if (slug === undefined) return undefined;
      try {
        return safeSpaceDetailDtoToSpace(await getSafeSpace(slug));
      } catch {
        // 404 (or any read failure) → treat as not found; the page redirects.
        return undefined;
      }
    },
  });
  return { space: query.data, isLoading: query.isLoading };
}
