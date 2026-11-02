import { safeStorage } from "../../../shared/storage/safeStorage";
import { ADD_MONTH_DRAFT_KEY_PREFIX } from "./addMonth.data";
import type {
  AddMonthCostValues,
  AddMonthPhoto,
  AddMonthPlaceValues,
  AddMonthRow,
  AddMonthState,
  AddMonthTimes,
} from "./addMonthState";

/**
 * Where the add-a-month page keeps its unpublished month in this browser, and
 * how it is read back and forgotten.
 *
 * Kept apart from `useAddMonthDraft` so `AuthProvider` can clear the drafts on
 * sign-out without loading the page: this file pulls in only the key prefix,
 * the state types and the guarded storage seam.
 *
 * Upload rule: `CoverUpload` keeps the storage key it holds when it unmounts,
 * and a reload runs no unmount cleanup, so a key held by the draft survives a
 * refresh and the row still sends it. An explicit "Use the shared cover" sets
 * the key to an empty string, which lets `CoverUpload` discard that upload when
 * it unmounts. `useDiscardableUploads` is unchanged. A `blob:` preview dies
 * with the page, so it is forgotten on read, and a demo upload whose key is
 * itself a `blob:` URL dies with it, so that photo is dropped.
 */

/** What one browser slot holds. */
export interface StoredAddMonthDraft {
  version: 1;
  savedAt: number;
  state: AddMonthState;
}

const STORED_DRAFT_VERSION = 1;
const BLOB_URL_START = "blob:";

/** Where this member's month lives. Signed-out or unresolved sessions share
 *  the `anon` slot. */
export function addMonthDraftKey(memberId: string | null | undefined): string {
  return `${ADD_MONTH_DRAFT_KEY_PREFIX}:${memberId || "anon"}`;
}

