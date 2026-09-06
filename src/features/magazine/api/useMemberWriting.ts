import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getArticles,
  getAuthorForMember,
  type ArticleListItemDTO,
  type AuthorDTO,
} from "./magazine.api";
import { ignoreEnrichmentError } from "./loadErrors";
import { useReaderLanguage } from "./useReaderLanguage";

export interface MemberWriting {
  author: AuthorDTO;
  articles: ArticleListItemDTO[];
}

/**
 * CON-11 — a member's published magazine pieces, for the "Writing" surface on
 * their profile.
 *
 * A writer used to file a commissioned piece, watch it publish, and get
 * nothing back on their own profile: the byline was decoupled from their
 * account entirely. This resolves the byline behind a member
 * (`GET /magazine/authors/by-member/:slug`, nullable for the many members who
 * have never written) and then their published pieces.
 *
 * Demo mode never calls it: the demo profile personas have no live bylines,
 * and reading the curated magazine registry for a member would be exactly the
 * mock leak the live path must avoid.
 */
export function useMemberWriting(memberSlug: string | undefined) {
  const { demoMode } = useDemoMode();
  // PRD-110 — the same language every other magazine list sends, so a member
  // profile does not advertise a byline's work in a language the reader did
  // not ask for. In the query key because it changes which rows come back.
  const readerLanguage = useReaderLanguage();

  const query = useQuery<MemberWriting | null>({
    queryKey: ["magazine-member-writing", demoMode, memberSlug, readerLanguage],
    enabled: !demoMode && Boolean(memberSlug),
    queryFn: async () => {
      if (demoMode || !memberSlug) return null;
      const author = await getAuthorForMember(memberSlug);
      if (!author) return null;
      // The byline is the surface; its piece list only fills it in, so a
      // failed article fetch degrades to an empty list rather than an error.
      // PRD-103: this is page one only, and deliberately so. The section is a
      // taste of the member's work, not their archive, and its "all pieces"
      // route is the author-filtered search the author page's CTA uses.
      const page = await getArticles({
        author: author.slug,
        lang: readerLanguage,
      }).catch(ignoreEnrichmentError);
      return { author, articles: page?.items ?? [] };
    },
  });
  return {
    writing: query.data ?? null,
    isLoading: query.isLoading && !demoMode && Boolean(memberSlug),
    // Surfaced so a caller can tell "this member has no byline" (the common,
    // legitimate case this section hides on) from "the byline lookup failed".
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
