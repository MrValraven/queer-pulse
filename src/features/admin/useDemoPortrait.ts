import { useCallback } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { portrait } from "./adminPeople.data";

/**
 * The demo portrait registry, gated on demo mode.
 *
 * `portrait()` is keyed by a person's NAME, so in live mode it will happily
 * hand a real account the stock photo of whichever fixture person shares their
 * name — a stranger's face on a real record. Surfaces that render in both
 * modes call this instead of `portrait()` directly: demo keeps its faces, live
 * falls through to the person's own `avatarUrl` and then to tinted initials.
 */
export function useDemoPortrait(): (name?: string) => string | undefined {
  const { demoMode } = useDemoMode();
  return useCallback(
    (name?: string) => (demoMode ? portrait(name) : undefined),
    [demoMode],
  );
}
