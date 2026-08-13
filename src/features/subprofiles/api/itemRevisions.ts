/**
 * Wire + demo-overlay types for saved revision history on persona portfolio
 * items ("Protect Your Work"). `ItemRevisionSummary` / `ItemRevisionDetail`
 * mirror the backend's hand-written revision DTOs verbatim, so the live branch
 * in `useItemRevisions.ts` and this demo overlay resolve to identical shapes.
 */

/** One row in the revision list (newest first). No snapshot body here, that is
 *  a separate detail fetch, matching the live `GET .../revisions` endpoint. */
export interface ItemRevisionSummary {
  id: string;
  createdAt: string;
  title: string | null;
}

/** A single revision's full saved content, fetched on demand when a member
 *  taps "View" in the history list. */
export interface ItemRevisionDetail {
  id: string;
  createdAt: string;
  snapshot: Record<string, unknown>;
}

// ── DEMO overlay ─────────────────────────────────────────────────────────────
// Demo items are static fixtures re-derived from `subprofiles.data.ts` on
// every read (see `useSubprofile`'s demo branch), so there is no server-side
// row to snapshot into on save the way the live backend does. This module is
// a client-side stand-in for that: an in-memory Map keyed by itemId, seeded
// below with a couple of illustrative past versions so the History UI has
// real content to show in demo mode, and appended to at runtime by
// `recordDemoRevision`.
//
// Deliberately NOT persisted to localStorage the way `conversationPrefs.ts`
// is: revision history here is illustrative, not a feature demo mode needs to
// actually round-trip (see `useRestoreItemRevision`'s demo-restore limitation
// note in `useItemRevisions.ts`), so an in-memory Map that resets on reload is
// an acceptable fidelity gap.

const MAX_REVISIONS_PER_ITEM = 30;

const demoRevisions = new Map<string, ItemRevisionDetail[]>();

function generateRevisionId(): string {
  return `rev-${crypto.randomUUID()}`;
}

function titleFromSnapshot(snapshot: Record<string, unknown>): string | null {
  const title = snapshot.title;
  return typeof title === "string" ? title : null;
}

/** Newest-first summaries for one item's saved revisions. */
export function listDemoRevisions(itemId: string): ItemRevisionSummary[] {
  const revisions = demoRevisions.get(itemId) ?? [];
  return revisions.map((revision) => ({
    id: revision.id,
    createdAt: revision.createdAt,
    title: titleFromSnapshot(revision.snapshot),
  }));
}

/** One revision's full snapshot, for the "View" read-only preview. */
export function getDemoRevision(
  itemId: string,
  revisionId: string,
): ItemRevisionDetail | undefined {
  return demoRevisions
    .get(itemId)
    ?.find((revision) => revision.id === revisionId);
}

/** Prepend a new revision (the content an editor save is about to replace) to
 *  an item's history, newest first, capped at `MAX_REVISIONS_PER_ITEM`
 *  (oldest dropped first). The id and timestamp are generated here, at
 *  call-time, never at module load. */
export function recordDemoRevision(
  itemId: string,
  snapshot: Record<string, unknown>,
): void {
  const existing = demoRevisions.get(itemId) ?? [];
  const revision: ItemRevisionDetail = {
    id: generateRevisionId(),
    createdAt: new Date().toISOString(),
    snapshot,
  };
  demoRevisions.set(
    itemId,
    [revision, ...existing].slice(0, MAX_REVISIONS_PER_ITEM),
  );
}

/**
 * Demo "restore": looks up the target revision and, if found, records it
 * again as a fresh top-of-history entry (mirroring the live backend, which
 * snapshots on every save including a restore-triggered one) so the history
 * list reflects that a restore happened. Returns the restored snapshot so the
 * caller can resolve the mutation successfully and show a "restored" toast.
 * See `useRestoreItemRevision` for why this does NOT rewrite the item content
 * shown elsewhere in the demo UI.
 */
export function restoreDemoRevisionSnapshot(
  itemId: string,
  revisionId: string,
): Record<string, unknown> | undefined {
  const revision = getDemoRevision(itemId, revisionId);
  if (!revision) return undefined;
  recordDemoRevision(itemId, revision.snapshot);
  return revision.snapshot;
}

// ── Seed data ────────────────────────────────────────────────────────────────
// Illustrative past versions for two items belonging to the writer/poet demo
// persona (tagline "Poems & translations on migration and belonging", see
// `data/subprofiles.data.ts`). NOTE: that fixture persona currently files its
// pieces under the "publications" section rather than a "poems" section (no
// demo persona is seeded with kind "poet"/section "poems" yet), so these are
// the closest well-known "poem-ish" items available; the History UI works
// identically regardless of section since it keys purely on itemId. Ids are
// stable so the seed reproduces on every module load / HMR; timestamps are
// fixed, older ISO strings (never `new Date()` at module scope) so they read
// as a plausible edit history relative to each item's own `createdAt`.
const SEED_REVISIONS: Record<string, ItemRevisionDetail[]> = {
  "itm-publications-salt-lines": [
    {
      id: "rev-seed-salt-lines-2",
      createdAt: "2025-01-20T09:15:00.000Z",
      snapshot: {
        title: "Salt Lines",
        subtitle: "Tinta Permanente (working title: Low Tide)",
        description: "A chapbook on leaving, not yet on being left.",
      },
    },
    {
      id: "rev-seed-salt-lines-1",
      createdAt: "2024-11-03T14:40:00.000Z",
      snapshot: {
        title: "Low Tide",
        subtitle: "Tinta Permanente",
        description: "Early drafts of what became Salt Lines.",
      },
    },
  ],
  "itm-publications-two-tongues-anthology": [
    {
      id: "rev-seed-two-tongues-1",
      createdAt: "2025-01-05T11:00:00.000Z",
      snapshot: {
        title: "Two Tongues (anthology)",
        subtitle: "Migrant Voices Press (forthcoming)",
        description: null,
      },
    },
  ],
};

for (const [itemId, revisions] of Object.entries(SEED_REVISIONS)) {
  demoRevisions.set(itemId, revisions);
}
