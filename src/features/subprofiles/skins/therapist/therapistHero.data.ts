import type {
  AvailabilityKey,
  TherapistFacts,
  TherapistStatus,
} from "../../api/subprofiles.api";

/** The status pill's label for "open" and "closed". "wait" reads the
 *  therapist's own wait note, so it is composed in `TherapistStatusText`. */
export const STATUS_LABEL_KEYS: Record<
  Exclude<TherapistStatus, "wait">,
  string
> = {
  open: "subprofiles:therapist.hero.status.open",
  closed: "subprofiles:therapist.hero.status.closed",
};

/** The owner bar's capacity segment, in display order. Its labels are
 *  short forms of the status pill's wording, so the owner and members read
 *  the same words. `savedKey` is the toast that confirms what members now
 *  see; `availability` is the persona-wide availability saved alongside it. */
export const CAPACITY_OPTIONS: {
  status: TherapistStatus;
  availability: AvailabilityKey;
  labelKey: string;
  savedKey: string;
}[] = [
  {
    status: "open",
    availability: "open_to_collabs",
    labelKey: "subprofiles:therapist.owner.capacityShort.open",
    savedKey: "subprofiles:therapist.owner.capacitySaved.open",
  },
  {
    status: "wait",
    availability: "booking",
    labelKey: "subprofiles:therapist.owner.capacityShort.wait",
    savedKey: "subprofiles:therapist.owner.capacitySaved.wait",
  },
  {
    status: "closed",
    availability: "not_available",
    labelKey: "subprofiles:therapist.owner.capacityShort.closed",
    savedKey: "subprofiles:therapist.owner.capacitySaved.closed",
  },
];

/** Facts for a therapist who has not filled any in yet, so saving a
 *  capacity from the owner bar still writes a complete `therapist` block. */
export const EMPTY_THERAPIST_FACTS: TherapistFacts = {
  status: "open",
  waitNote: "",
  title: "",
  registration: "",
  quote: "",
  languages: "",
  where: "",
  online: "",
  timezone: "",
  email: "",
  website: "",
  goodToKnow: "",
};
