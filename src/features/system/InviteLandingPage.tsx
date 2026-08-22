import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { SystemStateShell } from "../../shared/components/layout";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useInvite } from "../auth/api/useInvite";
import { rememberInviteWelcome } from "../auth/api/pendingInvite";
import { OnboardingPage } from "../auth/OnboardingPage";
import { Under18Notice } from "../auth/Under18Notice";
import { TermsModal } from "../marketing/TermsModal";
import { PrivacyModal } from "../marketing/PrivacyModal";
import { InviteExpiredPage } from "./InviteExpiredPage";
import { buildLoaderSteps } from "./inviteLanding.data";
import {
  InviteCardView,
  InviteLoadingView,
  InviteOpeningView,
  InviteSealedView,
} from "./InviteLandingViews";

type Phase = "sealed" | "opening" | "invite";

export function InviteLandingPage() {
  const { code } = useParams<{ code: string }>();
  const prefersReduced = usePrefersReducedMotion();
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const { demoMode } = useDemoMode();
  const { data: invite, isLoading, isError } = useInvite(code);

  const [phase, setPhase] = useState<Phase>("sealed");
  const [step, setStep] = useState(0);
  const [joined, setJoined] = useState(false);
  // 18+ self-attestation (Terms §eligibility). The backend REJECTS a new account
  // without it, so the Google button stays locked until the box is ticked.
  const [is18, setIs18] = useState(false);
  const [under18, setUnder18] = useState(false);
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(
    null,
  );

  // Once a valid invite resolves, stash what the join flow needs to survive the
  // hop into onboarding: the code (to redeem) and the welcome payload (inviter +
  // vouch), since the in-memory invite is gone after a full-page auth redirect.
  // An inviter who's no longer active never counts as joinable, even if the
  // status is still `valid` — so we don't stash a join off a ghost.
  const validInvite =
    invite?.status === "valid" && invite.inviterActive !== false
      ? invite
      : undefined;
  useEffect(() => {
    if (!validInvite) return;
    rememberInviteWelcome({
      vouch: validInvite.vouch,
      inviter: {
        name: validInvite.inviter.name,
        firstName: validInvite.inviter.firstName,
        initials: validInvite.inviter.initials,
        since: validInvite.inviter.since,
        photo: validInvite.inviter.photo,
      },
    });
  }, [validInvite]);

  // Decorative unsealing: advance the loader steps, then reveal the opened card.
  useEffect(() => {
    if (phase !== "opening" || !invite) return;
    const stepMs = 800;
    const total = buildLoaderSteps(t, invite.inviter.firstName).length;
    const timers = Array.from({ length: total }, (_, i) =>
      window.setTimeout(() => setStep(i), i * stepMs),
    );
    const done = window.setTimeout(
      () => setPhase("invite"),
      total * stepMs + 350,
    );
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [phase, invite, t]);

  // While GET /invites/:code resolves the inviter.
  if (isLoading) return <InviteLoadingView />;

  // Bad, used, expired or revoked code — or a valid code whose inviter is no
  // longer active — → the tailored invite-state screen (reasonFromInvite picks
  // the right copy, including the "inviter inactive" state).
  if (
    isError ||
    !invite ||
    invite.status !== "valid" ||
    invite.inviterActive === false
  )
    return <InviteExpiredPage invite={invite ?? undefined} />;

  if (joined) return <OnboardingPage />;

  // Someone told us they're not 18 yet — the humane block, never a dead end.
  // Under18Notice is a bare panel, so it needs the same frame the expired-invite
  // state uses to sit correctly on the page.
  if (under18)
    return (
      <SystemStateShell>
        <Under18Notice
          onBack={() => setUnder18(false)}
          backLabel={t("system:inviteLanding.card.under18BackLabel")}
        />
      </SystemStateShell>
    );

  function openInvitation() {
    setPhase(prefersReduced ? "invite" : "opening");
  }

  // "Register with Google" authenticates through the same OAuth call the sign-in
  // page uses. Live mode → a real /auth/google redirect carrying the invite code
  // (so the backend redeems it during signup — a new Google user with no invite
  // is rejected), the 18+ attestation (likewise rejected without it), and a
  // redirect into /onboarding on return.
  function joinWithGoogle() {
    // Belt-and-braces: the button is disabled until `is18`, but never hand the
    // backend a signup it will bounce.
    if (!is18) return;
    if (!demoMode) {
      signIn("/onboarding", invite!.code, true);
      return;
    }
    // Demo has no real Google and no network. This used to call the invite
    // accept endpoint, which never did anything here (its demo branch resolved
    // ok without a request) and no longer exists — sign-up is now the single
    // redemption point. Just reveal onboarding, as the prototype does.
    setJoined(true);
  }

  if (phase === "sealed")
    return <InviteSealedView view={invite} onOpen={openInvitation} />;
  if (phase === "opening")
    return <InviteOpeningView view={invite} step={step} />;

  return (
    <>
      <InviteCardView
        view={invite}
        onGoogle={joinWithGoogle}
        is18={is18}
        onIs18Change={setIs18}
        onUnder18={() => setUnder18(true)}
        onOpenTerms={() => setLegalModal("terms")}
        onOpenPrivacy={() => setLegalModal("privacy")}
      />
      {legalModal === "terms" && (
        <TermsModal onClose={() => setLegalModal(null)} />
      )}
      {legalModal === "privacy" && (
        <PrivacyModal onClose={() => setLegalModal(null)} />
      )}
    </>
  );
}
