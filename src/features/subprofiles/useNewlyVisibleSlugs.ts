import { useEffect, useRef } from "react";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";

/**
 * Tracks which persona slugs have ever appeared in a `visible` list, so a
 * caller can tell a genuinely-new row (never rendered by this list before)
 * apart from one that was already on screen — used by
 * {@link SubprofileSwitchList} so a filter pick or "show all" only
 * fades/staggers in the rows that are actually newly appearing, never rows
 * already visible (re-wrapping an already-mounted row in an animated
 * element would restart its CSS entrance animation on that unrelated
 * interaction).
 *
 * Seeded synchronously from the very first render's own `visible` array — a
 * one-time assignment guarded by the null check, so it's idempotent even
 * under StrictMode's double-invoked render (both passes compute the same
 * `Set` from the same `visible`, unlike a write that depends on a value a
 * prior pass already mutated). This means first paint is never treated as
 * "new" — a parent `Reveal` typically already covers first-paint entrance —
 * while every row that becomes visible afterwards reads as new until the
 * effect below folds it in after its own commit.
 */
export function useNewlyVisibleSlugs(visible: PublicSubprofileView[]) {
  const seenSlugsRef = useRef<Set<string> | null>(null);
  if (seenSlugsRef.current === null) {
    seenSlugsRef.current = new Set(visible.map((persona) => persona.slug));
  }

  useEffect(() => {
    const seenSlugs = seenSlugsRef.current;
    if (!seenSlugs) return;
    for (const persona of visible) {
      seenSlugs.add(persona.slug);
    }
  }, [visible]);

  return (slug: string) => !seenSlugsRef.current?.has(slug);
}
