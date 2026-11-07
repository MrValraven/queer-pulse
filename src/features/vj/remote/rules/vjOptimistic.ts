/**
 * The optimistic map: a control shows the value it sent until the newest
 * received state (`stage.latestState.revision`) reaches the revision its ack
 * named. A refusal drops the entry so the server value shows again, and an
 * entry whose ack never came expires after VJ_OPTIMISTIC_TTL_MS.
 *
 * Every function returns a new map when something changes and the same map
 * otherwise, so React state setters skip a render on a no-op.
 */

export const VJ_OPTIMISTIC_TTL_MS = 6_000;

export interface VjOptimisticEntry<Value> {
  value: Value;
  awaitedRevision: number | null;
  sentAt: number;
}

export type VjOptimisticMap<Value> = ReadonlyMap<
  string,
  VjOptimisticEntry<Value>
>;

export function vjOptimisticSet<Value>(
  map: VjOptimisticMap<Value>,
  key: string,
  value: Value,
  now: number,
): VjOptimisticMap<Value> {
  const nextMap = new Map(map);
  nextMap.set(key, { value, awaitedRevision: null, sentAt: now });
  return nextMap;
}

export function vjOptimisticAcked<Value>(
  map: VjOptimisticMap<Value>,
  key: string,
  revision: number,
): VjOptimisticMap<Value> {
  const entry = map.get(key);
  if (entry === undefined) {
    return map;
  }
  // Acks arrive in order on one socket; the larger revision wins if not.
  const awaitedRevision =
    entry.awaitedRevision === null
      ? revision
      : Math.max(entry.awaitedRevision, revision);
  if (awaitedRevision === entry.awaitedRevision) {
    return map;
  }
  const nextMap = new Map(map);
  nextMap.set(key, { ...entry, awaitedRevision });
  return nextMap;
}

export function vjOptimisticFailed<Value>(
  map: VjOptimisticMap<Value>,
  key: string,
): VjOptimisticMap<Value> {
  if (!map.has(key)) {
    return map;
  }
  const nextMap = new Map(map);
  nextMap.delete(key);
  return nextMap;
}

function isVjOptimisticEntrySettled<Value>(
  entry: VjOptimisticEntry<Value>,
  stateRevision: number,
  now: number,
): boolean {
  const hasStateReachedAck =
    entry.awaitedRevision !== null && stateRevision >= entry.awaitedRevision;
  const hasExpired = now - entry.sentAt > VJ_OPTIMISTIC_TTL_MS;
  return hasStateReachedAck || hasExpired;
}

export function vjOptimisticReconcile<Value>(
  map: VjOptimisticMap<Value>,
  stateRevision: number,
  now: number,
): VjOptimisticMap<Value> {
  const settledKeys: string[] = [];
  for (const [key, entry] of map) {
    if (isVjOptimisticEntrySettled(entry, stateRevision, now)) {
      settledKeys.push(key);
    }
  }
  if (settledKeys.length === 0) {
    return map;
  }
  const nextMap = new Map(map);
  for (const key of settledKeys) {
    nextMap.delete(key);
  }
  return nextMap;
}

export function vjOptimisticValueOf<Value>(
  map: VjOptimisticMap<Value>,
  key: string,
  serverValue: Value,
): Value {
  const entry = map.get(key);
  return entry === undefined ? serverValue : entry.value;
}
