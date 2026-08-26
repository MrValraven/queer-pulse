import { apiGetNullable } from "../../../shared/api/client";

/** What kind of page an entry opens — mirrors backend `IssueContentsEntryKind`. */
export type IssueContentsEntryKind = "article" | "deck";

/** One line of the reader-facing "In this issue" panel. */
export interface IssueContentsEntryDto {
  title: string;
  /** The desk's one-line blurb, written on the issue-production page. */
  blurb: string;
  section: string;
  kind: IssueContentsEntryKind;
  slug: string;
}

/** GET /magazine/issues/:number/contents. */
export interface IssueContentsDto {
  number: string;
  title: string;
  publishedOn: string | null;
  /** In the desk's curated order. Empty when nothing is curated yet. */
  entries: IssueContentsEntryDto[];
}

/**
 * The issue's curated contents (CON-05). This is where the desk's issue-panel
 * curation lands now that the members' email digest is gone: same running
 * order, same hand-written blurbs, rendered on the issue's own page.
 *
 * Its own module rather than a line in `magazine.api.ts`: this is the only
 * public read that sources from the desk's issue-production data, and it has
 * its own controller on the backend for the same reason.
 */
export const getIssueContents = (number: string) =>
  apiGetNullable<IssueContentsDto>(
    `/magazine/issues/${encodeURIComponent(number)}/contents`,
  );
