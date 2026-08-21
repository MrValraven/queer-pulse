// Demo-only module state for the platform-wide "featured community" singleton
// (mirrors the backend's `Community.isFeatured`, a real column enforced as a
// singleton server-side by `CommunitiesService`).
//
// This deliberately ISN'T a React Context — there's already a heavier Context
// for cross-cutting membership state (`src/app/providers/useCommunityMembership.ts`);
// that pattern is overkill for one value read by two small hooks. Instead this
// is a plain module-level store (mirroring the demo `onMutate` fixture-mutation
// idiom in `src/features/admin/api/useUpdateAdminCommunity.ts`), with a tiny
// pub/sub so `useFeaturedCommunity` can re-render via `useSyncExternalStore`.
//
// KNOWN LIMITATION (pre-existing in this codebase, not introduced here): the
// admin console's demo fixture (`src/features/admin/adminCommunities.data.ts`,
// `COMMUNITIES` — slugs like "trans-friends", "queer-creatives") and the
// Discover page's demo registry (`src/features/homepage/data/communities.ts`,
// `communities` — slugs like "queer-social", "rainbow-arts") are two ALREADY-
// DISCONNECTED demo datasets with non-overlapping slugs. So in demo mode,
// toggling "Featured on Discover" for most admin-console rows sets a slug the
// Discover registry doesn't recognize, and the Discover hero card simply
// won't render (a graceful `null`, not a crash) — that's the honest, correct
// behavior given the mismatch, not a bug to work around here. Defaulted to
// "queer-social" so the Discover page's demo mode shows a featured card out
// of the box.
let demoFeaturedSlug: string | null = "queer-social";
let version = 0;
const listeners = new Set<() => void>();

export function getDemoFeaturedSlug(): string | null {
  return demoFeaturedSlug;
}

export function setDemoFeaturedSlug(slug: string | null): void {
  demoFeaturedSlug = slug;
  version += 1;
  listeners.forEach((fn) => fn());
}

export function getDemoFeaturedVersion(): number {
  return version;
}

export function subscribeDemoFeatured(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
