import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { getOpportunity } from "./volunteering.api";
import {
  OPPORTUNITY_ANONYMOUS_VIEWER,
  opportunityKeys,
} from "./opportunityKeys";
import { detailToOpportunity } from "./volunteering.adapters";
import { memberRefToPerson, type Person } from "../../../shared/api/refs";
import type { VolunteerOpportunity } from "../volunteerOpportunities";
import { DEMO_POSTER_OPPORTUNITY_SLUG } from "../volunteerDemoPoster";

export interface OpportunityResult {
  opportunity: VolunteerOpportunity | undefined;
  spotsFilled: number;
  spotsTotal: number;
  /** True when every spot is taken — apply is blocked (409 on the server). */
  isFull: boolean;
  status: "open" | "closed";
  /** The review tier — the poster, or an owner/mod of the community this
   *  opportunity is attributed to. Reveals the roster + manage entry point and
   *  withdraws the apply offer. */
  canReviewApplicants: boolean;
  /** Poster-only. Edit and close never widen to the community's organisers. */
  canEditOpportunity: boolean;
  /** The member to address about this opportunity, `null` when the API carried
   *  no poster (an erased poster) or in demo mode, whose mock registry has no
   *  ownership concept at all. */
  poster: Person | null;
  /** The viewer already signed up → the "you're on the list" state shows. */
  mySignup: boolean;
  /** True when the opportunity has a team on record. A signed-out reader is
   *  named nobody (`team` is empty), so this is what offers them the "see
   *  who's in" prompt. */
  hasTeam: boolean;
}

/** Parse a mock "18 / 24" spots string into its two numbers. */
function parseSpots(s: string): { filled: number; total: number } {
  const m = /(\d+)\s*\/\s*(\d+)/.exec(s);
  if (!m) return { filled: 0, total: 0 };
  return { filled: Number(m[1]), total: Number(m[2]) };
}

/**
 * Single opportunity detail. Demo mode resolves the `:slug` against the mock
 * `VOLUNTEER_OPPORTUNITIES` registry (poster/mySignup default false, exactly as
 * the prototype renders today); live mode calls GET /volunteering/:slug, adapts
 * it to the same view-model, and surfaces the viewer-specific flags.
 */
export function useOpportunity(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const { user, checking } = useAuth();
  const viewer = user?.id ?? OPPORTUNITY_ANONYMOUS_VIEWER;
  return useQuery<OpportunityResult>({
    queryKey: opportunityKeys.detail(slug, viewer, demoMode),
    // Parked while the live session is still resolving: the request carries
    // the session cookie, so a fetch now would file the member's flags under
    // the anonymous key and then fetch again once `user` lands. Callers read
    // `isPending`, so the page holds its skeleton through this window.
    enabled: Boolean(slug) && !checking,
    queryFn: async () => {
      if (demoMode) {
        const { getOpportunity: getMockOpportunity } =
          await import("../volunteerLookup");
        const opp = getMockOpportunity(slug);
        const { filled, total } = parseSpots(opp?.spotsFilled ?? "0 / 0");
        return {
          opportunity: opp,
          spotsFilled: filled,
          spotsTotal: total,
          isFull: false,
          status: "open",
          canReviewApplicants: opp?.slug === DEMO_POSTER_OPPORTUNITY_SLUG,
          canEditOpportunity: opp?.slug === DEMO_POSTER_OPPORTUNITY_SLUG,
          // The mock registry has no poster records (see
          // `volunteerDemoPoster.ts`), so there is nobody to address.
          poster: null,
          mySignup: false,
          hasTeam: (opp?.team.length ?? 0) > 0,
        };
      }
      const dto = await getOpportunity(slug!);
      return {
        opportunity: detailToOpportunity(dto),
        spotsFilled: dto.spotsFilled,
        spotsTotal: dto.spotsTotal,
        isFull: dto.spotsFilled >= dto.spotsTotal,
        status: dto.status,
        canReviewApplicants: dto.canReviewApplicants,
        canEditOpportunity: dto.canEditOpportunity,
        poster: memberRefToPerson(dto.poster),
        mySignup: dto.mySignup,
        // A backend without `hasTeam` yet keeps the earlier rule: the prompt
        // showed under any team intro.
        hasTeam: dto.hasTeam ?? (dto.team.length > 0 || Boolean(dto.teamIntro)),
      };
    },
  });
}
