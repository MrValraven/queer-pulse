import type { BadgeTone } from "../../shared/components/ui";
import type { LinkVisibility, SubprofileStatus } from "./api/subprofiles.api";

/** i18n label-key indirection: `status`/`linkVisibility` are PERSISTED fields,
 *  so the Record key is the stable canonical id; `labelKey` resolves via
 *  `t()` at render (SideCard.tsx, SubprofileEditorPage.tsx). */
export const STATUS_BADGE: Record<
  SubprofileStatus,
  { tone: BadgeTone; labelKey: string }
> = {
  draft: { tone: "amber", labelKey: "subprofiles:status.draft" },
  published: { tone: "jade", labelKey: "subprofiles:status.published" },
};

/** Link-state pill: linked to the main profile vs a standalone persona. */
export const LINK_BADGE: Record<
  LinkVisibility,
  { tone: BadgeTone; labelKey: string }
> = {
  linked: { tone: "violet", labelKey: "subprofiles:link.linked" },
  unlinked: { tone: "plum", labelKey: "subprofiles:link.standalone" },
};
