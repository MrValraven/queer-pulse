/**
 * Demo-mode store for the private per-connection note.
 *
 * Live mode persists a note through `PUT /connections/:id/note`. Demo mode has
 * no server and no connection ids, so notes are held in memory keyed by member
 * slug and published to subscribers, which keeps the editor behaving exactly
 * like the live one (write it, leave the tab, come back, it is still there)
 * without a provider or a fake API.
 */
const notesBySlug = new Map<string, string>();
const listeners = new Set<() => void>();

export function getDemoConnectionNote(slug: string): string {
  return notesBySlug.get(slug) ?? "";
}

export function setDemoConnectionNote(slug: string, body: string): void {
  const trimmed = body.trim();
  if (trimmed) {
    notesBySlug.set(slug, trimmed);
  } else {
    notesBySlug.delete(slug);
  }
  for (const listener of listeners) listener();
}

export function subscribeDemoConnectionNotes(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
