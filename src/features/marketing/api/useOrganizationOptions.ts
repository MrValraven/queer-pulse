import { useMemo } from "react";
import { useMyCommunityOptions } from "../../communities/api/useMyCommunityOptions";
import { usePartnerOptions } from "./usePartnerOptions";

export interface OrganizationOption {
  kind: "partner" | "community";
  slug: string;
  name: string;
}

/**
 * The combined list a volunteering opportunity's single "organization"
 * picker offers: approved partner orgs plus the communities the viewer owns
 * or moderates, tagged by `kind` so `OrganizationPickerField` can group them
 * and route a selection back to the right one of `partnerSlug`/
 * `communitySlug`. Communities are owner/mod-only — attributing an
 * opportunity to a community is speaking for it, unlike partners (an
 * approved, platform-curated list anyone can post on behalf of).
 */
export function useOrganizationOptions(): OrganizationOption[] {
  const partners = usePartnerOptions();
  const communities = useMyCommunityOptions({ roles: ["owner", "mod"] });

  return useMemo(
    () => [
      ...partners.map((partner) => ({
        kind: "partner" as const,
        slug: partner.slug,
        name: partner.name,
      })),
      ...communities.map((community) => ({
        kind: "community" as const,
        slug: community.slug,
        name: community.name,
      })),
    ],
    [partners, communities],
  );
}
