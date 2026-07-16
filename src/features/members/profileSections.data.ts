import type { IconType } from "react-icons";
import { FiBook, FiMusic, FiPlay, FiStar } from "react-icons/fi";

/** Icon + catalog key for each "What shaped me" slot. Resolve `labelKey` with
 *  `t()` — the label text itself is platform chrome, not a fetched value. */
export const SHAPING_META: Record<string, { labelKey: string; icon: IconType }> = {
  film: { labelKey: "members:shaping.film", icon: FiPlay },
  book: { labelKey: "members:shaping.book", icon: FiBook },
  song: { labelKey: "members:shaping.song", icon: FiMusic },
  moment: { labelKey: "members:shaping.moment", icon: FiStar },
};

/** Catalog key per visibility state, shown as the hero's Eyebrow badge. */
export const VISIBILITY_LABEL_KEY = {
  open: "members:visibility.open",
  network: "members:visibility.network",
  private: "members:visibility.private",
} as const;
