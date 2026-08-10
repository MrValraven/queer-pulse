/** One follower shown in `SubprofilePeopleModal`'s demo-mode followers list. */
export interface DemoFollowerSummary {
  slug: string;
  name: string;
  avatarUrl: string | null;
}

/**
 * A small pool of plausible demo followers. There is no per-persona demo
 * follower registry (unlike endorsers) — following has no live "list
 * followers" surface at all yet (see the DEMO-MODE NOTE in
 * `SubprofilePeopleModal.tsx`), so this pool exists purely to make the demo
 * followers list look populated rather than to model any one persona's real
 * following.
 */
const DEMO_FOLLOWER_POOL: DemoFollowerSummary[] = [
  { slug: "priya", name: "Priya Fernandes", avatarUrl: null },
  { slug: "sam-oliveira", name: "Sam Oliveira", avatarUrl: null },
  { slug: "renata-lima", name: "Renata Lima", avatarUrl: null },
  { slug: "kai", name: "Kai", avatarUrl: null },
  { slug: "bea-cardoso", name: "Bea Cardoso", avatarUrl: null },
  { slug: "diogo", name: "Diogo Vasques", avatarUrl: null },
  { slug: "mateus-p", name: "Mateus Pereira", avatarUrl: null },
  { slug: "ana-rita", name: "Ana Rita Gomes", avatarUrl: null },
  { slug: "leo-santos", name: "Leo Santos", avatarUrl: null },
  { slug: "jordan", name: "Jordan", avatarUrl: null },
];

/**
 * A stable (render-to-render), persona-dependent slice of `DEMO_FOLLOWER_POOL`
 * up to `followerCount` entries, so different demo personas show a
 * different-looking set of names instead of the exact same list everywhere.
 */
export function demoFollowersFor(
  personaId: string,
  followerCount: number,
): DemoFollowerSummary[] {
  const shownCount = Math.max(
    0,
    Math.min(followerCount, DEMO_FOLLOWER_POOL.length),
  );
  if (shownCount === 0) return [];

  let seed = 0;
  for (const character of personaId) seed += character.charCodeAt(0);
  const startIndex = seed % DEMO_FOLLOWER_POOL.length;

  return Array.from(
    { length: shownCount },
    (_unused, offset) =>
      DEMO_FOLLOWER_POOL[(startIndex + offset) % DEMO_FOLLOWER_POOL.length]!,
  );
}
