import type { ReactNode } from "react";
import {
  FiHeart,
  FiShield,
  FiEyeOff,
  FiLock,
  FiZap,
  FiRotateCcw,
} from "react-icons/fi";

/** The 6 possible Board card flags (`admin:roadmap.board.flag.*`), in the
 *  prototype's order — see `CardFlags.tsx` for which items get which. */
export type CardFlagKind =
  | "requested"
  | "committed"
  | "hidden"
  | "safetyGated"
  | "spike"
  | "slips";

/**
 * One icon per flag, inline from `react-icons/fi` (the repo's house icon
 * set) so every glyph inherits `currentColor` — the flag's tone (see
 * `CardFlags.module.css`) sets the actual color, never the icon itself.
 * Colocated as a `Record` per the component's own convention rather than a
 * `*.data.ts` file, since these are `ReactNode`s, not serializable data.
 */
export const CARD_FLAG_ICONS: Record<CardFlagKind, ReactNode> = {
  requested: <FiHeart aria-hidden />,
  committed: <FiShield aria-hidden />,
  hidden: <FiEyeOff aria-hidden />,
  safetyGated: <FiLock aria-hidden />,
  spike: <FiZap aria-hidden />,
  slips: <FiRotateCcw aria-hidden />,
};
