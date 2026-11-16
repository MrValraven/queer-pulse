/**
 * Demo only. The admin console's community fixture (`adminCommunities.data.ts`)
 * and the member-side demo registry (`homepage/data/communities.ts`) carry
 * separate slugs, so `/admin/communities/<fixture slug>/mod` would find no
 * community in demo. This pairs each fixture slug with a registry community
 * of a similar kind, so the mod panel opens with real demo rows behind it.
 * Live mode never reads it: there the URL slug is the community's own slug.
 */
export const ADMIN_MOD_DEMO_SLUGS: Readonly<Record<string, string>> = {
  "trans-friends": "trans-hub",
  "queer-creatives": "rainbow-arts",
  "lisbon-queers": "queer-social",
  "newly-arrived": "coming-out",
  "trans-healthcare": "trans-mutual-aid",
  "nightlife-afters": "queer-youth",
  "elders-memory": "queer-elders",
  "mutual-aid-lisbon": "queer-parents",
};
