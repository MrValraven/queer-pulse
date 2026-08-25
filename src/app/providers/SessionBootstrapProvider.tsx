import type { ReactNode } from "react";
import { useSessionBootstrap } from "../../shared/api/useSessionBootstrap";

/**
 * Mount point for the session bootstrap query. Holds no state and renders no
 * UI — it exists so the one request that warms the profile / blocks / mutes /
 * saved caches has an app-wide owner, rather than being a side effect of
 * whichever provider happened to subscribe first.
 *
 * Must sit at the TOP of DataProviders: react-query dedupes by key, so any
 * provider below that also calls `useSessionBootstrap` shares this one request.
 */
export function SessionBootstrapProvider({
  children,
}: {
  children: ReactNode;
}) {
  useSessionBootstrap();
  return <>{children}</>;
}
