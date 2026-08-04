import { createContext, useContext } from "react";
import type { BlockOptions } from "../../features/social/api/social.api";

export interface SocialContextValue {
  /** Slugs the user has blocked, most-recent first. */
  blocked: string[];
  /** Slugs the user has muted, most-recent first. */
  muted: string[];
  /**
   * Whether member/author "Follow" is a real capability here. False in live —
   * there is no member/author-level follow endpoint (only per-subprofile
   * persona follow, wired separately via `useFollow`), so `toggleFollow` is an
   * honest no-op and `isFollowing` is always false there. True in demo, where
   * follow is a local store. Consumers should render the Follow control only
   * when this is true.
   */
  followEnabled: boolean;
  isFollowing: (slug: string) => boolean;
  /** Toggle follow; returns the new state (true = now following). No-op in live
   *  (see `followEnabled`). */
  toggleFollow: (slug: string) => boolean;
  isMuted: (slug: string) => boolean;
  /** Toggle mute; returns the new state (true = now muted). */
  toggleMute: (slug: string) => boolean;
  isBlocked: (slug: string) => boolean;
  /** Toggle block; returns the new state (true = now blocked). Opts feed the
   *  live `POST /blocks/:slug` body (reason / "also report"). */
  toggleBlock: (slug: string, opts?: BlockOptions) => boolean;
}

export const SocialContext = createContext<SocialContextValue | null>(null);

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) {
    throw new Error("useSocial must be used within SocialProvider");
  }
  return ctx;
}
