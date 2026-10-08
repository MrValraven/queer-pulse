import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { ListingDraft } from "./listBusiness.data";
import {
  LISBON_PARISH_NAMES,
  NEARBY_MUNICIPALITIES,
  normalizeMobileDetails,
  type ListingMobileDetails,
} from "./listingMobile.data";

function patchMobileDetails(
  draft: ListingDraft,
  next: (details: ListingMobileDetails) => ListingMobileDetails,
): ListingDraft {
  return {
    ...draft,
    mobileDetails: next(normalizeMobileDetails(draft.mobileDetails)),
  };
}

/**
 * The out-and-about setters, beside the online ones. Every read heals
 * through `normalizeMobileDetails`, so a draft from before the feature edits
 * as the empty block. Lists stay in vocabulary order, once each.
 */
export function useMobileSetters(
  setDraft: Dispatch<SetStateAction<ListingDraft>>,
) {
  const setMobileAllOfCity = useCallback(
    (isAllOfCity: boolean) =>
      setDraft((draft) =>
        patchMobileDetails(draft, (details) => ({
          ...details,
          allOfCity: isAllOfCity,
        })),
      ),
    [setDraft],
  );
  const addMobileParish = useCallback(
    (parish: string) =>
      setDraft((draft) =>
        patchMobileDetails(draft, (details) => ({
          ...details,
          parishes: LISBON_PARISH_NAMES.filter(
            (name) => name === parish || details.parishes.includes(name),
          ),
        })),
      ),
    [setDraft],
  );
  const removeMobileParish = useCallback(
    (parish: string) =>
      setDraft((draft) =>
        patchMobileDetails(draft, (details) => ({
          ...details,
          parishes: details.parishes.filter((name) => name !== parish),
        })),
      ),
    [setDraft],
  );
  const toggleAlsoTravelsTo = useCallback(
    (municipality: string) =>
      setDraft((draft) =>
        patchMobileDetails(draft, (details) => {
          const isOn = details.alsoTravelsTo.includes(municipality);
          return {
            ...details,
            alsoTravelsTo: NEARBY_MUNICIPALITIES.filter((name) =>
              name === municipality
                ? !isOn
                : details.alsoTravelsTo.includes(name),
            ),
          };
        }),
      ),
    [setDraft],
  );
  const setByAppointment = useCallback(
    (isByAppointment: boolean) =>
      setDraft((draft) =>
        patchMobileDetails(draft, (details) => ({
          ...details,
          byAppointment: isByAppointment,
        })),
      ),
    [setDraft],
  );
  const setHasMeetingPoint = useCallback(
    (hasMeetingPoint: boolean) =>
      setDraft((draft) => ({ ...draft, hasMeetingPoint })),
    [setDraft],
  );

  return {
    setMobileAllOfCity,
    addMobileParish,
    removeMobileParish,
    toggleAlsoTravelsTo,
    setByAppointment,
    setHasMeetingPoint,
  };
}
