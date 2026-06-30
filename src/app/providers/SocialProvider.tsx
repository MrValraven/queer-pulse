import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface SocialState {
  following: string[];
  muted: string[];
  blocked: string[];
}

interface SocialContextValue {
  /** Ids the user has blocked, most-recent first. */
  blocked: string[];
  /** Ids the user has muted, most-recent first. */
  muted: string[];
  isFollowing: (id: string) => boolean;
  /** Toggle follow; returns the new state (true = now following). */
  toggleFollow: (id: string) => boolean;
  isMuted: (id: string) => boolean;
  /** Toggle mute; returns the new state (true = now muted). */
  toggleMute: (id: string) => boolean;
  isBlocked: (id: string) => boolean;
  /** Toggle block; returns the new state (true = now blocked). */
  toggleBlock: (id: string) => boolean;
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
 * App-wide store of social relationships — who the user follows, mutes and blocks.
 * Persists to localStorage so follow buttons (magazine authors, filmmakers, studio
 * artists) and feed moderation stay in sync across pages. Data is still mock; this
 * only tracks which mock ids the user has acted on.
 */
export function SocialProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SocialState>(readInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — keep in-memory only */
    }
  }, [state]);

  const makeToggle = useCallback(
    (key: keyof SocialState) => (id: string) => {
      let now = false;
      setState((prev) => {
        const has = prev[key].includes(id);
        now = !has;
        return {
          ...prev,
          [key]: has ? prev[key].filter((x) => x !== id) : [id, ...prev[key]],
        };
      });
      return now;
    },
    [],
  );

  const value = useMemo<SocialContextValue>(
    () => ({
      blocked: state.blocked,
      muted: state.muted,
      isFollowing: (id) => state.following.includes(id),
      toggleFollow: makeToggle("following"),
      isMuted: (id) => state.muted.includes(id),
      toggleMute: makeToggle("muted"),
      isBlocked: (id) => state.blocked.includes(id),
      toggleBlock: makeToggle("blocked"),
    }),
    [state, makeToggle],
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
