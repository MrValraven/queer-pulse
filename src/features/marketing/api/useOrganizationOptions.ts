import { useMemo } from "react";
import { useMyCommunityOptions } from "../../communities/api/useMyCommunityOptions";
import type { OwnedPartnerDTO } from "./partners.api";
import { useMyPartners } from "./useMyPartners";

export interface OrganizationOption {
  kind: "partner" | "community";
  slug: string;
  name: string;
}

/** An option as the picker lists it. `isPinnedOnly` marks the edit flow's
 *  current link when the poster no longer runs that organisation, so it
 *  renders in its own group. */
export interface OrganizationPickerOption extends OrganizationOption {
  isPinnedOnly: boolean;
}

// Stable fallbacks, so an absent `pinned` argument or a still-loading partner
// read never hands the memo below a fresh array on every render.
const NO_PINNED_ORGANIZATIONS: OrganizationOption[] = [];
const NO_OWNED_PARTNERS: OwnedPartnerDTO[] = [];

const liveOption = (option: OrganizationOption): OrganizationPickerOption => ({
  ...option,
  isPinnedOnly: false,
});

/** The `pinned` options missing from `live`. Both lists hold one kind, so the
 *  slug alone identifies an organisation, and the live entry wins for one
 *  that appears in both. */
function pinnedOnly(
  live: OrganizationOption[],
  pinned: OrganizationOption[],
): OrganizationPickerOption[] {
  const liveSlugs = new Set(live.map((option) => option.slug));
  return pinned
    .filter((option) => !liveSlugs.has(option.slug))
    .map((option) => ({ ...option, isPinnedOnly: true }));
}

/**
 * The organisations a volunteering opportunity can be linked to by its
 * poster: the partner orgs they MAINTAIN (`GET /my-partners`, approved rows
 * only) plus the communities they own or moderate, tagged by `kind` so
 * `OrganizationField` can group them and route a selection back to the right
 * one of `partnerSlug`/`communitySlug`. Both halves are organisations the
 * poster runs, since linking an opportunity to one is speaking for it.
 *
 * `pinned` carries the link an existing opportunity already has (the edit
 * flow's). One missing from the live lists comes first, flagged
 * `isPinnedOnly`, so it stays selectable in its own group after the poster
 * stops running that organisation. A failed partner read shows the global
 * error toast and leaves the partner half empty, so the picker offers the
 * communities alone; the free-text mode stays available as the way through.
 *
 * `useMyPartners` needs no `enabled` gate here: both forms sit on gated routes
 * that `AppRoutes` holds on its loader until the session has settled.
 */
export function useOrganizationOptions(
  pinned: OrganizationOption[] = NO_PINNED_ORGANIZATIONS,
): OrganizationPickerOption[] {
  const partners = useMyPartners().data ?? NO_OWNED_PARTNERS;
  const communities = useMyCommunityOptions({ roles: ["owner", "mod"] });

  return useMemo(() => {
    const livePartners = partners.map((partner) => ({
      kind: "partner" as const,
      slug: partner.slug,
      name: partner.name,
    }));
    const liveCommunities = communities.map((community) => ({
      kind: "community" as const,
      slug: community.slug,
      name: community.name,
    }));
    return [
      ...pinnedOnly(
        livePartners,
        pinned.filter((option) => option.kind === "partner"),
      ),
      ...pinnedOnly(
        liveCommunities,
        pinned.filter((option) => option.kind === "community"),
      ),
      ...livePartners.map(liveOption),
      ...liveCommunities.map(liveOption),
    ];
  }, [partners, communities, pinned]);
}
