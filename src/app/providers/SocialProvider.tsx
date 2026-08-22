import type { ReactNode } from "react";
import { SocialContext } from "./useSocial";
import { useSocialStore } from "./useSocialStore";

/**
 * App-wide store of social relationships — who the member follows, mutes and
 * blocks. The whole state machine lives in {@link useSocialStore}; this is the
 * provider around it.
 */
export function SocialProvider({ children }: { children: ReactNode }) {
  const value = useSocialStore();
  return (
    <SocialContext.Provider value={value}>{children}</SocialContext.Provider>
  );
}
