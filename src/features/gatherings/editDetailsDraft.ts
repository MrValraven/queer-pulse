import type { EventVisibility } from "./api/events.api";
import type { FormatDetails, GatheringFamily } from "./gatheringCatalog";
import type {
  ContentNoteKey,
  CostKind,
  GatheringThemeKey,
  RsvpCutoff,
  RsvpQuestions,
} from "./gatheringExtras";

/**
 * What the edit-details modal holds while a host edits a published gathering.
 *
 * Its own file so `EditDetailsModal` stays inside the 200-line rule. The two
 * openers build it from the dashboard's state (`editDraftFormatFields` and
 * `editDraftCareFields` in `manageGatheringState.ts`), and `buildEditPatch`
 * turns it back into a PATCH.
 */
export interface GatheringDetailsDraft {
  title: string;
  /** The gathering's real start moment, as the local `"yyyy-mm-ddThh:mm"`
   *  wire value `DatePicker`'s `datetime` mode reads and writes (see
   *  `dateToDatetimeValue`). Saving it reschedules the event itself. */
  startAt: string;
  /** When the gathering ends, in the same local `"yyyy-mm-ddThh:mm"` wire
   *  value `startAt` uses, or `""` when it states no end. The empty string is
   *  a SAVED ANSWER: an end is optional on a gathering, the host can clear one
   *  that already exists, and `buildEditPatch` puts an explicit `null` on the
   *  wire for it. Same empty-string sentinel convention as `communitySlug`.
   *
   *  It is editable at all because a start is: moving a 23:00 start to 06:00
   *  used to push it past the stored end, and the only thing that came back
   *  was a 400 with nothing on the form to change. */
  endAt: string;
  location: string;
  description: string;
  /** Who can find and RSVP to this gathering. See `AudienceScopeField`. */
  visibility: EventVisibility;
  /** The community this gathering is filed to, or `""` for none. Mirrors
   *  `useGatheringForm`'s `communitySlug` convention (the same "no community"
   *  empty-string sentinel), since it is settable in both create and edit. */
  communitySlug: string;
  /** The gathering's family, or `""` for a gathering nobody has classified.
   *  Same empty-string sentinel `communitySlug` uses. */
  gatheringFamily: GatheringFamily | "";
  /** A curated catalog key, `"other"`, or `""` for nothing chosen. */
  format: string;
  /** The host's own words, when `format` is `"other"`. */
  otherText: string;
  /** The family's own questions, answered. `{}` for none. */
  formatDetails: FormatDetails;

  // ── Cover, care and RSVPs (Create Gathering v2, edited after publish) ─────
  /** The cover: the resolved read URL a saved gathering arrived with, a
   *  storage key the host picked in this edit, or `""` for none.
   *  `buildEditPatch` sends it only when it differs from the saved value. */
  coverImageUrl: string;
  /** Up to three theme keys, in the order the host picked them. A theme the
   *  family's own details already ask about is dropped (ruling R6). */
  themes: GatheringThemeKey[];
  /** Heads-up notes about what the gathering contains. */
  contentNotes: ContentNoteKey[];
  /** The host's house rules, or `""` for none. */
  houseRules: string;
  /** How it is paid for. */
  costKind: CostKind;
  /** The host's own words about what it costs. Kept while the kind is free,
   *  so switching back to a paid kind brings the words back; a free
   *  gathering sends no cost (ruling F11). */
  cost: string;
  /** When RSVPs close, or `null` for "When it ends". */
  rsvpCutoff: RsvpCutoff | null;
  /** Which RSVP questions are asked. `access` stays on (ruling R8). */
  rsvpQuestions: RsvpQuestions;
  /** The host's own RSVP question, or `""` for none. */
  customRsvpQuestion: string;
}
