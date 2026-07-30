import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getListingsByMember } from "../../marketing/api/directory.api";
import { registryPlacesForMember, type MemberPlace } from "../places.data";

/**
 * The public places a member runs, for the visitor view of `PlacesSection`.
 *
 * Demo mode resolves against the static `DIRECTORY_PLACES` registry (mock
 * member slugs only) and never hits the network. Live mode fetches the public
 * `GET /directory/by-member/:slug` and maps each redacted card DTO onto the
 * `MemberPlace` view model — so a real member's places show for visitors too,
 * not just for the owner (whose own listings come from `GET /listings/mine`).
 *
 * Returns a plain array so it stays a drop-in for the previous synchronous
 * `registryPlacesForMember(slug)` read point.
 */
export function useMemberListings(memberSlug: string): MemberPlace[] {
  const { demoMode } = useDemoMode();
  const query = useQuery<MemberPlace[]>({
    queryKey: ["memberListings", demoMode, memberSlug],
    enabled: !demoMode && memberSlug.length > 0,
    initialData: demoMode ? registryPlacesForMember(memberSlug) : undefined,
    queryFn: async () => {
      if (demoMode) return registryPlacesForMember(memberSlug);
      const cards = await getListingsByMember(memberSlug);
      return cards.map((listing) => ({
        key: listing.slug,
        name: listing.name,
        slug: listing.slug,
        status: "live" as const,
        meta: [listing.cat, listing.hood].filter(Boolean).join(" · "),
        blurb: listing.blurb,
        ref: undefined,
      }));
    },
  });
  return query.data ?? [];
}
