import { useCallback, type Dispatch } from "react";
import type { CostFieldsForm } from "../steps/CostKindField";
import type { PlaceFieldsForm } from "../steps/PlaceFields";
import { isValidJoinLink } from "../useGatheringForm";
import type {
  AddMonthAction,
  AddMonthCostValues,
  AddMonthPlaceValues,
} from "./addMonthState";

/**
 * The wizard's place fields read a form object; the month page has a reducer.
 * This adapts one to the other. Every setter is a `useCallback` over the
 * stable `dispatch`, so `useVenueAddress`'s effect never loops on a new
 * `setAddress` identity.
 */
export function useAddMonthPlaceForm(options: {
  place: AddMonthPlaceValues;
  dispatch: Dispatch<AddMonthAction>;
  isVenueListingRefused: boolean;
}): PlaceFieldsForm {
  const { place, dispatch, isVenueListingRefused } = options;
  const setHood = useCallback(
    (hood: string) => dispatch({ type: "patchPlace", patch: { hood } }),
    [dispatch],
  );
  const setVenue = useCallback(
    (venue: string) => dispatch({ type: "patchPlace", patch: { venue } }),
    [dispatch],
  );
  const setVenueListingId = useCallback(
    (venueListingId: string | null) =>
      dispatch({ type: "patchPlace", patch: { venueListingId } }),
    [dispatch],
  );
  const setVenueListing = useCallback(
    (venueListing: AddMonthPlaceValues["venueListing"]) =>
      dispatch({ type: "patchPlace", patch: { venueListing } }),
    [dispatch],
  );
  const setAddress = useCallback(
    (address: string) => dispatch({ type: "patchPlace", patch: { address } }),
    [dispatch],
  );
  const setDirections = useCallback(
    (directions: string) =>
      dispatch({ type: "patchPlace", patch: { directions } }),
    [dispatch],
  );
  const setOnlineUrl = useCallback(
    (onlineUrl: string) =>
      dispatch({ type: "patchPlace", patch: { onlineUrl } }),
    [dispatch],
  );
  return {
    hood: place.hood,
    venue: place.venue,
    venueListingId: place.venueListingId,
    venueListing: place.venueListing,
    address: place.address,
    directions: place.directions,
    onlineUrl: place.onlineUrl,
    onlineUrlValid: isValidJoinLink(place.onlineUrl),
    isVenueListingRefused,
    setHood,
    setVenue,
    setVenueListingId,
    setVenueListing,
    setAddress,
    setDirections,
    setOnlineUrl,
  };
}

/** The cost fields as the wizard's cost form object, over the month's reducer. */
export function useAddMonthCostForm(options: {
  cost: AddMonthCostValues;
  dispatch: Dispatch<AddMonthAction>;
}): CostFieldsForm {
  const { cost, dispatch } = options;
  const setCostKind = useCallback(
    (costKind: AddMonthCostValues["costKind"]) =>
      dispatch({ type: "patchCost", patch: { costKind } }),
    [dispatch],
  );
  const setCost = useCallback(
    (costText: string) =>
      dispatch({ type: "patchCost", patch: { cost: costText } }),
    [dispatch],
  );
  const setPaymentUrl = useCallback(
    (paymentUrl: string) =>
      dispatch({ type: "patchCost", patch: { paymentUrl } }),
    [dispatch],
  );
  const setPaymentInstructions = useCallback(
    (paymentInstructions: string) =>
      dispatch({ type: "patchCost", patch: { paymentInstructions } }),
    [dispatch],
  );
  return {
    costKind: cost.costKind,
    cost: cost.cost,
    paymentUrl: cost.paymentUrl,
    paymentInstructions: cost.paymentInstructions,
    setCostKind,
    setCost,
    setPaymentUrl,
    setPaymentInstructions,
  };
}
