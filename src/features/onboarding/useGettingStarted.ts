import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { useProfileData } from "../../app/providers/useProfile";
import { useMyCommunities } from "../communities/api/useMyCommunities";
import { useSubprofiles } from "../subprofiles/api/useSubprofiles";
import { usePublicEligibilitySignals } from "../members/api/usePublicEligibilitySignals";
import { GETTING_STARTED_STEPS, type GettingStartedStep } from "./gettingStarted.data";

export interface GettingStartedStepState extends GettingStartedStep {
  /** Auto-detected from real account data — never ticked by hand. */
  done: boolean;
}

export interface GettingStartedState {
  steps: GettingStartedStepState[];
  completedCount: number;
  totalCount: number;
  allDone: boolean;
  /**
   * True while the eligibility signals (vouch / connect / post) are still being
   * fetched. Those three rows read as "still to do" until they resolve, so the
   * page can surface a quiet "checking…" note rather than briefly understating
   * progress for a member who has, in fact, already done them.
   */
  loading: boolean;
}

/**
 * Auto-detects which "Getting started" steps a member has already done, from
 * data the app already holds — their profile, memberships, personas, and the
 * eligibility-signal counts. Nothing is persisted or manually ticked: the list
 * simply reflects reality.
 *
 * Shared by the page and the account-menu badge. The eligibility fetch is gated
 * exactly like `usePersonaBadge` (live, signed-in, active) so mounting the badge
 * on any page never fires `GET /me/public-eligibility` for a logged-out visitor
 * or a pending/suspended member. Demo mode reads the same hooks against fixtures,
 * but the surface is live-only so the badge and page never render there.
 */
export function useGettingStarted(): GettingStartedState {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, status } = useAuth();
  const { profile } = useProfileData();
  const memberships = useMyCommunities();

  // The same settled-and-active guard the persona badge uses. `/subprofiles/mine`
  // sits behind ActiveMemberGuard and `/me/public-eligibility` is live-only.
  const sessionReady = !checking && loggedIn && status === "active";
  const canReadMock = demoMode || sessionReady;
  const canFetchSignals = !demoMode && sessionReady;

  const { data: personas } = useSubprofiles({
    enabled: canReadMock,
    retry: false,
  });
  const signalsQuery = usePublicEligibilitySignals(canFetchSignals);
  const signals = signalsQuery.data;

  const doneByKey: Record<string, boolean> = {
    profile: Boolean(profile.photo) && profile.bio.trim().length > 0,
    community: Object.keys(memberships).length > 0,
    persona: (personas?.length ?? 0) > 0,
    // `vouchCount` is the INBOUND side of the trust graph (vouches this member
    // received) and ticks itself the instant an invite-vouched member lands
    // on the page, having never vouched for anyone themselves. This step is
    // "vouch for someone else", so it must read the OUTBOUND count instead.
    vouch: (signals?.vouchesGivenCount ?? 0) > 0,
    connect: (signals?.connectionCount ?? 0) > 0,
    post: (signals?.communityPosts ?? 0) > 0,
  };

  const steps: GettingStartedStepState[] = GETTING_STARTED_STEPS.map((step) => ({
    ...step,
    done: doneByKey[step.key] ?? false,
  }));
  const completedCount = steps.filter((step) => step.done).length;
  const totalCount = steps.length;

  return {
    steps,
    completedCount,
    totalCount,
    allDone: completedCount === totalCount,
    loading: canFetchSignals && !signals && signalsQuery.isLoading,
  };
}
