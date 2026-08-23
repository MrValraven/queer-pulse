import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { getFeaturedCommunity } from "./communities.api";
import { cardDtoToCommunity } from "./communities.adapters";
import { communities } from "../../homepage/data/communities";
import type { Community } from "../../homepage/data/types";
import {
  getDemoFeaturedSlug,
  subscribeDemoFeatured,
} from "../featuredCommunity.demo";

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
export function useFeaturedCommunity(
  options: { enabled?: boolean } = {},
): Community | null {
  const { enabled = true } = options;
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();

  const demoSlug = useSyncExternalStore(
    subscribeDemoFeatured,
    getDemoFeaturedSlug,
    getDemoFeaturedSlug,
  );

  const query = useQuery<Community | null>({
    queryKey: ["communities", "featured", demoMode, language],
    // Callers may gate this off where a featured hero has no place (the
    // "My communities" grid), so the request is never made rather than made
    // and discarded.
    enabled: !demoMode && enabled,
    queryFn: async () => {
      const dto = await getFeaturedCommunity();
      return dto ? cardDtoToCommunity(dto, t) : null;
    },
  });

  if (!enabled) return null;
  if (demoMode) {
    return communities.find((community) => community.slug === demoSlug) ?? null;
  }
  return query.data ?? null;
}
