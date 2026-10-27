import { useMemo, useSyncExternalStore } from "react";
import type { StudioSidePanelView } from "./studioPlayerSurface";

/** Device-only: whether the docked side panel is open, and on which view. */
export const STUDIO_SIDE_PANEL_STORAGE_KEY = "qp.studio.sidePanel.v1";

export interface StudioSidePanelPreference {
  isOpen: boolean;
  view: StudioSidePanelView;
}

/** A member who never chose sees Now playing docked and open. */
export const DEFAULT_STUDIO_SIDE_PANEL_PREFERENCE: StudioSidePanelPreference = {
  isOpen: true,
  view: "nowPlaying",
};

const SIDE_PANEL_VIEWS: readonly StudioSidePanelView[] = [
  "nowPlaying",
  "queue",
];

function isSidePanelView(value: unknown): value is StudioSidePanelView {
  return SIDE_PANEL_VIEWS.includes(value as StudioSidePanelView);
}

/** Reads a stored value, falling back to the default on anything unknown. */
export function parseStudioSidePanelPreference(
  raw: string | null,
): StudioSidePanelPreference {
  if (raw === null) return DEFAULT_STUDIO_SIDE_PANEL_PREFERENCE;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null)
      return DEFAULT_STUDIO_SIDE_PANEL_PREFERENCE;
    const { isOpen, view } = parsed as Record<string, unknown>;
    if (typeof isOpen !== "boolean" || !isSidePanelView(view))
      return DEFAULT_STUDIO_SIDE_PANEL_PREFERENCE;
    return { isOpen, view };
  } catch {
    return DEFAULT_STUDIO_SIDE_PANEL_PREFERENCE;
  }
}

const listeners = new Set<() => void>();

function readStoredRaw(): string | null {
  try {
    return window.localStorage.getItem(STUDIO_SIDE_PANEL_STORAGE_KEY);
  } catch {
    // Private mode or blocked storage: the default holds.
    return null;
  }
}

/** The stored string, read once; the hook parses it, so the snapshot stays a
 *  primitive and useSyncExternalStore sees a stable value. */
let currentRaw: string | null =
  typeof window === "undefined" ? null : readStoredRaw();

function notifyListeners(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Another tab changing its panel changes this one too.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STUDIO_SIDE_PANEL_STORAGE_KEY && event.key !== null)
      return;
    currentRaw = event.key === null ? null : event.newValue;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function readRaw(): string | null {
  return currentRaw;
}

function readRawOnServer(): string | null {
  return null;
}

/** Saves the docked panel's state for this device. */
export function writeStudioSidePanelPreference(
  next: StudioSidePanelPreference,
): void {
  currentRaw = JSON.stringify({ isOpen: next.isOpen, view: next.view });
  try {
    window.localStorage.setItem(STUDIO_SIDE_PANEL_STORAGE_KEY, currentRaw);
  } catch {
    // Storage refused: the choice still holds for this visit.
  }
  notifyListeners();
}

/** The docked side panel's saved state, shared by every reader. */
export function useStudioSidePanelPreference(): StudioSidePanelPreference {
  const raw = useSyncExternalStore(subscribe, readRaw, readRawOnServer);
  return useMemo(() => parseStudioSidePanelPreference(raw), [raw]);
}
