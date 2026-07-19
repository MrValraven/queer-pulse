import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "./DemoModeProvider";
import { useAuth } from "./authContext";
import { useToast } from "../../shared/components/feedback/useToast";
import { logError } from "../../shared/observability/logger";
import { useSessionBootstrapSettled } from "../../shared/api/useSessionBootstrap";
import {
  blockMember,
  getBlocks,
  getMutes,
  muteMember,
  unblockMember,
  unmuteMember,
  type BlockOptions,
} from "../../features/social/api/social.api";

interface SocialState {
  following: string[];
  muted: string[];
  blocked: string[];
}

interface SocialContextValue {
  /** Slugs the user has blocked, most-recent first. */
  blocked: string[];
  /** Slugs the user has muted, most-recent first. */
  muted: string[];
  isFollowing: (slug: string) => boolean;
  /** Toggle follow; returns the new state (true = now following). */
  toggleFollow: (slug: string) => boolean;
  isMuted: (slug: string) => boolean;
  /** Toggle mute; returns the new state (true = now muted). */
  toggleMute: (slug: string) => boolean;
  isBlocked: (slug: string) => boolean;
  /** Toggle block; returns the new state (true = now blocked). Opts feed the
   *  live `POST /blocks/:slug` body (reason / "also report"). */
  toggleBlock: (slug: string, opts?: BlockOptions) => boolean;
}

const SocialContext = createContext<SocialContextValue | null>(null);
const STORAGE_KEY = "qp.social.v1";

function readInitial(): SocialState {
  const empty: SocialState = { following: [], muted: [], blocked: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    return {
      following: Array.isArray(parsed?.following) ? parsed.following : [],
      muted: Array.isArray(parsed?.muted) ? parsed.muted : [],
      blocked: Array.isArray(parsed?.blocked) ? parsed.blocked : [],
    };
  } catch {
    return empty;
  }
}

/**
 * App-wide store of social relationships — who the user follows, mutes and
 * blocks. Blocks and mutes are keyed on **member slug** everywhere (feed,
 * connections, messages, profile) so the surfaces reconcile.
 *
 * Dual-mode, mirroring `connect/api/*`:
 * - **Demo mode** (no backend): the original localStorage-backed store, so the
 *   mock experience is byte-for-byte unchanged and never hits the network.
 * - **Live mode**: `blocked`/`muted` hydrate from `GET /blocks` + `GET /mutes`;
 *   toggles fire the matching `/blocks|/mutes` call with an optimistic local
 *   update and rollback + error toast on failure. `following` stays local (no
 *   follow contract in this spec).
 */
