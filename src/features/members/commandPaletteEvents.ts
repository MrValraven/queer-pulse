/**
 * Custom event every search trigger dispatches to open the command palette.
 * It lives apart from CommandPalette.tsx so that importing it keeps the
 * lazily loaded palette out of the entry chunk.
 */
export const OPEN_SEARCH_EVENT = "qp:open-search";
