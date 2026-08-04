import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getAdminDecks } from "./magazine.api";

export interface EditorDeckRow {
  id: string;
  slug: string;
  /** The mock registry stores rich titles (`<br/>`/`<em>`); live titles are plain strings. */
  title: ReactNode;
  section: string;
  status: "draft" | "published";
}

/**
 * Editor dashboard's "Decks" section list. Demo mode reads the code-split
 * mock registry (dynamically imported so it never ships in the live
 * bundle) — the mock has no `publishedAt` field and no server id, so every
 * mock deck is treated as published, keyed by its own `id` (which also
 * serves as the deck's slug in demo mode). Live mode calls
 * GET /magazine/admin/decks and derives status from `publishedAt`
 * presence.
 */
export function useEditorDecks() {
  const { demoMode } = useDemoMode();
  const query = useQuery<EditorDeckRow[]>({
    queryKey: ["magazine-admin-decks", demoMode],
    queryFn: async () => {
      if (demoMode) {
        const { decks } = await import("../data/decks.mock");
        return Object.values(decks).map((deck) => ({
          id: deck.id,
          slug: deck.id,
          title: deck.title,
          section: deck.section,
          status: "published" as const,
        }));
      }

      const rows = await getAdminDecks();
      return rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        section: row.section,
        status: row.publishedAt ? ("published" as const) : ("draft" as const),
      }));
    },
  });

  return { decks: query.data ?? [], isLoading: query.isLoading };
}
