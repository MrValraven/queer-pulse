import { useState } from "react";
import { HowCommunitiesWorkModal } from "./HowCommunitiesWorkModal";

/**
 * Owns the open/closed state for the "How communities work" explainer modal so
 * each of its several CTA sites (homepage sections, communities hub header)
 * doesn't repeat the same `useState` + conditional-render boilerplate. Mirrors
 * `ExploreMembersCta`'s local-state pattern, just packaged as a hook since this
 * explainer has multiple call sites instead of one.
 */
export function useHowCommunitiesWorkModal() {
  const [open, setOpen] = useState(false);
  return {
    openModal: () => setOpen(true),
    modalElement: open ? (
      <HowCommunitiesWorkModal onClose={() => setOpen(false)} />
    ) : null,
  };
}
