import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { ListingDraft } from "./listBusiness.data";
import {
  newServiceRow,
  MAX_LISTING_SERVICES,
  type ListingServiceRow,
} from "./listingServices.data";

/** Replace the service list on a draft, treating an absent list as empty. */
function patchServices(
  draft: ListingDraft,
  next: (rows: ListingServiceRow[]) => ListingServiceRow[],
): ListingDraft {
  return { ...draft, services: next(draft.services ?? []) };
}

/**
 * The priced-services list's setters, kept beside each other rather than
 * spread through `useListingForm`, for the same reason the hours exceptions are.
 *
 * Rows are addressed by their client-only `id`, never by index, so removing or
 * reordering one cannot silently edit its neighbour. `moveService` swaps with
 * the adjacent row and no-ops at either end, which is what lets the arrow
 * buttons be disabled honestly at the top and bottom of the list.
 */
export function useServiceSetters(
  setDraft: Dispatch<SetStateAction<ListingDraft>>,
) {
  const addService = useCallback(() => {
    setDraft((draft) =>
      patchServices(draft, (rows) =>
        rows.length >= MAX_LISTING_SERVICES ? rows : [...rows, newServiceRow()],
      ),
    );
  }, [setDraft]);

  const setServiceField = useCallback(
    (id: string, patch: Partial<Omit<ListingServiceRow, "id">>) => {
      setDraft((draft) =>
        patchServices(draft, (rows) =>
          rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
        ),
      );
    },
    [setDraft],
  );

  const removeService = useCallback(
    (id: string) => {
      setDraft((draft) =>
        patchServices(draft, (rows) => rows.filter((row) => row.id !== id)),
      );
    },
    [setDraft],
  );

  /** Swap a row with its neighbour. `direction` is -1 for up, 1 for down; a
   *  move off either end is a no-op, so a button can never promise something
   *  it will not do. */
  const moveService = useCallback(
    (id: string, direction: -1 | 1) => {
      setDraft((draft) =>
        patchServices(draft, (rows) => {
          const index = rows.findIndex((row) => row.id === id);
          const target = index + direction;
          if (index < 0 || target < 0 || target >= rows.length) return rows;
          const reordered = [...rows];
          const moved = reordered[index]!;
          reordered[index] = reordered[target]!;
          reordered[target] = moved;
          return reordered;
        }),
      );
    },
    [setDraft],
  );

  return { addService, setServiceField, removeService, moveService };
}
