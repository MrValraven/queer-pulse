import type { ArticleBlock } from "../../api/pieces.api";

/** Everything the autosave debounce watches. `blocks`/`tags` are always
 * REPLACED wholesale by every editing op (see `useArticleBlockOps`), so
 * reference equality is enough to detect a real change — mirrors
 * `DeckEditorPage`'s own `draftsEqual`. */
export interface DraftSnapshot {
  /** Plain text by contract (see `plainText.ts`). */
  title: string;
  /** Plain text by contract (see `plainText.ts`). */
  standfirst: string;
  blocks: ArticleBlock[];
  section: string;
  tags: string[];
  role: string;
  metaDescription: string;
  socialImage: string;
  canonicalUrl: string;
}

export function snapshotsEqual(a: DraftSnapshot, b: DraftSnapshot): boolean {
  return (
    a.title === b.title &&
    a.standfirst === b.standfirst &&
    a.blocks === b.blocks &&
    a.section === b.section &&
    a.tags === b.tags &&
    a.role === b.role &&
    a.metaDescription === b.metaDescription &&
    a.socialImage === b.socialImage &&
    a.canonicalUrl === b.canonicalUrl
  );
}
