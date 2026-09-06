import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { MyHousingListingRow } from "../myHousingListings.data";
import { economyKeys } from "./economyKeys";
import { dtoToMyHousingListingRow } from "./housingListing.adapters";
import {
  deleteHousingListing,
  extendHousingListing,
  markHousingListingAvailable,
  markHousingListingFilled,
  updateHousingListing,
  type HousingListingDTO,
  type UpdateHousingListingBody,
} from "./housingListing.api";

export type MyHousingListingAction =
  | { ref: string; action: "markFilled" }
  | { ref: string; action: "markAvailable" }
  | { ref: string; action: "extend" }
  | { ref: string; action: "update"; body: UpdateHousingListingBody };

const NOW_ISO = () => new Date().toISOString();
const sixtyDaysFromNow = () =>
  new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

/** Locally applies a transition to a demo row so the prototype UI responds
 * with no backend — mirrors `useHousingViewings.ts#applyDemoTransition`. */
function applyDemoTransition(
  row: MyHousingListingRow,
  input: MyHousingListingAction,
): MyHousingListingRow {
  switch (input.action) {
    case "markFilled":
      return { ...row, filledAt: NOW_ISO() };
    case "markAvailable":
      return {
        ...row,
        filledAt: null,
        expiresAt: row.expired ? sixtyDaysFromNow() : row.expiresAt,
        expired: false,
      };
    case "extend":
      return { ...row, expiresAt: sixtyDaysFromNow(), expired: false };
    case "update":
      return {
        ...row,
        ...(input.body.type !== undefined ? { type: input.body.type } : {}),
        ...(input.body.title !== undefined ? { title: input.body.title } : {}),
        ...(input.body.city !== undefined ? { city: input.body.city } : {}),
        ...(input.body.area !== undefined ? { area: input.body.area } : {}),
        ...(input.body.rentEuros !== undefined
          ? { rentEuros: input.body.rentEuros }
          : {}),
        // Deposit included so a demo edit shows what a live one would, CLEARING
        // included: the form always sends this key and sends `null` for a blank
        // field, which is how a lister takes a deposit back off (see
        // `useListSpaceForm`'s `buildBody`).
        ...(input.body.depositEuros !== undefined
          ? { depositEuros: input.body.depositEuros }
          : {}),
        ...(input.body.bedrooms !== undefined
          ? { bedrooms: input.body.bedrooms }
          : {}),
        ...(input.body.billsIncluded !== undefined
          ? { billsIncluded: input.body.billsIncluded }
          : {}),
        ...(input.body.accessibilityInfo !== undefined
          ? { accessibilityInfo: input.body.accessibilityInfo }
          : {}),
        ...(input.body.listerKind !== undefined
          ? { listerKind: input.body.listerKind }
          : {}),
        ...(input.body.virtualTourUrl !== undefined
          ? { virtualTourUrl: input.body.virtualTourUrl }
          : {}),
        // Everything the form gained with LOC-09, so a demo edit shows the
        // same result a live one would.
        ...(input.body.blurb !== undefined ? { blurb: input.body.blurb } : {}),
        ...(input.body.description !== undefined
          ? { description: input.body.description }
          : {}),
        ...(input.body.availableFrom !== undefined
          ? { availableFrom: input.body.availableFrom }
          : {}),
        ...(input.body.minStayMonths !== undefined
          ? { minStayMonths: input.body.minStayMonths }
          : {}),
        ...(input.body.features !== undefined
          ? { features: input.body.features }
          : {}),
        ...(input.body.idealFor !== undefined
          ? { idealFor: input.body.idealFor }
          : {}),
        ...(input.body.gallery !== undefined
          ? { gallery: input.body.gallery }
          : {}),
      };
  }
}

async function runLiveAction(
  input: MyHousingListingAction,
): Promise<HousingListingDTO> {
  switch (input.action) {
    case "markFilled":
      return markHousingListingFilled(input.ref);
    case "markAvailable":
      return markHousingListingAvailable(input.ref);
    case "extend":
      return extendHousingListing(input.ref);
    case "update":
      return updateHousingListing(input.ref, input.body);
  }
}

/** Mark filled / mark available / extend / edit one of the caller's own
 * housing listings (HSG-1/HSG-3), patching the cached `mine` list in place —
 * mirrors `useHousingViewings.ts#useViewingAction`. */
export function useMyHousingListingAction() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const key = economyKeys.myHousingListings(demoMode);
  return useMutation<MyHousingListingRow | null, Error, MyHousingListingAction>(
    {
      meta: { silentError: true },
      mutationFn: async (input) => {
        if (demoMode) {
          await new Promise((resolve) => setTimeout(resolve, 400));
          const current = queryClient
            .getQueryData<MyHousingListingRow[]>(key)
            ?.find((row) => row.ref === input.ref);
          return current ? applyDemoTransition(current, input) : null;
        }
        const dto = await runLiveAction(input);
        return dtoToMyHousingListingRow(dto);
      },
      onSuccess: (updated) => {
        if (!updated) return;
        queryClient.setQueryData<MyHousingListingRow[]>(key, (previous) =>
          (previous ?? []).map((row) =>
            row.ref === updated.ref ? updated : row,
          ),
        );
      },
    },
  );
}

/** Delete one of the caller's own housing listings — irreversible, so the
 * caller gates this behind a confirm dialog. Removes the row from the cached
 * `mine` list on success rather than patching it. */
export function useDeleteHousingListing() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const key = economyKeys.myHousingListings(demoMode);
  return useMutation<void, Error, string>({
    mutationFn: async (ref) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return;
      }
      await deleteHousingListing(ref);
    },
    onSuccess: (_result, ref) => {
      queryClient.setQueryData<MyHousingListingRow[]>(key, (previous) =>
        (previous ?? []).filter((row) => row.ref !== ref),
      );
    },
  });
}
