import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../app/providers/useCommunityMembership";
import {
  joinOutcomeOf,
  joinRefusalFor,
  type JoinRefusal,
} from "../communities/api/communityJoin.api";
import {
  useCommunityRules,
  useJoinCommunityWithRules,
} from "../communities/api/useCommunityJoin";
import { useLeaveCommunity } from "../communities/api/useCommunityMutations";
import { getLiving } from "../communities/livingCommunities.data";
import type { Community } from "../homepage/data/types";

export type OnboardingJoinStatus = "idle" | "joined" | "requested";

/** One line under the card's button. Held as a catalog key so a namespace that
 *  is still loading fills in on the next render. `success` is announced to
 *  screen readers only: the button's check and label already show it. */
export interface OnboardingJoinMessage {
  key: string;
  values?: Record<string, string>;
  tone: "success" | "info" | "error";
}

const GENERIC_ERROR_KEY = "communities:join.about.errorFallback";

/** The one-line catalog key for each coded refusal the card can show inline.
 *  `rulesChanged` is absent because it reopens the wizard. */
const REFUSAL_MESSAGE_KEYS: Record<
  Exclude<JoinRefusal["kind"], "rulesChanged">,
  string
> = {
  banned: "communities:join.refusal.banned.title",
  reapplyTooSoon: "communities:join.refusal.reapply.title",
  inviteRequired: "communities:detail.join.inviteOnlyHint",
  frozen: "communities:detail.frozen.title",
  alreadyPending: "communities:join.refusal.pending.title",
  parentRequired: "communities:join.refusal.parent.title",
};

/**
 * The join and leave logic behind one onboarding suggestion card.
 *
 * A community with house rules refuses a join that does not carry the rules
 * version the member agreed to, so the one-tap join is kept for the case where
 * the rules are KNOWN to be empty on a public community. Every other case
 * (rules still loading, a failed rules read, rules present, a gated tier)
 * opens the join wizard, which shows the rules, sends the version and renders
 * each refusal itself.
 *
 * The one-tap path waits for the server before it shows anything: the answer
 * can be a hold for review (a second-vouch gate, a ban-evasion match) or an
 * invitation wall, and a flash of "joined" that then snaps back told the
 * member nothing.
 */
export function useOnboardingCommunityJoin(community: Community) {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const membership = useCommunityMembership();
  const queryClient = useQueryClient();
  const slug = community.slug ?? "";
  const rulesState = useCommunityRules(slug);
  const joinMutation = useJoinCommunityWithRules(slug);
  const leaveMutation = useLeaveCommunity(slug);

  // Live seeds from the card's own role; demo cards carry none and read the
  // session membership store, the same branch the discover grid uses.
  const [status, setStatus] = useState<OnboardingJoinStatus>(() => {
    if (demoMode && slug) {
      if (membership.isMember(slug)) return "joined";
      if (membership.hasRequested(slug)) return "requested";
      return "idle";
    }
    return community.myRole ? "joined" : "idle";
  });
  const [message, setMessage] = useState<OnboardingJoinMessage | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // The same tier the join wizard would open on: demo reads the living
  // registry, live trusts the card DTO.
  const tier =
    (demoMode ? getLiving(slug)?.accessTier : undefined) ??
    community.accessTier ??
    (community.privateBadge ? "private" : "public");
  // Live rules are known only once the read has landed. A pending or failed
  // read reports no rules, which is indistinguishable from a community that
  // truly has none, so the cached answer itself is the proof.
  const isRulesKnown =
    demoMode ||
    queryClient.getQueryData(["community-rules", slug]) !== undefined;
  const shouldOpenWizard =
    !isRulesKnown || rulesState.hasRules || tier !== "public";
  const isBusy = joinMutation.isPending || leaveMutation.isPending;
  const nameValues = { name: community.name };

  const markJoined = () => {
    setStatus("joined");
    setMessage({
      key: "auth:onboarding.stepCommunities.joinedAnnouncement",
      values: nameValues,
      tone: "success",
    });
  };

  const markRequested = () => {
    setStatus("requested");
    setMessage({
      key: "auth:onboarding.stepCommunities.requestedNotice",
      values: nameValues,
      tone: "info",
    });
  };

  const showRefusal = (error: unknown) => {
    const refusal = joinRefusalFor(error);
    if (!refusal) {
      setMessage({ key: GENERIC_ERROR_KEY, tone: "error" });
    } else if (refusal.kind === "rulesChanged") {
      // Rules exist after all: re-read them and let the wizard ask.
      rulesState.refetch();
      setIsWizardOpen(true);
    } else if (refusal.kind === "alreadyPending") {
      // An existing request means the card was stale, so it says so too.
      // Nothing went wrong for the member, so the line reads as news.
      setStatus("requested");
      setMessage({ key: REFUSAL_MESSAGE_KEYS.alreadyPending, tone: "info" });
    } else {
      setMessage({ key: REFUSAL_MESSAGE_KEYS[refusal.kind], tone: "error" });
    }
  };

  const join = async () => {
    if (shouldOpenWizard) {
      setIsWizardOpen(true);
      return;
    }
    try {
      const outcome = joinOutcomeOf(await joinMutation.mutateAsync({}));
      if (outcome === "invite_required") {
        setMessage({ key: REFUSAL_MESSAGE_KEYS.inviteRequired, tone: "info" });
      } else if (outcome === "requested") {
        markRequested();
      } else {
        // `joined`, or demo's `null`, which has no server to hold it.
        if (demoMode && slug) membership.join(slug);
        markJoined();
      }
    } catch (error) {
      showRefusal(error);
    }
  };

  // Self-leave passes the caller's own member slug; demo's mutation is a
  // no-op, so the session membership store is updated here as well.
  const leave = async () => {
    setStatus("idle");
    try {
      await leaveMutation.mutateAsync({
        memberSlug: user?.profile.slug ?? "",
      });
      if (demoMode && slug) membership.leave(slug);
      setMessage({
        key: "auth:onboarding.stepCommunities.leftAnnouncement",
        values: nameValues,
        tone: "success",
      });
    } catch {
      setStatus("joined");
      setMessage({ key: GENERIC_ERROR_KEY, tone: "error" });
    }
  };

  const handleTap = async () => {
    if (isBusy) return;
    setMessage(null);
    if (status === "joined") await leave();
    else if (status === "idle") await join();
  };

  return {
    status,
    message,
    isJoining: joinMutation.isPending,
    isBusy,
    isWizardOpen,
    handleTap,
    closeWizard: () => setIsWizardOpen(false),
    markJoined,
    markRequested,
  };
}
