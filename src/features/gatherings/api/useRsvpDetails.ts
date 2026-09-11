import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  EXISTING_GATHERING_RSVP_QUESTIONS,
  normalizeRsvpQuestions,
  type RsvpQuestions,
} from "../gatheringExtras";
import { closingInstant } from "./events.adapters";
import { getEvent, type RsvpDetailsDTO } from "./events.api";
import { eventKeys } from "./eventKeys";

/** The questions a gathering's RSVP details form asks, and the two facts that
 *  decide whether the caller may still add guests. */
export interface RsvpDetailsQuestionsData {
  /** Complete, with ruling R8's fallback for a detail from before the field. */
  rsvpQuestions: RsvpQuestions;
  /** The host's own question, or null when there is none. */
  customRsvpQuestion: string | null;
  /** The instant RSVPs close, read by the same rule the gathering page uses,
   *  or null when they stay open until it ends. */
  rsvpClosesAt: Date | null;
  /** True when the caller hosts or co-hosts the gathering. The server lets
   *  organisers add guests after the cutoff. */
  isOrganizer: boolean;
}

/** What one detail fetch gives the details forms: the caller's own answers
 *  and the questions the gathering asks. */
interface RsvpDetailsQueryData extends RsvpDetailsQuestionsData {
  details: RsvpDetailsDTO | null;
}

// Module-level selectors, so React Query keeps each selected value's identity
// for as long as the cached data is unchanged. The modals re-seed their form
// when `details` changes identity, so an inline selector would re-seed them on
// every render.
const selectDetails = (data: RsvpDetailsQueryData) => data.details;
const selectQuestions = (
  data: RsvpDetailsQueryData,
): RsvpDetailsQuestionsData => ({
  rsvpQuestions: data.rsvpQuestions,
  customRsvpQuestion: data.customRsvpQuestion,
  rsvpClosesAt: data.rsvpClosesAt,
  isOrganizer: data.isOrganizer,
});

/**
 * One `GET /events/:slug` behind both hooks below, cached under a single key,
 * so reading the questions costs no request beyond the details read.
 */
function useRsvpDetailsQuery<Selected>(
  slug: string | undefined,
  select: (data: RsvpDetailsQueryData) => Selected,
) {
  const { demoMode } = useDemoMode();
  return useQuery<RsvpDetailsQueryData, Error, Selected>({
    queryKey: eventKeys.rsvpDetails(slug, demoMode),
    enabled: !demoMode && Boolean(slug),
    queryFn: async () => {
      if (!slug) {
        return {
          details: null,
          rsvpQuestions: EXISTING_GATHERING_RSVP_QUESTIONS,
          customRsvpQuestion: null,
          rsvpClosesAt: null,
          isOrganizer: false,
        };
      }
      const dto = await getEvent(slug);
      return {
        details: dto.myRsvpDetails ?? null,
        rsvpQuestions: normalizeRsvpQuestions(
          dto.rsvpQuestions,
          EXISTING_GATHERING_RSVP_QUESTIONS,
        ),
        customRsvpQuestion: dto.customRsvpQuestion?.trim()
          ? dto.customRsvpQuestion
          : null,
        // The same fetch, read the way `detailToGathering` reads it: the
        // server's own instant wins, and a cutoff alone is worked out here.
        rsvpClosesAt: closingInstant(dto),
        isOrganizer: dto.isOrganizer === true,
      };
    },
    select,
  });
}

/**
 * The caller's own RSVP details ("Anything we should know?": guest count,
 * access/dietary needs, pronouns, the answer to the host's question,
 * visibility) for one event, read via `GET /events/:slug`.
 * `EventDetail.myRsvpDetails` rides free on the detail fetch; see
 * `RsvpService.updateRsvpDetails`'s doc for why there's no dedicated GET.
 * `null` means either the event has no active RSVP for the caller, or (in
 * demo mode) there is nothing real to load, and `RsvpDetailsModal` keeps its
 * own local starting state there.
 *
 * `slug` here is the real backend slug (`MyEvent.slug`, or the gathering
 * detail's own slug), the form `useEvent` produces after stripping the
 * `<slug>-<shortId>` route-param composite.
 */
export function useRsvpDetails(slug: string | undefined) {
  return useRsvpDetailsQuery(slug, selectDetails);
}

/**
 * The questions that event's details form asks (ruling R8), off the same
 * cached fetch as `useRsvpDetails`. Undefined in demo and while loading; the
 * caller falls back to what the form always asked.
 */
export function useRsvpDetailsQuestions(slug: string | undefined) {
  return useRsvpDetailsQuery(slug, selectQuestions);
}
