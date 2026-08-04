import { useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { useUnsavedChangesGuard } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { emptyDraft, deckDtoToDraft, type DeckDraft } from "./deckDraft";
import { DeckMetaForm } from "./DeckMetaForm";
import { DeckSlidesEditor } from "./DeckSlidesEditor";
import { DeckEditorPreview } from "./DeckEditorPreview";
import { DeckEditorActions } from "./DeckEditorActions";
import { getAdminDeck } from "./api/magazine.api";
import styles from "./DeckEditorPage.module.css";

interface DeckLoad {
  draft: DeckDraft;
  published: boolean;
}

/** A `Slide`'s text-ish fields (and the mock deck registry's `title`) are
 *  typed `ReactNode` because the reader renders `<em>` emphasis, but the
 *  editor only ever needs a plain string to seed a controlled input —
 *  mirrors `SlideEditorCard`'s `asText`. */
function asPlainText(value: ReactNode): string {
  return typeof value === "string" ? value : "";
}

/** Demo-only load: the mock deck registry, keyed by id (dynamically
 *  imported so it never ships in the live bundle). Every mock deck is
 *  treated as already published, mirroring `useEditorDecks`. */
async function loadMockDraft(id: string): Promise<DeckLoad | null> {
  const { decks } = await import("./data/decks.mock");
  const deck = decks[id];
  if (!deck) return null;
  return {
    published: true,
    draft: {
      slug: deck.id,
      title: asPlainText(deck.title),
      kicker: deck.kicker,
      section: deck.section,
      byline: deck.byline,
      role: deck.role ?? "",
      authorBio: deck.authorBio,
      cover: deck.cover,
      coverDesc: deck.coverDesc,
      readTime: deck.readTime,
      tags: deck.tags,
      related: deck.related,
      slides: deck.slides,
    },
  };
}

/** Every field the mutation forms can produce is a fresh string/array/object
 *  on edit, so reference equality per field is enough to detect a real
 *  change — and unlike `JSON.stringify`, it can't choke on a demo deck's
 *  still-unedited `ReactNode` slide fields (which may carry dev-only
 *  circular internals React attaches to elements). */
function draftsEqual(a: DeckDraft, b: DeckDraft): boolean {
  return (
    a.slug === b.slug &&
    a.title === b.title &&
    a.kicker === b.kicker &&
    a.section === b.section &&
    a.byline === b.byline &&
    a.role === b.role &&
    a.authorBio === b.authorBio &&
    a.cover === b.cover &&
    a.coverDesc === b.coverDesc &&
    a.readTime === b.readTime &&
    a.tags === b.tags &&
    a.related === b.related &&
    a.slides === b.slides
  );
}

export function DeckEditorPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const deckQuery = useQuery<DeckLoad>({
    queryKey: ["magazine-admin-deck", demoMode, id],
    queryFn: async () => {
      if (!id) return { draft: emptyDraft(), published: false };
      if (demoMode) {
        return (await loadMockDraft(id)) ?? { draft: emptyDraft(), published: false };
      }
      const dto = await getAdminDeck(id);
      return { draft: deckDtoToDraft(dto), published: Boolean(dto.publishedAt) };
    },
  });

  const [draft, setDraft] = useState<DeckDraft>(emptyDraft());
  const [lastSaved, setLastSaved] = useState<DeckDraft>(emptyDraft());
  const [published, setPublished] = useState(false);
  // The id the create mutation just returned — fills the gap between a
  // successful create and the URL actually landing on `?id=<id>` (the
  // navigate below is deferred by a render so it can't out-race the unsaved
  // guard's own effect; see the comment on `pendingNavigateTo`).
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [pendingNavigateTo, setPendingNavigateTo] = useState<string | null>(null);
  const seededForRef = useRef<string | null>(null);
  const effectiveId = id ?? createdId;

  useEffect(() => {
    if (!deckQuery.data) return;
    const seedKey = id ?? "new";
    if (seededForRef.current === seedKey) return;
    seededForRef.current = seedKey;
    setDraft(deckQuery.data.draft);
    setLastSaved(deckQuery.data.draft);
    setPublished(deckQuery.data.published);
  }, [deckQuery.data, id]);

  const dirty = !draftsEqual(draft, lastSaved);

  // Armed only while there are real unsaved edits. `pendingNavigateTo` below
  // relies on this effect re-running (and uninstalling its history-navigator
  // patch) before the deferred `navigate()` fires, so a save-then-navigate
  // never throws up a stale "leave without saving?" prompt.
  useUnsavedChangesGuard({
    active: dirty,
    confirmMessage: t("magazine:deck.editor.leaveConfirm"),
  });

  // Deferred by a render on purpose: firing `navigate()` in the same tick as
  // the `setLastSaved` that clears `dirty` would still hit the guard's
  // currently-installed (stale) confirm wrapper, since its effect hasn't had
  // a chance to re-run yet. Waiting for this effect guarantees it has.
  useEffect(() => {
    if (!pendingNavigateTo) return;
    void navigate(pendingNavigateTo, { replace: true });
    // One-shot: clears the trigger once this deferred navigation has fired,
    // deliberately from inside the effect it fires from (see comment above).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPendingNavigateTo(null);
  }, [pendingNavigateTo, navigate]);

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.editorHead}>
          <h1>
            {effectiveId
              ? t("magazine:deck.editor.editTitle")
              : t("magazine:deck.editor.newTitle")}
          </h1>
          <Button variant="ghost" to={routes.magazineEditor}>
            {t("magazine:deck.editor.backToDashboard")}
          </Button>
        </div>

        <div className={styles.editorGrid}>
          <div className={styles.pane}>
            <DeckMetaForm
              draft={draft}
              onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
            />
            <DeckSlidesEditor
              slides={draft.slides}
              onChange={(slides) => setDraft((d) => ({ ...d, slides }))}
            />
          </div>

          <div className={`${styles.pane} ${styles.preview}`}>
            <DeckEditorActions
              id={effectiveId}
              draft={draft}
              published={published}
              onCreated={(newId) => {
                setLastSaved(draft);
                setCreatedId(newId);
                seededForRef.current = newId;
                setPendingNavigateTo(`${routes.deckEditor}?id=${newId}`);
              }}
              onSaved={() => setLastSaved(draft)}
              onPublishedChange={setPublished}
              onDeleted={() => {
                setLastSaved(draft);
                setPendingNavigateTo(routes.magazineEditor);
              }}
            />
            <DeckEditorPreview draft={draft} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
