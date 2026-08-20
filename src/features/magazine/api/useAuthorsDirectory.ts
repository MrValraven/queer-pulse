import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
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
}

/**
 * CNT-9 — the magazine authors directory (`AuthorsDirectoryPage`), the
 * missing "browse all writers" index the audit flagged: before this, the
 * only way to reach an author page live was guessing their slug in the URL.
 * Demo mode lists the curated `AUTHORS` registry `AuthorPage.tsx` already
 * uses; live mode calls the real `GET /magazine/authors`.
 */
export function useAuthorsDirectory() {
  const { demoMode } = useDemoMode();
  const query = useQuery<AuthorDirectoryItem[]>({
    queryKey: ["magazine-authors-directory", demoMode],
    queryFn: async () => {
      if (demoMode) {
        const { AUTHORS } = await import("../authorContent.data");
        return Object.values(AUTHORS).map((author) => ({
          slug: author.slug,
          name: author.name,
          initialsSeed: author.firstName,
          subtitle: author.role,
          avatarUrl: author.portrait,
        }));
      }
      const authors = await getAuthors();
      return authors.map((author) => ({
        slug: author.slug,
        name: author.name,
        initialsSeed: author.name,
        subtitle: author.bio ?? "",
        avatarUrl: author.avatarUrl,
      }));
    },
  });
  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
