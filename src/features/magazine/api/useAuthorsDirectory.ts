import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { routes } from "../../../app/routeMap";
import { getAuthors } from "./magazine.api";

export interface AuthorDirectoryItem {
  slug: string;
  /** Full name, kept as `ReactNode` since the demo `AUTHORS` registry embeds
   *  a coral `<em>` split in the surname (see `authorContent.data.tsx`). */
  name: ReactNode;
  /** Plain-text seed for `Avatar`'s initials/alt — the demo `name` field
   *  above isn't always plain text, so this stays separate. */
  initialsSeed: string;
  subtitle: string;
  avatarUrl: string | null;
  /** CON-11 — the member profile behind this byline, when there is one. */
  memberSlug: string | null;
  /** Published pieces carrying this byline. */
  pieceCount: number;
}

/**
 * CNT-9 — the magazine authors directory (`AuthorsDirectoryPage`), the
 * missing "browse all writers" index the audit flagged: before this, the
 * only way to reach an author page live was guessing their slug in the URL.
 * Demo mode lists the curated `AUTHORS` registry `AuthorPage.tsx` already
 * uses; live mode calls the real `GET /magazine/authors`.
 *
 * CON-11 added `memberSlug`/`pieceCount`, which turns the directory from a
 * list of strings into a list of people and gives `AuthorLink` one cached
 * lookup to resolve every byline on a page against (see `useBylineTarget`).
 */
export function useAuthorsDirectory() {
  const { demoMode } = useDemoMode();
  const query = useQuery<AuthorDirectoryItem[]>({
    queryKey: ["magazine-authors-directory", demoMode],
    // The byline set changes when a piece publishes, which is rare, and every
    // byline on a page reads this one entry. Keep it warm rather than
    // refetching per article view.
    staleTime: 5 * 60_000,
    queryFn: async () => {
      if (demoMode) {
        const [{ AUTHORS }, { getMember }] = await Promise.all([
          import("../authorContent.data"),
          import("../../members/data/members"),
        ]);
        return Object.values(AUTHORS).map((author) => ({
          slug: author.slug,
          name: author.name,
          initialsSeed: author.firstName,
          subtitle: author.role,
          avatarUrl: author.portrait,
          // The curated registry uses the member slug as the author slug for
          // the writers who are also members, so this is a real lookup rather
          // than a guess (same test `resolveWriter` makes).
          memberSlug: getMember(author.slug) ? author.slug : null,
          pieceCount: author.articles.length,
        }));
      }
      const authors = await getAuthors();
      return authors.map((author) => ({
        slug: author.slug,
        name: author.name,
        initialsSeed: author.name,
        subtitle: author.bio ?? "",
        avatarUrl: author.avatarUrl,
        memberSlug: author.memberSlug,
        pieceCount: author.pieceCount,
      }));
    },
  });
  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

/** Where a byline name should link, and the member slug behind it. */
export interface BylineTarget {
  to: string;
  /** Set only when the byline is a real member account. */
  memberSlug?: string;
}

/**
 * CON-11 — resolve a byline NAME to its destination in live mode.
 *
 * A linked byline goes to the member's profile; an unlinked one falls back to
 * the magazine author page; an unknown name returns `null` so the byline stays
 * plain text (a photographer credited by name only). Reads the already-cached
 * authors directory rather than firing a lookup per byline, so a page full of
 * bylines costs one request.
 */
export function useBylineTarget(name: string): BylineTarget | null {
  const { items } = useAuthorsDirectory();
  const key = name.trim().toLowerCase();
  if (key.length === 0) return null;
  const match = items.find(
    (author) => author.initialsSeed.trim().toLowerCase() === key,
  );
  if (!match) return null;
  return match.memberSlug
    ? {
        to: `${routes.members}/${match.memberSlug}`,
        memberSlug: match.memberSlug,
      }
    : { to: `${routes.author}/${match.slug}` };
}
