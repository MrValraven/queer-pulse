import { useEffect, useId, useRef, useState } from "react";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";

/**
 * The hero-panel wiring behind {@link SubprofileShowcase}: which persona is
 * currently active, the stable ids the hero panel and switch-list tabs share
 * (`heroId`/`tabId`), and the up/down cross-fade direction to animate the
 * hero with when the selection changes. Pure state/derivation, no rendering —
 * extracted out of the component so `SubprofileShowcase.tsx` stays under the
 * repo's 200-line-per-component cap.
 */
export function useShowcaseActivePersona(personas: PublicSubprofileView[]) {
  const [activeSlug, setActiveSlug] = useState(personas[0]?.slug ?? "");
  // Tracks the previously active persona's index so we can derive which way
  // the hero should slide in when the visitor picks a different row — down
  // when moving to a later persona, up when moving to an earlier one.
  const previousIndexRef = useRef(0);

  // A stable base id (React 19 `useId`) this render tree can derive matching
  // ids from: the hero panel itself (`heroId`, targeted by every tab's
  // `aria-controls`) and one id per persona's tab row (`tabId`, targeted by
  // the hero's `aria-labelledby`). Kept here — not inside the switch list —
  // so both the hero and the list agree on the same ids without either
  // owning the other's DOM.
  const heroId = useId();
  const tabIdBase = useId();
  const tabId = (slug: string) => `${tabIdBase}-tab-${slug}`;

  // Fall back to the first persona if the selected slug ever drops out (e.g. the
  // list changed underneath us). Never render an empty hero.
  const active =
    personas.find((persona) => persona.slug === activeSlug) ?? personas[0];

  const hasList = personas.length > 1;

  // -1 when `active` is undefined (empty `personas`) — kept as a hook-order-
  // stable computation (no early return above this point) so the effect
  // below is always called in the same order every render.
  const nextIndex = active
    ? personas.findIndex((persona) => persona.slug === active.slug)
    : -1;
  // Reading the previous committed index during render is deliberate: the slide
  // direction must be COMMITTED to the DOM to trigger the CSS animation, so the
  // ref is updated in the effect below (after commit), never during render. A
  // during-render setState would discard the direction-bearing render and
  // collapse every transition to "none". Read once into a local here so the
  // direction expression itself stays ref-free.
  // eslint-disable-next-line react-hooks/refs -- holds the last committed index; see above
  const previousIndex = previousIndexRef.current;
  const direction: "up" | "down" | "none" =
    nextIndex > previousIndex
      ? "down"
      : nextIndex < previousIndex
        ? "up"
        : "none";
  // Written in an effect, not during render: StrictMode double-invokes the
  // render body, and a raw ref write during render would be overwritten by
  // the second pass before it could be read — collapsing every direction to
  // "none". An update effect runs once per committed render, after both
  // passes, so it always reads/writes a stable previous index.
  useEffect(() => {
    if (nextIndex >= 0) {
      previousIndexRef.current = nextIndex;
    }
  }, [nextIndex]);

  return {
    active,
    activeSlug,
    setActiveSlug,
    direction,
    heroId,
    tabId,
    hasList,
  };
}
