import type { ReactNode } from "react";
import { FiAward, FiFlag } from "react-icons/fi";

/**
 * Maps a backend badge `key` to its icon. Badges are hand-drawn per key, so
 * every live badge key needs an entry here; unknown keys fall back to a generic
 * award icon. The mock/demo badges in `badges.icons.tsx` carry their own inline
 * SVG art and don't go through this registry — it only serves live-mode data.
 * Extend as the catalogue grows (keep the keys in sync with the backend).
 */
const BADGE_ICONS: Record<string, ReactNode> = {
  "first-steps": <FiFlag aria-hidden />,
  // "first-gathering": <svg …/>,
  // "three-company": <svg …/>,
};

export function badgeIconFor(key: string): ReactNode {
  return BADGE_ICONS[key] ?? <FiAward aria-hidden />;
}
