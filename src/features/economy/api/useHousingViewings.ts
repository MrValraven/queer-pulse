import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { DEMO_HOUSING_VIEWINGS } from "../housingViewings.data";
import { economyKeys } from "./economyKeys";
import {
  acceptHousingViewing,
  cancelHousingViewing,
  completeHousingViewing,
  declineHousingViewing,
  getMyHousingViewings,
  proposeHousingViewing,
  requestHousingViewing,
  type HousingViewingDTO,
  type RequestViewingBody,
} from "./housingViewings.api";

/** The caller's viewings, both as requester and as lister. Demo reads fixtures;
 * live fetches `/housing-viewings/mine`. */
export function useMyHousingViewings() {
  const { demoMode } = useDemoMode();
  return useQuery<HousingViewingDTO[]>({
    queryKey: economyKeys.housingViewings(demoMode),
    initialData: demoMode ? DEMO_HOUSING_VIEWINGS : undefined,
    queryFn: async () => {
      if (demoMode) return DEMO_HOUSING_VIEWINGS;
      return getMyHousingViewings();
    },
  });
}

/** Request a viewing on a listing. Demo fakes latency (the modal shows its own
 * confirmation); live delivers the request to the lister. */
export function useRequestHousingViewing() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<HousingViewingDTO | null, Error, RequestViewingBody>({
    // RequestViewingModal owns this write's error UI: an
    // AFFIRMING_PLEDGE_REQUIRED 403 opens the pledge prompt (never a toast),
    // and anything else gets the modal's own message. Without this the global
    // MutationCache handler would toast "You don't have access to that."
    // alongside the pledge modal.
    meta: { silentError: true },
    mutationFn: async (body) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 650));
        return null;
      }
      return requestHousingViewing(body);
    },
    onSuccess: () => {
      if (!demoMode) {
        void queryClient.invalidateQueries({
          queryKey: economyKeys.housingViewingsRoot,
        });
      }
    },
  });
}

export type ViewingAction =
  | { id: string; action: "accept"; slot: string }
  | { id: string; action: "propose"; slots: string[]; note?: string }
  | { id: string; action: "decline"; note?: string }
  | { id: string; action: "cancel" }
  | { id: string; action: "complete" };

/** Locally applies a transition to a demo viewing so the prototype UI responds
 * without a backend — mirrors the server state machine's visible effect. */
function applyDemoTransition(
  viewing: HousingViewingDTO,
  input: ViewingAction,
): HousingViewingDTO {
  switch (input.action) {
    case "accept":
      return { ...viewing, status: "accepted", acceptedSlot: input.slot };
    case "propose":
      return {
        ...viewing,
        proposedSlots: input.slots,
        proposedBy: viewing.role,
        youProposedLast: true,
        responseNote: input.note ?? null,
      };
    case "decline":
      return {
        ...viewing,
        status: "declined",
        responseNote: input.note ?? null,
      };
    case "cancel":
      return { ...viewing, status: "cancelled" };
    case "complete":
      return { ...viewing, status: "completed" };
  }
}

async function runLiveAction(input: ViewingAction): Promise<HousingViewingDTO> {
  switch (input.action) {
    case "accept":
      return acceptHousingViewing(input.id, input.slot);
    case "propose":
      return proposeHousingViewing(input.id, input.slots, input.note);
    case "decline":
      return declineHousingViewing(input.id, input.note);
    case "cancel":
      return cancelHousingViewing(input.id);
    case "complete":
      return completeHousingViewing(input.id);
  }
}

/** Accept / propose / decline / cancel / complete a viewing, patching the cached
 * list in place. Demo transitions the fixture locally; live uses the server's
 * returned DTO. */
export function useViewingAction() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const key = economyKeys.housingViewings(demoMode);
  return useMutation<HousingViewingDTO | null, Error, ViewingAction>({
    meta: { silentError: true },
    mutationFn: async (input) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        const current = queryClient
          .getQueryData<HousingViewingDTO[]>(key)
          ?.find((viewing) => viewing.id === input.id);
        return current ? applyDemoTransition(current, input) : null;
      }
      return runLiveAction(input);
    },
    onSuccess: (updated) => {
      if (!updated) return;
      queryClient.setQueryData<HousingViewingDTO[]>(key, (previous) =>
        (previous ?? []).map((viewing) =>
          viewing.id === updated.id ? updated : viewing,
        ),
      );
    },
  });
}
