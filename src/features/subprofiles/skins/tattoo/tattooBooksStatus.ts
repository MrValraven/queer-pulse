import type {
  AvailabilityKey,
  SkinData,
  SubprofileKind,
} from "../../api/subprofiles.api";
import { AVAILABILITY_OPTIONS } from "../../subprofilePresence.data";
import type { SkinOptionTone } from "../../skinBlockFields.data";
import {
  AVAILABILITY_TO_TATTOO_STATUS,
  TATTOO_STATUS_TO_AVAILABILITY,
  isTattooBooksStatus,
  type TattooBooksStatus,
} from "./tattooVocab.data";

export interface TattooStatusOption {
  status: TattooBooksStatus;
  availability: AvailabilityKey;
  labelKey: string;
  savedKey: string;
  tone: SkinOptionTone;
}

/** The owner bar's status switch, in display order. `savedKey` is the toast
 *  that confirms what visitors now see; `availability` is the persona-wide
 *  availability saved alongside (the contract's pairing). */
export const TATTOO_STATUS_OPTIONS: readonly TattooStatusOption[] = [
  {
    status: "open",
    availability: TATTOO_STATUS_TO_AVAILABILITY.open,
    labelKey: "subprofiles:tattoo.status.open",
    savedKey: "subprofiles:tattoo.owner.saved.open",
    tone: "jade",
  },
  {
    status: "waitlist",
    availability: TATTOO_STATUS_TO_AVAILABILITY.waitlist,
    labelKey: "subprofiles:tattoo.status.waitlist",
    savedKey: "subprofiles:tattoo.owner.saved.waitlist",
    tone: "amber",
  },
  {
    status: "closed",
    availability: TATTOO_STATUS_TO_AVAILABILITY.closed,
    labelKey: "subprofiles:tattoo.status.closed",
    savedKey: "subprofiles:tattoo.owner.saved.closed",
    tone: "muted",
  },
];

function statusFromAvailability(
  availability: string | null | undefined,
): TattooBooksStatus | null {
  if (!availability) return null;
  if (
    !Object.prototype.hasOwnProperty.call(
      AVAILABILITY_TO_TATTOO_STATUS,
      availability,
    )
  ) {
    return null;
  }
  return AVAILABILITY_TO_TATTOO_STATUS[availability as AvailabilityKey];
}

/** The stored `tattoo.status` when it is a listed value, else the status
 *  paired with `availability`, else null (no pill). */
export function resolveTattooBooksStatus(
  skinData: SkinData | null | undefined,
  availability: string | null | undefined,
): TattooBooksStatus | null {
  const storedStatus = skinData?.tattoo?.status;
  if (isTattooBooksStatus(storedStatus)) return storedStatus;
  return statusFromAvailability(availability);
}

export function tattooStatusLabelKey(status: TattooBooksStatus): string {
  const matchingOption = TATTOO_STATUS_OPTIONS.find(
    (option) => option.status === status,
  );
  return matchingOption?.labelKey ?? `subprofiles:tattoo.status.${status}`;
}

/** What an availability surface reads: books words for a tattoo persona,
 *  AVAILABILITY_OPTIONS labels otherwise; null when nothing is set. */
export function availabilityLabelKeyFor(
  kind: SubprofileKind,
  availability: string | null | undefined,
  skinData?: SkinData | null,
): string | null {
  if (kind === "tattoo_artist") {
    const status = resolveTattooBooksStatus(skinData, availability);
    return status ? tattooStatusLabelKey(status) : null;
  }
  const matchingOption = AVAILABILITY_OPTIONS.find(
    (option) => option.value === availability,
  );
  return matchingOption?.labelKey ?? null;
}

/** The availability whose AVAILABILITY_PILL_TONE the pill uses: for a tattoo
 *  persona the one paired with the resolved status. */
export function availabilityToneKeyFor(
  kind: SubprofileKind,
  availability: string | null | undefined,
  skinData?: SkinData | null,
): AvailabilityKey | null {
  if (kind === "tattoo_artist") {
    const status = resolveTattooBooksStatus(skinData, availability);
    return status ? TATTOO_STATUS_TO_AVAILABILITY[status] : null;
  }
  const matchingOption = AVAILABILITY_OPTIONS.find(
    (option) => option.value === availability,
  );
  return matchingOption?.value ?? null;
}

/** The whole stored skinData with `tattoo.status` replaced; nextOpening,
 *  waitNote and every other key stay. */
export function withTattooStatus(
  skinData: SkinData | null,
  status: TattooBooksStatus,
): SkinData {
  return { ...skinData, tattoo: { ...skinData?.tattoo, status } };
}
