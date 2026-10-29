import { useMemo, useSyncExternalStore } from "react";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { safeStorage } from "../../shared/storage/safeStorage";
import {
  STUDIO_GENRES,
  STUDIO_MOODS,
  type StudioGenre,
  type StudioMood,
} from "./api/studio.types";
import {
  useStudioWelcomeAccount,
  type StudioWelcomeReadState,
} from "./api/useStudioWelcome";
import { areStudioListeningMemoryWritesStopped } from "./player/studioListeningMemory";
import {
  STUDIO_TASTE_STORAGE_KEY,
  STUDIO_WELCOME_SEEN_STORAGE_KEY,
} from "./studioFirstRunConstants";

/**
 * The genres and moods a member picked in the Studio welcome (PRD-12). They
 * move the matching genre and mood tiles to the front of Studio home. In live
 * mode they live on the member's account (GET and PUT /me/studio-welcome,
 * next to the seen flag), so a welcome closed on a phone stays closed on a
 * computer. The localStorage records below are the demo's copy (the demo has
 * no server) and the older device copy of a live member, which is uploaded
 * once and then removed (see useStudioWelcomeMigration). Each record is
 * tagged with the member it belongs to. Every listening-memory wipe (Quick
 * Exit, sign-out, loss of Studio access) removes the picks record from this
 * device and never touches the account. Whether the welcome was seen lives
 * apart, in its own member-only bit that only Quick Exit removes from the
 * device.
 */
const TASTE_VERSION = 1;

export interface StudioTaste {
  genres: readonly StudioGenre[];
  moods: readonly StudioMood[];
}

const KNOWN_GENRES: ReadonlySet<string> = new Set(STUDIO_GENRES);
const KNOWN_MOODS: ReadonlySet<string> = new Set(STUDIO_MOODS);

const isStudioGenre = (value: unknown): value is StudioGenre =>
  typeof value === "string" && KNOWN_GENRES.has(value);
const isStudioMood = (value: unknown): value is StudioMood =>
  typeof value === "string" && KNOWN_MOODS.has(value);

function parseTaste(raw: string | null, memberId: string): StudioTaste | null {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const record = parsed as Record<string, unknown>;
    if (record.version !== TASTE_VERSION || record.memberId !== memberId)
      return null;
    const genres = Array.isArray(record.genres)
      ? record.genres.filter(isStudioGenre)
      : [];
    const moods = Array.isArray(record.moods)
      ? record.moods.filter(isStudioMood)
      : [];
    return { genres: [...new Set(genres)], moods: [...new Set(moods)] };
  } catch {
    return null;
  }
}

// ── Subscribe and read ────────────────────────────────────────────────────

const listeners = new Set<() => void>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

function handleStorageEvent(event: StorageEvent): void {
  if (
    event.key === null ||
    event.key === STUDIO_TASTE_STORAGE_KEY ||
    event.key === STUDIO_WELCOME_SEEN_STORAGE_KEY
  )
    notifyListeners();
}

function subscribeStudioTaste(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1)
    window.addEventListener("storage", handleStorageEvent);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0)
      window.removeEventListener("storage", handleStorageEvent);
  };
}

/** Cached by the stored text and member, so the snapshot stays the same
 *  object until storage changes (useSyncExternalStore needs that). */
const tasteCache: {
  memberId: string | null;
  raw: string | null;
  taste: StudioTaste | null;
} = { memberId: null, raw: null, taste: null };

/** The member's picks on this device (the demo's copy, or a live member's
 *  older copy), or null before the welcome is done (or for another member's
 *  record, or with storage blocked). */
export function readStudioTaste(memberId: string | null): StudioTaste | null {
  if (!memberId) return null;
  const raw = safeStorage.get(STUDIO_TASTE_STORAGE_KEY);
  if (tasteCache.memberId === memberId && tasteCache.raw === raw)
    return tasteCache.taste;
  tasteCache.memberId = memberId;
  tasteCache.raw = raw;
  tasteCache.taste = parseTaste(raw, memberId);
  return tasteCache.taste;
}

/** Saves the picks on this device (the demo only). Skipped after Quick Exit, or
 *  while another tab's wipe pauses device memory. */
export function writeStudioTaste(memberId: string, taste: StudioTaste): void {
  if (areStudioListeningMemoryWritesStopped()) return;
  safeStorage.set(
    STUDIO_TASTE_STORAGE_KEY,
    JSON.stringify({
      version: TASTE_VERSION,
      memberId,
      genres: taste.genres,
      moods: taste.moods,
    }),
  );
  notifyListeners();
}

// ── Welcome seen ──────────────────────────────────────────────────────────

/** True once this member has closed the welcome on this device. The bit
 *  holds the member id and nothing else. */
