import { createContext, useContext } from "react";
import type { BlockOptions } from "../../features/social/api/social.api";

export interface SocialContextValue {
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

export const SocialContext = createContext<SocialContextValue | null>(null);

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) {
    throw new Error("useSocial must be used within SocialProvider");
  }
  return ctx;
}
