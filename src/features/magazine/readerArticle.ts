import type { Article } from "./data/articles";

/**
 * PRD-102 — the two editorial fields the desk writes on every piece that the
 * reader view-model never had a home for.
 *
 * `Article` grew out of the static prototype, where a headline and a body were
 * the whole record. The desk collects more than that: a `dek` (the one-line
 * summary that also feeds cards and the share description) and a `standfirst`
 * (the intro paragraph that sits under the headline in print and in the desk's
 * own reader preview). Both are served by `GET /magazine/articles/:slug`, and
 * both used to be dropped on the floor by the adapter: the dek survived only as
 * a stand-in first body paragraph on list rows, and the detail adapter then
 * overwrote `body` with the real text, losing it entirely.
 *
 * Both are optional: a demo mock has neither, and an editor may leave either
 * blank, in which case the reader renders nothing rather than an empty line.
 */
export interface ArticleEditorialFields {
  /** The desk's one-line summary. `undefined` when the editor left it blank. */
  dek?: string;
  /** The intro paragraph under the headline. Plain text by contract (see the
   *  desk's `plainText.ts`), so the reader renders it as text. */
  standfirst?: string;
}

/**
 * An `Article` as the reader surfaces receive it, editorial fields included.
 *
 * A plain `Article` (every demo mock) is assignable to this, so nothing that
 * already builds one needs to change. The long-term home for these two fields
 * is `Article` itself; they live here while `data/articles.tsx` stays the
 * prototype's own registry.
 */
export type ReaderArticle = Article & ArticleEditorialFields;