export function readStudioWelcomeSeen(memberId: string | null): boolean {
  if (!memberId) return false;
  const raw = safeStorage.get(STUDIO_WELCOME_SEEN_STORAGE_KEY);
  if (raw === null) return false;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return false;
    const record = parsed as Record<string, unknown>;
    return record.version === TASTE_VERSION && record.memberId === memberId;
  } catch {
    return false;
  }
}

export function writeStudioWelcomeSeen(memberId: string): void {
  if (areStudioListeningMemoryWritesStopped()) return;
  safeStorage.set(
    STUDIO_WELCOME_SEEN_STORAGE_KEY,
    JSON.stringify({ version: TASTE_VERSION, memberId }),
  );
  notifyListeners();
}

/** Removes both device records (the demo's copy, or a live member's older
 *  copy once it is on the account). Never touches the account. */
export function clearStudioWelcomeDeviceCopy(): void {
  safeStorage.remove(STUDIO_TASTE_STORAGE_KEY);
  safeStorage.remove(STUDIO_WELCOME_SEEN_STORAGE_KEY);
  notifyListeners();
}

/** What a live member finished on this device before the welcome moved to the
 *  account: their picks (empty when only the seen bit is left) or null when
 *  no valid record of theirs is stored. */
export function readLegacyStudioWelcome(
  memberId: string | null,
): StudioTaste | null {
  if (!memberId) return null;
  const taste = readStudioTaste(memberId);
  if (taste !== null) return taste;
  return readStudioWelcomeSeen(memberId) ? { genres: [], moods: [] } : null;
}

/** Members who closed the welcome on this page load. Module level, so a
 *  remount of Studio home never reopens it when storage is blocked or
 *  writes are paused. */
const closedWelcomeMemberIds = new Set<string>();

export function markStudioWelcomeClosed(memberId: string): void {
  closedWelcomeMemberIds.add(memberId);
}

export function hasStudioWelcomeClosedThisPageLoad(memberId: string): boolean {
  return closedWelcomeMemberIds.has(memberId);
}

export interface StudioTasteState {
  memberId: string | null;
  /** Null until the member picks something. */
  taste: StudioTaste | null;
  /** The member closed the welcome before (on the account, or in the demo on
   *  this device). */
  hasSeenWelcome: boolean;
  /** Live mode: whether the account's answer is in. Always "ready" in the
   *  demo and for a member without Studio access (nothing to wait for). */
  welcomeReadState: StudioWelcomeReadState;
  /** True when the welcome lives on the account (live mode with Studio
   *  access); false in the demo, which keeps it on this device. */
  isAccountBacked: boolean;
}

/** The member's welcome state. Live: the account (shared by every consumer
 *  through one query). Demo: this device's storage, as before. */
export function useStudioTaste(): StudioTasteState {
  const { user } = useAuth();
  const { demoMode } = useDemoMode();
  const memberId = user?.id ?? null;
  const deviceTaste = useSyncExternalStore(subscribeStudioTaste, () =>
    readStudioTaste(memberId),
  );
  const hasSeenOnDevice = useSyncExternalStore(subscribeStudioTaste, () =>
    readStudioWelcomeSeen(memberId),
  );
  const account = useStudioWelcomeAccount();
  if (demoMode) {
    return {
      memberId,
      taste: deviceTaste,
      hasSeenWelcome: hasSeenOnDevice,
      welcomeReadState: "ready",
      isAccountBacked: false,
    };
  }
  return {
    memberId,
    taste: account.view?.taste ?? null,
    hasSeenWelcome: account.view?.hasSeenWelcome ?? false,
    welcomeReadState: account.readState,
    isAccountBacked: account.isAccountBacked,
  };
}

// ── Ordering ──────────────────────────────────────────────────────────────

/** The picked values first, each group keeping its own order. Returns the
 *  same array when nothing matches, so memoised callers stay stable. */
export function orderByTaste<Value extends string>(
  values: Value[],
  picks: readonly string[],
): Value[] {
  if (picks.length === 0) return values;
  const pickedValues = new Set(picks);
  const picked = values.filter((value) => pickedValues.has(value));
  if (picked.length === 0) return values;
  return [...picked, ...values.filter((value) => !pickedValues.has(value))];
}

/** Home's genre or mood tiles with the member's picks at the front. The
 *  order is worked out on this device from the saved picks. */
export function useStudioTasteOrder<Value extends string>(
  values: Value[],
  facet: "genre" | "mood",
): Value[] {
  const { taste } = useStudioTaste();
  const picks = facet === "genre" ? taste?.genres : taste?.moods;
  return useMemo(() => orderByTaste(values, picks ?? []), [values, picks]);
}
