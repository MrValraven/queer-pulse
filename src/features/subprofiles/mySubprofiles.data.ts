import type { BadgeTone } from "../../shared/components/ui";
import type { LinkVisibility, SubprofileStatus } from "./api/subprofiles.api";

/** Status pill tone + label for the dashboard rows and the editor header. */
export const STATUS_BADGE: Record<
  SubprofileStatus,
  { tone: BadgeTone; label: string }
> = {
  draft: { tone: "amber", label: "Draft" },
  published: { tone: "jade", label: "Published" },
};

/** Link-state pill: linked to the main profile vs a standalone persona. */
export const LINK_BADGE: Record<
  LinkVisibility,
  { tone: BadgeTone; label: string }
> = {
  linked: { tone: "violet", label: "Linked" },
  unlinked: { tone: "plum", label: "Standalone" },
};
