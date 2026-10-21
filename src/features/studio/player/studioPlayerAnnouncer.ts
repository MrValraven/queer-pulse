/** The latest line, with a count so the same line said twice ("Volume
 *  50%" after a round trip) is read again: a new count remounts the span. */
export interface StudioPlayerAnnouncement {
  message: string;
  count: number;
}

export const SILENT_ANNOUNCEMENT: StudioPlayerAnnouncement = {
  message: "",
  count: 0,
};
let currentAnnouncement = SILENT_ANNOUNCEMENT;
const announcementListeners = new Set<() => void>();

export function subscribeAnnouncements(listener: () => void): () => void {
  announcementListeners.add(listener);
  return () => announcementListeners.delete(listener);
}

export function readAnnouncement(): StudioPlayerAnnouncement {
  return currentAnnouncement;
}

/** A held arrow or a run of Next presses says only where it settled. */
const ANNOUNCE_SETTLE_MS = 300;
let pendingTimerId: ReturnType<typeof setTimeout> | null = null;

function publish(announcement: StudioPlayerAnnouncement) {
  currentAnnouncement = announcement;
  announcementListeners.forEach((listener) => listener());
}

/** DES-20: one polite line for the player, for the track that starts and
 *  for what a shortcut changed. Lines that arrive in quick succession
 *  collapse into the last one, read once they stop for 300ms. Nothing is
 *  recorded. */
export function announceStudioPlayer(message: string): void {
  if (!message) return;
  if (pendingTimerId !== null) clearTimeout(pendingTimerId);
  pendingTimerId = setTimeout(() => {
    pendingTimerId = null;
    publish({ message, count: currentAnnouncement.count + 1 });
  }, ANNOUNCE_SETTLE_MS);
}

/** A stop or sign-out: the last line leaves the page too, so the next
 *  person at a shared device finds nothing of it. */
export function clearStudioPlayerAnnouncement(): void {
  if (pendingTimerId !== null) clearTimeout(pendingTimerId);
  pendingTimerId = null;
  if (currentAnnouncement.message === "") return;
  publish({ message: "", count: currentAnnouncement.count + 1 });
}
