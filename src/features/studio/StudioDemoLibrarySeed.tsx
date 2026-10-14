import { useStudioDemoLibrarySeed } from "./api/useStudioLibrarySaves";

/** Seeds the demo library fixture (the liked songs among it) on whichever
 *  Studio page a visitor opens first. A leaf, so a save re-renders only this
 *  null element and the shell around it stays put. */
export function StudioDemoLibrarySeed() {
  useStudioDemoLibrarySeed();
  return null;
}