export function SocialProvider({ children }: { children: ReactNode }) {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const bootstrapSettled = useSessionBootstrapSettled();
  const [state, setState] = useState<SocialState>(readInitial);

  // Demo mode is the only durable store; live mode's truth is the server.
  useEffect(() => {
    if (!demoMode) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — keep in-memory only */
    }
  }, [demoMode, state]);

  // Live-mode hydration. Idle in demo mode, and until the member is signed in —
  // firing these while logged out just 401s and hammers the refresh endpoint.
  // Also idle until the session bootstrap has settled: it seeds these exact
  // cache keys, so waiting lets a successful bootstrap warm the cache and
  // skip this fetch entirely, while a failed/inapplicable bootstrap still
  // opens the gate so this falls back to its own endpoint.
  const blocksQuery = useQuery({
    queryKey: ["blocks", demoMode],
    enabled: !demoMode && loggedIn && bootstrapSettled,
    queryFn: () => getBlocks(),
  });
  const mutesQuery = useQuery({
    queryKey: ["mutes", demoMode],
    enabled: !demoMode && loggedIn && bootstrapSettled,
    queryFn: () => getMutes(),
  });

  // Hydrate local state from server data during render (the repo's snap pattern,
  // avoiding a setState-in-effect). We track the applied query pages by identity
  // so we only merge when React Query hands us a fresh page — preserving any
  // optimistic toggles made since.
  const blocksData = blocksQuery.data;
  const mutesData = mutesQuery.data;
  const [appliedBlocks, setAppliedBlocks] = useState(blocksData);
  const [appliedMutes, setAppliedMutes] = useState(mutesData);
  if (
    !demoMode &&
    (blocksData !== appliedBlocks || mutesData !== appliedMutes) &&
    (blocksData !== undefined || mutesData !== undefined)
  ) {
    setAppliedBlocks(blocksData);
    setAppliedMutes(mutesData);
    setState((prev) => ({
      following: prev.following,
      blocked: blocksData
        ? blocksData.items.map((b) => b.member.slug)
        : prev.blocked,
      muted: mutesData ? mutesData.items.map((m) => m.member.slug) : prev.muted,
    }));
  }

  /**
   * Optimistically flip an id in `blocked`/`muted`, then (live mode) fire the
   * API and roll back + toast on failure. Returns the optimistic new state.
   */
  const persistToggle = useCallback(
    (
      key: "blocked" | "muted",
      slug: string,
      add: (s: string) => Promise<unknown>,
      remove: (s: string) => Promise<unknown>,
    ): boolean => {
      let now = false;
      setState((prev) => {
        const has = prev[key].includes(slug);
        now = !has;
        return {
          ...prev,
          [key]: has
            ? prev[key].filter((x) => x !== slug)
            : [slug, ...prev[key]],
        };
      });

      if (!demoMode) {
        const call = now ? add(slug) : remove(slug);
        Promise.resolve(call)
          .then(() => {
            // Blocking severs connections server-side — refresh those surfaces.
            if (key === "blocked") {
              queryClient.invalidateQueries({ queryKey: ["connections"] });
              queryClient.invalidateQueries({ queryKey: ["members"] });
            }
          })
          .catch((err) => {
            logError(err, { scope: "social", key, slug, added: now });
            setState((prev) =>
              now
                ? { ...prev, [key]: prev[key].filter((x) => x !== slug) }
                : prev[key].includes(slug)
                  ? prev
                  : { ...prev, [key]: [slug, ...prev[key]] },
            );
            showToast(
              key === "blocked"
                ? "We couldn't update that block. Please try again."
                : "We couldn't update that. Please try again.",
              "error",
            );
          });
      }
      return now;
    },
    [demoMode, queryClient, showToast],
  );

  const toggleFollow = useCallback((slug: string): boolean => {
    // No follow contract in this spec — stays local in both modes.
    let now = false;
    setState((prev) => {
      const has = prev.following.includes(slug);
      now = !has;
      return {
        ...prev,
        following: has
          ? prev.following.filter((x) => x !== slug)
          : [slug, ...prev.following],
      };
    });
    return now;
  }, []);

  const toggleMute = useCallback(
    (slug: string) => persistToggle("muted", slug, muteMember, unmuteMember),
    [persistToggle],
  );

  const toggleBlock = useCallback(
    (slug: string, opts?: BlockOptions) =>
      persistToggle(
        "blocked",
        slug,
        (s) => blockMember(s, opts),
        unblockMember,
      ),
    [persistToggle],
  );

  const value = useMemo<SocialContextValue>(
    () => ({
      blocked: state.blocked,
      muted: state.muted,
      isFollowing: (slug) => state.following.includes(slug),
      toggleFollow,
      isMuted: (slug) => state.muted.includes(slug),
      toggleMute,
      isBlocked: (slug) => state.blocked.includes(slug),
      toggleBlock,
    }),
    [state, toggleFollow, toggleMute, toggleBlock],
  );

  return (
    <SocialContext.Provider value={value}>{children}</SocialContext.Provider>
  );
}

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) {
    throw new Error("useSocial must be used within SocialProvider");
  }
  return ctx;
}
