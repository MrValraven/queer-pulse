import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getFeaturedCommunity } from "./communities.api";
import { cardDtoToCommunity } from "./communities.adapters";
import { communities } from "../../homepage/data/communities";
import type { Community } from "../../homepage/data/types";
import { getDemoFeaturedSlug, subscribeDemoFeatured } from "../featuredCommunity.demo";

/**
 * The platform-wide featured community (the Discover page's hero card), or
 * `null` when no community is currently featured.
 *
 * Demo mode reads the module-level `featuredCommunity.demo.ts` store (kept in
 * sync by the admin console's `useUpdateAdminCommunity` toggle) and looks the
 * slug up in the Discover page's own static registry — see that file's doc
 * comment for why a demo toggle can land on a slug Discover doesn't
 * recognize (graceful `null`, not a crash). `useSyncExternalStore` re-renders
 * this hook the moment the admin toggle fires, with no network round-trip to
 * invalidate. Live mode calls `GET /communities/featured` and adapts the
 * result through the existing `cardDtoToCommunity`, same as `useCommunities`.
 */
export function useFeaturedCommunity(): Community | null {
  const { demoMode } = useDemoMode();

  const demoSlug = useSyncExternalStore(
    subscribeDemoFeatured,
    getDemoFeaturedSlug,
    getDemoFeaturedSlug,
  );

  const query = useQuery<Community | null>({
    queryKey: ["communities", "featured", demoMode],
    enabled: !demoMode,
    queryFn: async () => {
      const dto = await getFeaturedCommunity();
      return dto ? cardDtoToCommunity(dto) : null;
    },
  });

  if (demoMode) {
    return communities.find((community) => community.slug === demoSlug) ?? null;
  }
  return query.data ?? null;
}
