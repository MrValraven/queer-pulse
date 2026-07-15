import type { Paginated } from "../contracts/contracts";

/**
 * Normalize a list response into a `Paginated<T>` envelope. Some backend list
 * endpoints answer with a bare array (the whole list in one page) instead of the
 * `{ data, pageInfo }` envelope the cursor/infinite-query hooks expect. Reading
 * `.data`/`.pageInfo` off a bare array throws `Cannot read properties of
 * undefined`, so wrap every list call in this: a bare array becomes a single
 * terminal page (`nextCursor: null`, `hasMore: false`).
 */
export function toPage<T>(res: T[] | Paginated<T>): Paginated<T> {
  if (Array.isArray(res)) {
    return { data: res, pageInfo: { nextCursor: null, hasMore: false } };
  }
  return {
    data: res?.data ?? [],
    pageInfo: res?.pageInfo ?? { nextCursor: null, hasMore: false },
  };
}

/**
 * The page-count envelope the rest of the app uses (the `Paginated<T>` in
 * `src/shared/api/refs.ts`, plus a couple of feature-local copies of the same
 * shape). Structurally identical everywhere, so this one type serves them all.
 */
export interface ItemsPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * `toPage` for the `{ items, total, page, pageSize }` envelope. Same defence: a
 * bare-array response (the whole list in one page) becomes a single full page so
 * callers never read `.items` off an array. The return type is structural, so it
 * satisfies the refs / feature-local `Paginated<T>` aliases interchangeably.
 */
export function toItemsPage<T>(res: T[] | ItemsPage<T>): ItemsPage<T> {
  if (Array.isArray(res)) {
    return { items: res, total: res.length, page: 1, pageSize: res.length };
  }
  return {
    items: res?.items ?? [],
    total: res?.total ?? res?.items?.length ?? 0,
    page: res?.page ?? 1,
    pageSize: res?.pageSize ?? res?.items?.length ?? 0,
  };
}
