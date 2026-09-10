import { useSyncExternalStore } from "react";

/**
 * Per-conversation chat wallpaper — the ground tint behind the message log and
 * whether the doodle pattern rides on top of it.
 *
 * Why its own store rather than `conversationPrefs`: that module is the DEMO
 * fallback for pin/favorite/mute, and `clearConversationPrefs()` wipes it
 * whenever demo mode flips. A wallpaper kept there would be inert in live mode
 * and would evaporate on a mode switch. Wallpaper is a display preference with
 * no server side at all, so it lives here and behaves identically in both
 * modes.
 *
 * Why device-local: the pick never leaves this browser, which is also how
 * WhatsApp treats its own wallpaper. Nothing here is member content, so unlike
 * `outbox.ts`/`drafts.ts` the key is NOT scoped per member — the worst case on
 * a shared device is that the next person sees a ground tint someone else
 * chose, and a cosmetic carry-over is not worth threading `useStorageScope`
 * through the header. If this ever needs to follow a member across devices it
 * becomes one JSON column on member settings and this module becomes its
 * cache; the UI would not change.
 *
 * Shape follows `skipLinkPref.ts`: a module-level store read once, persisted on
 * write, and subscribed to via `useSyncExternalStore` so the picker and the
 * panel it repaints stay in step with no context to mount.
 */

const STORAGE_KEY = "qp.messages.wallpaper.v1";

/** The selectable grounds. `default` is the untinted page ground, which is what
 *  every chat looked like before wallpapers existed. Each of the others is a
 *  low-alpha wash of an existing brand token (see chat-wallpaper.css) rather
 *  than a new colour. */
export const WALLPAPER_GROUNDS = [
  "default",
  "lilac",
  "jade",
  "coral",
  "amber",
  "rose",
] as const;

export type WallpaperGround = (typeof WALLPAPER_GROUNDS)[number];

export interface WallpaperChoice {
  ground: WallpaperGround;
  /** Whether the doodle tile is masked over the ground. */
  hasDoodles: boolean;
}

/** Doodles on the plain ground — the look every chat opens with until someone
 *  picks otherwise. */
export const DEFAULT_WALLPAPER: WallpaperChoice = {
  ground: "default",
  hasDoodles: true,
};

interface WallpaperStore {
  /** Applies to every conversation without its own entry. */
  base: WallpaperChoice;
  byConversation: Record<string, WallpaperChoice>;
}

const EMPTY_STORE: WallpaperStore = {
  base: DEFAULT_WALLPAPER,
  byConversation: {},
};

function isGround(value: unknown): value is WallpaperGround {
  return (
    typeof value === "string" &&
    (WALLPAPER_GROUNDS as readonly string[]).includes(value)
  );
}

function isChoice(value: unknown): value is WallpaperChoice {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    isGround(candidate.ground) && typeof candidate.hasDoodles === "boolean"
  );
}

/** Read the persisted store, tolerating an absent, corrupt or foreign payload.
 *  Unknown grounds (a value written by a later build, then rolled back) are
 *  dropped rather than allowed to render as an empty `data-` attribute. */
function read(): WallpaperStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STORE;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return EMPTY_STORE;
    const candidate = parsed as Record<string, unknown>;
    const byConversation: Record<string, WallpaperChoice> = {};
    if (
      candidate.byConversation &&
      typeof candidate.byConversation === "object"
    ) {
      for (const [conversationId, choice] of Object.entries(
        candidate.byConversation as Record<string, unknown>,
      )) {
        if (isChoice(choice)) byConversation[conversationId] = choice;
      }
    }
    return {
      base: isChoice(candidate.base) ? candidate.base : DEFAULT_WALLPAPER,
      byConversation,
    };
  } catch {
    // ignore — private mode / corrupt value falls through to the default
    return EMPTY_STORE;
  }
}

let current: WallpaperStore = read();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function persist(next: WallpaperStore) {
  current = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore — keep working in-memory
  }
  emit();
}

function isSameChoice(a: WallpaperChoice, b: WallpaperChoice): boolean {
  return a.ground === b.ground && a.hasDoodles === b.hasDoodles;
}

/** The wallpaper a given conversation renders with: its own pick, else the
 *  base one. */
export function resolveWallpaper(
  store: WallpaperStore,
  conversationId: string | undefined,
): WallpaperChoice {
  if (!conversationId) return store.base;
  return store.byConversation[conversationId] ?? store.base;
}

/** Set one conversation's wallpaper. Passing the base choice REMOVES the
 *  per-conversation entry instead of storing a duplicate of it, so a chat that
 *  matches the base keeps following it when the base later changes. */
export function setConversationWallpaper(
  conversationId: string,
  choice: WallpaperChoice,
): void {
  const byConversation = { ...current.byConversation };
  if (isSameChoice(choice, current.base)) {
    delete byConversation[conversationId];
  } else {
    byConversation[conversationId] = choice;
  }
  persist({ ...current, byConversation });
}

/** Set the wallpaper every chat without its own pick uses, and clear the
 *  per-conversation entries that only existed to say the same thing. */
export function setBaseWallpaper(choice: WallpaperChoice): void {
  const byConversation: Record<string, WallpaperChoice> = {};
  for (const [conversationId, entry] of Object.entries(
    current.byConversation,
  )) {
    if (!isSameChoice(entry, choice)) byConversation[conversationId] = entry;
  }
  persist({ base: choice, byConversation });
}

/** Drop one conversation's own pick so it follows the base again. */
export function clearConversationWallpaper(conversationId: string): void {
  if (!current.byConversation[conversationId]) return;
  const byConversation = { ...current.byConversation };
  delete byConversation[conversationId];
  persist({ ...current, byConversation });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => current;
/** Prerender has no localStorage — report the default store. Its identity is
 *  constant, which `useSyncExternalStore` requires of a server snapshot. */
const getServerSnapshot = () => EMPTY_STORE;

/** The whole store. Prefer `useWallpaper` unless you need the base choice too
 *  (the picker does, to show which swatch is inherited). */
export function useWallpaperStore(): WallpaperStore {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** The wallpaper one conversation should render with right now. */
export function useWallpaper(
  conversationId: string | undefined,
): WallpaperChoice {
  return resolveWallpaper(useWallpaperStore(), conversationId);
}

/** True when this conversation carries its own pick rather than the base. */
export function useHasOwnWallpaper(
  conversationId: string | undefined,
): boolean {
  const store = useWallpaperStore();
  return !!conversationId && !!store.byConversation[conversationId];
}

/** Test-only reset so suites don't leak the store between cases. */
export function resetWallpaperForTests(): void {
  current = EMPTY_STORE;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  emit();
}
