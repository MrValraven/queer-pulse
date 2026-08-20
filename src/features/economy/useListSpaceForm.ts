import { useState } from "react";
import type { CreateHousingListingBody } from "./api/housingListing.api";

/**
 * Field state + validity + request-body builder for the "list a space" form.
 * Split out of `ListSpaceModal` so the modal stays a thin orchestrator (submit /
 * step-up / success) under the 200-line rule and the fields render from one
 * `form` object instead of a dozen threaded props.
 */
export interface ListSpaceForm {
  title: string;
  setTitle: (value: string) => void;
  area: string;
  setArea: (value: string) => void;
  rent: string;
  setRent: (value: string) => void;
  type: string;
  setType: (value: string) => void;
  bedrooms: string;
  setBedrooms: (value: string) => void;
  accessibility: string;
  setAccessibility: (value: string) => void;
  virtualTour: string;
  setVirtualTour: (value: string) => void;
  billsIncluded: boolean;
  setBillsIncluded: (value: boolean) => void;
  isAgent: boolean;
  setIsAgent: (value: boolean) => void;
  valid: boolean;
  /** True when a non-empty virtual-tour link isn't a valid https URL — drives an
   * inline field error without blocking submit for the empty (optional) case. */
  virtualTourInvalid: boolean;
  buildBody: () => CreateHousingListingBody;
}

/** Whether a non-empty tour link is a usable https URL (the same shape the
 * backend validates). Empty is fine — the field is optional. */
function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value.trim()).protocol === "https:";
  } catch {
    return false;
  }
}

/** Seeds the form with an existing listing's values — the edit flow's only
 * difference from create (`MyHousingListingsPage`'s edit modal passes this;
 * omitting it, as every create-flow caller does, is the original blank form). */
export interface ListSpaceFormInitial {
  title?: string;
  area?: string;
  rent?: string;
  type?: string;
  bedrooms?: string;
  accessibility?: string;
  virtualTour?: string;
  billsIncluded?: boolean;
  isAgent?: boolean;
}

export function useListSpaceForm(
  initial: ListSpaceFormInitial = {},
): ListSpaceForm {
  const [title, setTitle] = useState(initial.title ?? "");
  const [area, setArea] = useState(initial.area ?? "");
  const [rent, setRent] = useState(initial.rent ?? "");
  const [type, setType] = useState(initial.type ?? "");
  const [bedrooms, setBedrooms] = useState(initial.bedrooms ?? "");
  const [accessibility, setAccessibility] = useState(
    initial.accessibility ?? "",
  );
  const [virtualTour, setVirtualTour] = useState(initial.virtualTour ?? "");
  const [billsIncluded, setBillsIncluded] = useState(
    initial.billsIncluded ?? false,
  );
  const [isAgent, setIsAgent] = useState(initial.isAgent ?? false);

  const virtualTourInvalid =
    virtualTour.trim().length > 0 && !isHttpsUrl(virtualTour);

  const valid =
    title.trim().length > 3 &&
    area.trim().length > 1 &&
    !!rent &&
    !!type &&
    accessibility.trim().length > 3 &&
    !virtualTourInvalid;

  const buildBody = (): CreateHousingListingBody => {
    const trimmedTour = virtualTour.trim();
    const trimmedBedrooms = bedrooms.trim();
    return {
      type: type as CreateHousingListingBody["type"],
      title: title.trim(),
      city: area.trim(),
      area: area.trim(),
      rentEuros: Number(rent),
      ...(trimmedBedrooms !== "" ? { bedrooms: Number(trimmedBedrooms) } : {}),
      accessibilityInfo: accessibility.trim(),
      billsIncluded,
      listerKind: isAgent ? "agent" : "member",
      ...(trimmedTour !== "" ? { virtualTourUrl: trimmedTour } : {}),
    };
  };

  return {
    title,
    setTitle,
    area,
    setArea,
    rent,
    setRent,
    type,
    setType,
    bedrooms,
    setBedrooms,
    accessibility,
    setAccessibility,
    virtualTour,
    setVirtualTour,
    billsIncluded,
    setBillsIncluded,
    isAgent,
    setIsAgent,
    valid,
    virtualTourInvalid,
    buildBody,
  };
}
