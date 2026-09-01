/**
 * The commission-board taxonomy, on its own so a live surface can use it.
 *
 * These five ids are the contract with the backend: they are exactly the
 * `CommissionCategory` enum on `queerpulse-backend/src/culture/entities/
 * commission-interest.entity.ts`, which `CreateCommissionInterestDto` validates
 * with `@IsEnum`. Changing a spelling here without changing it there turns every
 * submission into a 400.
 *
 * It lives apart from `culture.data.tsx` for the same reason
 * `economy/barterProposals.paths.ts` does: `CommissionInterestPage` is a LIVE
 * page, and importing the taxonomy from the fixture file would pull the demo
 * mocks (club picks, showcase, radio, the whole curated board) into a live
 * chunk. `culture.data.tsx` re-exports both symbols, so the demo-mode callers
 * that already import them from there are untouched.
 */
export type CommissionCat = "Photo" | "Music" | "Writing" | "Design" | "Film";

/** Every category, in the order the picker offers them. A `const` tuple so the
 *  first entry types as a concrete category and can be the picker's default. */
export const COMMISSION_CATS = [
  "Photo",
  "Music",
  "Writing",
  "Design",
  "Film",
] as const satisfies readonly CommissionCat[];

/** i18n Pattern A — label-key indirection. `cat` is the canonical id (also
 * the shape the backend's `CreateCommissionInterestDto.commissionCategory`
 * expects, see `api/culture.api.ts`); this map resolves its display label. */
export const COMMISSION_CAT_LABEL_KEY: Record<CommissionCat, string> = {
  Photo: "culture:commissions.cat.photo",
  Music: "culture:commissions.cat.music",
  Writing: "culture:commissions.cat.writing",
  Design: "culture:commissions.cat.design",
  Film: "culture:commissions.cat.film",
};
