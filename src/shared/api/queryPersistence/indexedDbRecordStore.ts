/**
 * One IndexedDB record, read, written and removed through a single promise
 * chain. The chain is what makes ordering hold across async boundaries: a
 * write queued before a removal always lands before it, so a sign-out purge
 * can never be undone by a write that was already on its way.
 *
 * Every operation is best-effort and silent, like `pushSubStore.ts`: IndexedDB
 * missing (some private modes, blocked site data), a failed open, an open
 * that never settles, a quota error or a value the structured clone refuses
 * all stay silent and never throw into a caller. `write()`/`remove()` treat
 * every one of these as a no-op; `read()` reports them as
 * `{ status: "unavailable" }`, kept distinct from a confirmed empty store
 * (see {@link IndexedDbReadResult}), so a caller deciding what to do next
 * can tell the two apart. `open()` is time-boxed so a wedged database can
 * never hang app start or a sign-out purge; when it times out, `remove()`
 * still tries `indexedDB.deleteDatabase` directly as a best effort, since
 * that needs no successful open first.
 */

/** `read()`'s result: `"unavailable"` when IndexedDB is missing or the store
 *  could not be reached at all (a failed or timed-out open), kept distinct
 *  from `"ok"` with `value: undefined` (a successful read that confirmed
 *  nothing is stored). A caller deciding whether there is something to
 *  protect must not treat "could not check" the same as "definitely empty". */
export type IndexedDbReadResult<Value> =
  { status: "ok"; value: Value | undefined } | { status: "unavailable" };

export interface IndexedDbRecordStore<Value> {
  read(): Promise<IndexedDbReadResult<Value>>;
  /** `shouldStillWrite` is checked when the write reaches the front of the
   *  chain, so a caller can cancel a write that was queued before a purge. */
  write(value: Value, shouldStillWrite?: () => boolean): Promise<void>;
  remove(): Promise<void>;
}

interface RecordLocation {
  databaseName: string;
  storeName: string;
  recordKey: string;
}

const DATABASE_VERSION = 1;

/** A few seconds: generous for a local open, short enough that a wedged
 *  browser (a stuck upgrade in another tab, a corrupted profile) cannot hang
 *  app start or a sign-out purge indefinitely. */
const OPEN_TIMEOUT_MS = 3_000;

function toError(domException: unknown): Error {
  return domException instanceof Error
    ? domException
    : new Error("IndexedDB request failed");
}

function isIndexedDbAvailable(): boolean {
  try {
    return typeof indexedDB !== "undefined" && indexedDB !== null;
  } catch {
    return false;
  }
}

/** Best-effort fallback for `remove()` when `open()` itself failed, timed out
 *  or was blocked. A purge only cares that the record is gone, and deleting
 *  the whole database needs no successful open first. Fire-and-forget: never
 *  awaited, so a delete that itself gets stuck cannot re-introduce the hang
 *  this exists to avoid. Only ever reached once IndexedDB is confirmed to
 *  exist (`enqueue`'s own availability check guards the branch that calls
 *  this), so it does not re-check. */
function bestEffortDeleteDatabase(databaseName: string): void {
  try {
    const request = indexedDB.deleteDatabase(databaseName);
    request.onerror = () => {};
    request.onblocked = () => {};
  } catch {
    // Nothing more to try; a later purge attempt gets another chance.
  }
}

function openDatabase(location: RecordLocation): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(location.databaseName, DATABASE_VERSION);
    // Set once the open has been given up on (timed out or blocked), so a
    // success that still arrives later closes its handle and leaves no
    // connection open to block the next upgrade.
    let isSettled = false;
    const timeoutId = setTimeout(() => {
      if (isSettled) return;
      isSettled = true;
      reject(new Error("IndexedDB open timed out"));
    }, OPEN_TIMEOUT_MS);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(location.storeName)) {
        database.createObjectStore(location.storeName);
      }
    };
    request.onsuccess = () => {
      clearTimeout(timeoutId);
      if (isSettled) {
        request.result.close();
        return;
      }
      isSettled = true;
      resolve(request.result);
    };
    request.onerror = () => {
      clearTimeout(timeoutId);
      if (isSettled) return;
      isSettled = true;
      reject(toError(request.error));
    };
    request.onblocked = () => {
      clearTimeout(timeoutId);
      if (isSettled) return;
      isSettled = true;
      reject(new Error("IndexedDB open blocked"));
    };
  });
}

/** Run one request in its own transaction; resolves once the transaction
 *  commits, so a write is durable before the chain moves on. */
function runRequest<Result>(
  database: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode,
  makeRequest: (store: IDBObjectStore) => IDBRequest<Result>,
): Promise<Result | undefined> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const request = makeRequest(transaction.objectStore(storeName));
    let result: Result | undefined;
    request.onsuccess = () => {
      result = request.result;
    };
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () =>
      reject(toError(transaction.error ?? request.error));
    transaction.onabort = () => reject(toError(transaction.error));
  });
}

export function createIndexedDbRecordStore<Value>(
  location: RecordLocation,
): IndexedDbRecordStore<Value> {
  let chain: Promise<unknown> = Promise.resolve();

  function enqueue<Result>(
    operation: (database: IDBDatabase) => Promise<Result>,
    fallback: Result,
    /** Best-effort work to run when the store could not be reached at all
     *  (missing, a failed open, an open that timed out). Only `remove()`
     *  passes one, to fall back on `indexedDB.deleteDatabase` directly. */
    onUnavailable?: () => void,
  ): Promise<Result> {
    const run = chain.then(async () => {
      // Nothing to fall back to here: IndexedDB itself is missing, so
      // `onUnavailable` (a raw `indexedDB.deleteDatabase` call for `remove()`)
      // would have nothing to call either. It only fires from the catch
      // branch below, where IndexedDB exists but this particular open failed.
      if (!isIndexedDbAvailable()) return fallback;
      try {
        const database = await openDatabase(location);
        try {
          return await operation(database);
        } finally {
          database.close();
        }
      } catch {
        onUnavailable?.();
        return fallback;
      }
    });
    chain = run;
    return run;
  }

  return {
    read: () =>
      enqueue<IndexedDbReadResult<Value>>(
        async (database) => ({
          status: "ok",
          value: (await runRequest<unknown>(
            database,
            location.storeName,
            "readonly",
            (store) => store.get(location.recordKey),
          )) as Value | undefined,
        }),
        { status: "unavailable" },
      ),
    write: (value, shouldStillWrite) =>
      enqueue<void>(async (database) => {
        if (shouldStillWrite && !shouldStillWrite()) return;
        await runRequest(database, location.storeName, "readwrite", (store) =>
          store.put(value, location.recordKey),
        );
      }, undefined),
    remove: () =>
      enqueue<void>(
        async (database) => {
          await runRequest(database, location.storeName, "readwrite", (store) =>
            store.delete(location.recordKey),
          );
        },
        undefined,
        () => bestEffortDeleteDatabase(location.databaseName),
      ),
  };
}
