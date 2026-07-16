import { routes } from "../../app/routeMap";

/**
 * i18n Pattern A. Copy for the persona not-found wall — catalog keys, resolved
 * by `SubprofilePage.tsx` via `t()`. Mirrors the warm, non-blaming tone of the
 * main ProfilePage's not-found state — nothing's wrong on the reader's end.
 */
export const NOT_FOUND = {
  titleKey: "subprofiles:page.notFoundTitle",
  descriptionKey: "subprofiles:page.notFoundDescription",
  actionLabelKey: "subprofiles:page.notFoundAction",
  actionTo: routes.subprofiles,
  backLabelKey: "subprofiles:page.notFoundBack",
} as const;