/** A month is worth saving once it has a starting event or a date. */
export function isAddMonthDraftWorthKeeping(state: AddMonthState): boolean {
  return state.templateSlug !== null || state.rows.length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringOrNull(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

/** Mirrors `COST_KIND_VALUES`; the list is repeated so this file never loads
 *  the gathering vocabulary (and its icons) into `AuthProvider`. */
function isCostKindValue(
  value: unknown,
): value is AddMonthCostValues["costKind"] {
  return value === "free" || value === "pay-what-you-can" || value === "fixed";
}

/** A stored photo with its dead references removed; null when nothing usable
 *  is left. */
function readPhoto(value: unknown): AddMonthPhoto | null {
  if (!isRecord(value) || typeof value.key !== "string") return null;
  if (value.key === "" || value.key.startsWith(BLOB_URL_START)) return null;
  const isPreviewAlive =
    typeof value.previewUrl === "string" &&
    !value.previewUrl.startsWith(BLOB_URL_START);
  return {
    key: value.key,
    previewUrl: isPreviewAlive ? (value.previewUrl as string) : null,
  };
}

function readTimes(value: unknown): AddMonthTimes | null {
  if (!isRecord(value) || typeof value.startTime !== "string") return null;
  if (value.endTime !== null && typeof value.endTime !== "string") return null;
  return { startTime: value.startTime, endTime: value.endTime };
}

function readRow(value: unknown): AddMonthRow | null {
  if (!isRecord(value)) return null;
  const { date, title, description } = value;
  if (typeof date !== "string") return null;
  if (typeof title !== "string" || typeof description !== "string") return null;
  return {
    date,
    title,
    description,
    photo: readPhoto(value.photo),
    timeOverride: readTimes(value.timeOverride),
  };
}

function readRows(value: unknown): AddMonthRow[] | null {
  if (!Array.isArray(value)) return null;
  const rows: AddMonthRow[] = [];
  for (const item of value) {
    const row = readRow(item);
    if (row === null) return null;
    rows.push(row);
  }
  return rows;
}

/** Rows set aside by a removed date. A damaged one is dropped on its own,
 *  since it only waits for a mis-tap to be undone. */
function readStashedRows(value: unknown): Record<string, AddMonthRow> {
  const stashedRows: Record<string, AddMonthRow> = {};
  if (!isRecord(value)) return stashedRows;
  for (const [date, item] of Object.entries(value)) {
    const row = readRow(item);
    if (row !== null) stashedRows[date] = row;
  }
  return stashedRows;
}

function readPlace(value: unknown): AddMonthPlaceValues | null {
  if (!isRecord(value)) return null;
  const { hood, venue, address, directions, onlineUrl } = value;
  if (
    typeof hood !== "string" ||
    typeof venue !== "string" ||
    typeof address !== "string" ||
    typeof directions !== "string" ||
    typeof onlineUrl !== "string" ||
    !isStringOrNull(value.venueListingId)
  ) {
    return null;
  }
  const listing = value.venueListing;
  const venueListing =
    isRecord(listing) &&
    typeof listing.slug === "string" &&
    typeof listing.name === "string"
      ? { slug: listing.slug, name: listing.name }
      : null;
  return {
    hood,
    venue,
    venueListingId: value.venueListingId,
    venueListing,
    address,
    directions,
    onlineUrl,
  };
}

function readCost(value: unknown): AddMonthCostValues | null {
  if (!isRecord(value) || !isCostKindValue(value.costKind)) return null;
  const { cost, paymentUrl, paymentInstructions } = value;
  if (
    typeof cost !== "string" ||
    typeof paymentUrl !== "string" ||
    typeof paymentInstructions !== "string"
  ) {
    return null;
  }
  return { costKind: value.costKind, cost, paymentUrl, paymentInstructions };
}

function readPledges(value: unknown): [boolean, boolean] | null {
  if (!Array.isArray(value) || value.length !== 2) return null;
  const [first, second] = value as unknown[];
  if (typeof first !== "boolean" || typeof second !== "boolean") return null;
  return [first, second];
}

/** A stored state read back, or null when its shape is not this version's. */
function readState(value: unknown): AddMonthState | null {
  if (!isRecord(value)) return null;
  const rows = readRows(value.rows);
  const times = readTimes(value.times);
  const pledges = readPledges(value.pledges);
  if (rows === null || times === null || pledges === null) return null;
  if (
    !isStringOrNull(value.templateSlug) ||
    !isStringOrNull(value.timesTemplateSlug)
  ) {
    return null;
  }
  return {
    templateSlug: value.templateSlug,
    timesTemplateSlug: value.timesTemplateSlug,
    times,
    place: readPlace(value.place),
    cost: readCost(value.cost),
    sharedCover: readPhoto(value.sharedCover),
    rows,
    stashedRows: readStashedRows(value.stashedRows),
    pledges,
  };
}

/** The month stored under `storageKey`; null when none is there, the entry is
 *  corrupt or older-shaped, or storage is blocked. */
export function readAddMonthDraft(
  storageKey: string,
): StoredAddMonthDraft | null {
  const raw = safeStorage.get(storageKey);
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== STORED_DRAFT_VERSION) {
      return null;
    }
    if (typeof parsed.savedAt !== "number") return null;
    const state = readState(parsed.state);
    if (state === null) return null;
    return { version: STORED_DRAFT_VERSION, savedAt: parsed.savedAt, state };
  } catch {
    return null;
  }
}

export function writeAddMonthDraft(
  storageKey: string,
  state: AddMonthState,
  savedAt: number,
): void {
  const stored: StoredAddMonthDraft = {
    version: STORED_DRAFT_VERSION,
    savedAt,
    state,
  };
  safeStorage.set(storageKey, JSON.stringify(stored));
}

/** Forget one stored month (publish calls this through the hook). */
export function removeAddMonthDraft(storageKey: string): void {
  safeStorage.remove(storageKey);
}

/**
 * Forget every stored month in this browser: the `anon` slot and each
 * member's. Signing out calls this, so the next person on a shared device
 * finds nobody else's unpublished month. A session that expires on its own
 * keeps its draft. Other keys stay as they are.
 *
 * Keys are collected before any is removed, since each removal shifts the
 * indexes of the keys after it. Blocked storage leaves everything as it is.
 */
export function clearStoredAddMonthDrafts(): void {
  const draftKeyStart = `${ADD_MONTH_DRAFT_KEY_PREFIX}:`;
  for (const storageKey of safeStorage.keys()) {
    if (storageKey.startsWith(draftKeyStart)) safeStorage.remove(storageKey);
  }
}
