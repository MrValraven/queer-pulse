import { apiGet, apiGetNullable } from "../../../shared/api/client";
import type { CropRect } from "../../../shared/components/ui/cropGeometry";
import type { AuthorSummaryDTO, IssueDTO } from "./magazine.api";

/**
 * One slot on the magazine front, resolved from the current issue's run order
 * to the published article behind it. Mirrors the backend
 * `MagazineFrontEntry` (`magazine-front.service.ts`).
 */
export interface MagazineFrontEntryDto {
  slug: string;
  title: string;
  dek: string;
  /** The article's own kicker. `''` when the desk never wrote one. */
  kicker: string;
  standfirst: string;
  author: AuthorSummaryDTO;
  /** The desk section this piece runs under ("Features", "Last word", …). */
  section: string;
  /** The editor's own line about this piece. `''` when none was written. */
  blurb: string;
  readMinutes: number;
  /** CON-04 — the piece's own lead art, falling back to its social-share
   *  image when the desk set only that. `null` when it has neither, and the
   *  slot keeps its tinted placeholder. */
  imageUrl: string | null;
  /** CON-04 — the reframe crop saved for `imageUrl`. Rendered as `ImageSlot`'s
   *  `focus` (a focal point): both slots that show it, the full-bleed lead and
   *  a rail card's cover strip, have a box aspect that never matches an
   *  arbitrary crop, so the exact-frame `crop` prop would distort the art. */
  imageCrop?: CropRect;
  publishedAt: string | null;
}

/** Consecutive run-order slots sharing one desk section. */
export interface MagazineFrontSectionDto {
  /** `''` when the pieces carry no section — the front heads that group. */
  name: string;
  entries: MagazineFrontEntryDto[];
}

/** `GET /magazine/front`. */
export interface MagazineFrontDto {
  issue: IssueDTO | null;
  lead: MagazineFrontEntryDto | null;
  sections: MagazineFrontSectionDto[];
}

/**
 * The editor-arranged front (CON-13). Its own module rather than a line in
 * `magazine.api.ts`, on the `issueContents.api.ts` precedent: these are the
 * public reads that source from the desk's issue-production data, and they
 * have their own controller on the backend for the same reason.
 *
 * `issue`/`lead` are null and `sections` empty until an issue has actually
 * shipped with a run order, so the caller keeps its honest empty state.
 */
export const getMagazineFront = () =>
  apiGet<MagazineFrontDto>("/magazine/front");

/**
 * `GET /magazine/current-issue` — the issue the masthead names. Deliberately
 * NOT the desk's `GET /magazine/admin/issues/current` (`pieces.api.ts`),
 * which is behind the `magazine_editor` staff role and 403s for a reader.
 *
 * `null` before any issue has shipped, so `apiGetNullable`.
 */
export const getPublishedCurrentIssue = () =>
  apiGetNullable<IssueDTO>("/magazine/current-issue");
