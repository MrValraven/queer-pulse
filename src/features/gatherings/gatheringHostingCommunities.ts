export interface NamedHostingCommunity {
  slug: string;
  name: string;
}

/** The hero line names the lead and two guests; the rest become a count. */
export const HERO_NAMED_COMMUNITY_LIMIT = 3;

/** The communities the hero line names, lead first, and how many it counts
 *  as "and N more". */
export function heroHostingCommunities(
  lead: NamedHostingCommunity | null,
  guests: readonly NamedHostingCommunity[],
): { named: NamedHostingCommunity[]; moreCount: number } {
  const hosting = [...(lead ? [lead] : []), ...guests];
  return {
    named: hosting.slice(0, HERO_NAMED_COMMUNITY_LIMIT),
    moreCount: Math.max(0, hosting.length - HERO_NAMED_COMMUNITY_LIMIT),
  };
}

/** The catalog sentence for that many names. */
export function heroHostingKey(namedCount: number, moreCount: number): string {
  if (moreCount > 0) return "gatherings:common.hostedWithList.more";
  if (namedCount === 1) return "gatherings:common.hostedWithList.one";
  if (namedCount === 2) return "gatherings:common.hostedWithList.two";
  return "gatherings:common.hostedWithList.three";
}
