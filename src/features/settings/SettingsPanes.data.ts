import type { VisibilityMode } from "../../shared/components/ui/VisibilityBadge";

// Stable ids for the visibility radio options — never the translated label.
export const VISIBILITY_OPTIONS: {
  v: VisibilityMode;
  titleKey: string;
  descKey: string;
}[] = [
  {
    v: "open",
    titleKey: "settings:visibility.open.title",
    descKey: "settings:visibility.open.desc",
  },
  {
    v: "network",
    titleKey: "settings:visibility.network.title",
    descKey: "settings:visibility.network.desc",
  },
  {
    v: "private",
    titleKey: "settings:visibility.private.title",
    descKey: "settings:visibility.private.desc",
  },
];
