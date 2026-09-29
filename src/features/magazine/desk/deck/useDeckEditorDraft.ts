import { useEffect, useRef, useState } from "react";
import { emptyDraft, type DeckDraft } from "../../deckDraft";
import { draftsEqual } from "../../deckEditorLoad";
import { useAdminDeck } from "../../api/useAdminDeck";

/**
 * The deck editor's draft state: the working draft, the snapshot the server
 * last confirmed, and the publish state, seeded once per deck from
 * `useAdminDeck`. Split from `DeckEditorPage` to keep that component under the
 * 200-line cap; the page still owns every write.
 *
 * Seeding runs once per id (`"new"` for a never-saved draft), so a refetch
 * after a save or a publish never overwrites what the editor is typing.
 * `markSeeded` lets the page claim a freshly created id as already seeded
 * before the URL moves to it.
 */
export function useDeckEditorDraft(id: string | null) {
  const deckQuery = useAdminDeck(id);
  const [draft, setDraft] = useState<DeckDraft>(emptyDraft());
  const [lastSaved, setLastSaved] = useState<DeckDraft>(emptyDraft());
  const [published, setPublished] = useState(false);
  // A FUTURE instant means scheduled rather than live (PRD-131).
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const seededForRef = useRef<string | null>(null);

  useEffect(() => {
    if (!deckQuery.data) return;
    const seedKey = id ?? "new";
    if (seededForRef.current === seedKey) return;
    seededForRef.current = seedKey;
    setDraft(deckQuery.data.draft);
    setLastSaved(deckQuery.data.draft);
    setPublished(deckQuery.data.published);
    setPublishedAt(deckQuery.data.publishedAt);
  }, [deckQuery.data, id]);

  /** The deck's `publishedAt` after an explicit publish, schedule or
   *  unpublish; `null` means it is back to draft. */
  function applyPublishedAt(nextPublishedAt: string | null): void {
    setPublishedAt(nextPublishedAt);
    setPublished(nextPublishedAt !== null);
  }

  function markSeeded(seedKey: string): void {
    seededForRef.current = seedKey;
  }

  return {
    draft,
    setDraft,
    lastSaved,
    setLastSaved,
    isDirty: !draftsEqual(draft, lastSaved),
    published,
    publishedAt,
    applyPublishedAt,
    markSeeded,
  };
}
