import {
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { profileToMember } from "../../features/members/api/members.adapters";
import { logError } from "../observability/logger";
import { toItemsPage, type ItemsPage } from "./pagination";
import type { SavedItemDTO } from "../../features/members/api/saved.api";
import type { BlockDTO, MuteDTO } from "../../features/social/api/social.api";
import { getBootstrap, type BootstrapDTO } from "./bootstrap.api";

/**
 * `BootstrapDTO` with the three list slices normalized to the envelope shape
 * — this is what the query actually resolves to (and seeds/returns), never
 * the raw `T[] | ItemsPage<T>` union. See the `BootstrapDTO` docblock for why
 * the union exists on the wire.
 */
type NormalizedBootstrap = Omit<BootstrapDTO, "saved" | "blocks" | "mutes"> & {
  saved: ItemsPage<SavedItemDTO>;
  blocks: ItemsPage<BlockDTO>;
  mutes: ItemsPage<MuteDTO>;
};

/**
 * One request for the four session slices, seeded into the caches the
 * individual hooks already read from.
 *
 * This is a cache-warmer, not a replacement: every consuming hook keeps its own
 * endpoint. If this 404s (frontend deployed ahead of the backend) or 500s, the
 * seeding simply doesn't happen and each hook fetches for itself — the member
 * gets a slower load, never an error. That's what lets the two repos deploy
 * independently, so do NOT make anything depend on this resolving.
 *
 * `demoMode` is literal `false` in the seeded keys: bootstrap only runs live,
 * and demo mode must never touch the network.
 *
 * Seeding happens inside `queryFn`, not a `useEffect`. React flushes passive
 * effects children-first, so a consumer's own effect can run before this
 * provider's seeding effect within the same commit — the consumer would find
 * an empty cache and fetch anyway. Seeding inside `queryFn` completes before
 * the query promise resolves, therefore before any re-render, therefore
 * before any consumer's `enabled` can flip true. See
 * `useSessionBootstrapSettled` for how consumers gate on this.
 */
function seedFromBootstrap(
  queryClient: QueryClient,
  data: NormalizedBootstrap,
  slug: string | undefined,
) {
  try {
    queryClient.setQueryData(["blocks", false], data.blocks);
    queryClient.setQueryData(["mutes", false], data.mutes);
    if (slug) {
      queryClient.setQueryData(["profile", false, slug], {
        member: profileToMember(data.profile),
        limited: data.profile.limited,
      });
    }
  } catch (err) {
    // Seeding is best-effort. A malformed slice must not take the app down,
    // and must not fail the bootstrap query itself (the raw payload is still
    // valid and returned below).
    logError(err, { scope: "bootstrap.seed" });
  }
}

/**
 * The cache key for the session bootstrap payload, carrying BOTH isolating
 * segments: the demo/live mode every sibling key already carries, and the id of
 * the member the payload belongs to.
 *
 * That second segment is the point. The payload is one member's blocks, mutes,
 * saved items and profile, held at `staleTime: Infinity`, so on a shared device
 * the next member signing in must not be able to read it. Keying on the member
 * makes that true by construction: a different member is a different cache
 * entry, and nothing has to be remembered to keep it that way. The
 * `queryClient.clear()` in `AuthProvider`'s `signOut()` still runs, and stays
 * worth having as a backstop covering every other authenticated key.
 *
 * `memberId` is `null` while signed out or still checking, which is also
 * exactly when the query is disabled, so that entry never holds anything.
 *
 * The member id is available here without a chicken-and-egg: `AuthProvider`
 * resolves `GET /auth/me` first and sets `user` and `loggedIn` together, and
 * this query only enables once `loggedIn` is true.
 */
export function sessionBootstrapQueryKey(
  demoMode: boolean,
  memberId: string | null,
) {
  return ["bootstrap", demoMode, memberId] as const;
}

export function useSessionBootstrap() {
  const { demoMode } = useDemoMode();
  const { loggedIn, user } = useAuth();
  const queryClient = useQueryClient();
  const slug = user?.profile.slug;
  const memberId = user?.id ?? null;

  return useQuery<NormalizedBootstrap>({
    queryKey: sessionBootstrapQueryKey(demoMode, memberId),
    enabled: !demoMode && loggedIn,
    // One shot per session. Refetching would defeat the point — the individual
    // hooks own staleness for their own slice from here on.
    staleTime: Infinity,
    // Cache-warmer, not a dependency: a 500 must fail soft, same as
    // usePlatformStatus. Without `silentError` the app-wide QueryCache
    // onError (src/shared/api/errorHandling.ts) would toast "Something went
    // wrong on our end" for a request the member never made and whose
    // failure is invisible to them either way.
    meta: { silentError: true },
    retry: false,
    queryFn: async () => {
      const raw = await getBootstrap();
      // Normalize the three list slices the same way their own standalone
      // fetchers (`getBlocks`/`getMutes`/`getSaved`) do, BEFORE seeding or
      // returning. Before this fix, a bare-array response would seed
      // `["blocks", false]`/`["mutes", false]` with something whose `.items`
      // is undefined — and since the settled gate means the eager `/blocks`
      // fetch that used to overwrite a bad seed no longer runs, that bad
      // value is now what `SocialProvider` renders from permanently (an
      // empty/broken blocked list — a safety regression, not a cosmetic
      // one). `SavedProvider` reads `data.saved.items` directly off this same
      // query's data, so it gets the same exposure and the same fix here.
      const data: NormalizedBootstrap = {
        ...raw,
        saved: toItemsPage(raw.saved),
        blocks: toItemsPage(raw.blocks),
        mutes: toItemsPage(raw.mutes),
      };
      // Seed before returning: this must complete before the query promise
      // resolves so consumers gated on `useSessionBootstrapSettled()` see
      // warm caches the instant their `enabled` flips true.
      seedFromBootstrap(queryClient, data, slug);
      return data;
    },
  });
}

/**
 * Gate for the three bootstrap-seeded consumers (blocks, mutes, own profile):
 * true once it's safe for them to run their own `enabled` check.
 *
 * Subscribes to the same `useSessionBootstrap()` query (react-query dedupes
 * by key, so this is not a second request) and opens when either:
 * - the bootstrap query doesn't apply at all (demo mode, or logged out) — it's
 *   `enabled: false` and will never settle, so the gate must open immediately
 *   or the consumers would hang forever waiting on a query that never runs.
 * - the query has settled, success **or error** (`isFetched`). Settled-not-
 *   succeeded is deliberate: if bootstrap 404s or 500s, the gate still opens
 *   so each consumer falls back to its own endpoint. That fallback is what
 *   lets the frontend and backend deploy independently, and it must not
 *   regress here.
 */
export function useSessionBootstrapSettled(): boolean {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const query = useSessionBootstrap();
  if (demoMode || !loggedIn) return true;
  return query.isFetched;
}
