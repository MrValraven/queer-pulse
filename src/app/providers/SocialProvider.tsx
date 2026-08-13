import {
  useCallback,
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
import { describeError } from "../../shared/api/errorMessage";
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
import { UNREAD_COUNT_KEY } from "../../features/messages/api/useConversations";
import {
  SocialContext,
  type SocialContextValue,
} from "./useSocial";

interface SocialState {
  following: string[];
  muted: string[];
  blocked: string[];
}

const STORAGE_KEY = "qp.social.v1";

function readInitial(): SocialState {
  const empty: SocialState = { following: [], muted: [], blocked: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed: unknown = JSON.parse(raw);
    const record =
      typeof parsed === "object" && parsed !== null
        ? (parsed as Record<string, unknown>)
        : {};
    const asSlugList = (value: unknown): string[] =>
      Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string")
        : [];
    return {
      following: asSlugList(record.following),
      muted: asSlugList(record.muted),
      blocked: asSlugList(record.blocked),
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
 *   update and rollback + error toast on failure.
 *
 * **Follow** has NO member/author-level backend contract (the only real follow
 * endpoint is per-subprofile persona follow — `POST/DELETE /subprofiles/:id/
 * follow`, wired separately via `useFollow`). So member/author follow here is
 * honestly gated OFF in live: `followEnabled` is false, `toggleFollow` is a
 * no-op, and `following` is never seeded, persisted, or toggled — removing the
 * old localStorage-only fiction. In demo mode it stays fully functional as a
 * local store. Consumers should render the Follow control only when
 * `followEnabled` (a follow-up for the pages that still show it in live —
 * `magazine/AuthorHeader`; `studio`/`cinema` are already demo-only routes).
 */
export function SocialProvider({ children }: { children: ReactNode }) {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const bootstrapSettled = useSessionBootstrapSettled();
  // Only seed from localStorage in demo mode. Live must NOT read the demo store
  // — that's how demo follows used to bleed into a live session, and how one
  // member's blocked/muted list briefly leaked to the next on a shared device
  // before server hydration. Live starts empty; `blocked`/`muted` then hydrate
  // from the server below, and `following` stays empty (honest-gated off).
  const [state, setState] = useState<SocialState>(() =>
    demoMode ? readInitial() : { following: [], muted: [], blocked: [] },
  );

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
            // A block also hides the pair's DM from the inbox server-side
            // (`ConversationsService.listConversations`), so re-fetch the
            // thread list + the nav unread badge too — otherwise a block/
            // unblock made from inside a chat wouldn't make the thread
            // disappear/reappear until an unrelated refetch happened to fire.
            if (key === "blocked") {
              void queryClient.invalidateQueries({ queryKey: ["connections"] });
              void queryClient.invalidateQueries({ queryKey: ["members"] });
              void queryClient.invalidateQueries({ queryKey: ["conversations"] });
              void queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
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
              describeError(
                key === "blocked"
                  ? "We couldn't update that block"
                  : "We couldn't update that",
                err,
              ),
              "error",
            );
          });
      }
      return now;
    },
    [demoMode, queryClient, showToast],
  );

  const toggleFollow = useCallback(
    (slug: string): boolean => {
      // No member/author-level follow endpoint exists (see the provider
      // docblock). In live this is an honest no-op — never a localStorage
      // fiction — so `following` stays empty and nothing false is persisted.
      if (!demoMode) return false;
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
    },
    [demoMode],
  );

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
      // Live has no follow backend, so `following` is always empty there — this
      // reads false in live and reflects the local demo store in demo.
      followEnabled: demoMode,
      isFollowing: (slug) => state.following.includes(slug),
      toggleFollow,
      isMuted: (slug) => state.muted.includes(slug),
      toggleMute,
      isBlocked: (slug) => state.blocked.includes(slug),
      toggleBlock,
    }),
    [state, demoMode, toggleFollow, toggleMute, toggleBlock],
  );

  return (
    <SocialContext.Provider value={value}>{children}</SocialContext.Provider>
  );
}
