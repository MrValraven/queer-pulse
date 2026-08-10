import { KIND_FAMILIES } from "./kindFamilies.data";

/** The skin-family chips shown on the directory ("All" + one per family), in
 *  the same canonical order as the create-flow's "by craft" picker
 *  (`KIND_FAMILIES`). Personas redesign Phase 4: replaces the old flat
 *  17-raw-kind chip row (`DIRECTORY_KINDS`) — the directory now filters by
 *  skin family, not individual kind. */
export const DIRECTORY_FAMILIES = KIND_FAMILIES;
