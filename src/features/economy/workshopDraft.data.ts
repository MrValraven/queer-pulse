import type { WorkshopDraft } from "./addWorkshop.build";

/** A blank listing, with the defaults the prototype shipped. Split out of
 * WorkshopDraftFields.tsx so that file only exports its component
 * (react-refresh/only-export-components). */
export const EMPTY_WORKSHOP_DRAFT: WorkshopDraft = {
  title: "",
  blurb: "",
  about: "",
  category: "creative",
  mode: "In-person",
  weeks: "6",
  size: "8",
  price: "150",
  venue: "",
};
