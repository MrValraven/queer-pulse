import type { StudioPreviewLinkDTO } from "./studio.types";

// The demo's in-memory state for Notify me and preview links. It imports no
// fixture, so the mutation hooks can import it lazily in demo branches
// without pulling the Studio fixture into the live chunk.

/** Opens Mariana's draft "Cartas ao mar" (the owner view). */
export const DEMO_PREVIEW_TOKEN = "5eed".repeat(16);
/** A link minted before "Cidade dos santos" went live: it redirects. */
export const DEMO_PUBLISHED_PREVIEW_TOKEN = "feed".repeat(16);
/** NIGHTFORM's scheduled single, opened as a visitor (the demo viewer does
 *  not own NIGHTFORM). */
export const DEMO_VISITOR_PREVIEW_TOKEN = "beef".repeat(16);

const reminders = new Set<string>();
const linksByRelease = new Map<string, StudioPreviewLinkDTO>([
  [
    "demo-release-draft-cartas-ao-mar",
    { token: DEMO_PREVIEW_TOKEN, createdAt: "2026-10-09T09:30:00.000Z" },
  ],
  [
    "demo-release-cidade-dos-santos",
    {
      token: DEMO_PUBLISHED_PREVIEW_TOKEN,
      createdAt: "2026-04-01T09:30:00.000Z",
    },
  ],
  [
    "demo-release-scheduled-night-bus",
    {
      token: DEMO_VISITOR_PREVIEW_TOKEN,
      createdAt: "2026-10-11T18:00:00.000Z",
    },
  ],
]);

export function demoIsReminderSet(releaseId: string): boolean {
  return reminders.has(releaseId);
}

export function demoSetReminder(releaseId: string, isSet: boolean): void {
  if (isSet) reminders.add(releaseId);
  else reminders.delete(releaseId);
}

export function demoPreviewLinkFor(
  releaseId: string,
): StudioPreviewLinkDTO | null {
  return linksByRelease.get(releaseId) ?? null;
}

/** One link per release: a new one replaces the old. */
export function demoStorePreviewLink(
  releaseId: string,
  link: StudioPreviewLinkDTO,
): void {
  linksByRelease.set(releaseId, link);
}

export function demoRevokePreviewLink(releaseId: string): void {
  linksByRelease.delete(releaseId);
}

export function demoReleaseIdForToken(token: string): string | null {
  for (const [releaseId, link] of linksByRelease)
    if (link.token === token) return releaseId;
  return null;
}
