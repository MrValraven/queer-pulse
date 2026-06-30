import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { usePrefersReducedMotion } from '../../shared/hooks'
import { useToast } from '../../shared/components/feedback/useToast'
import { useAuth } from '../../app/providers/authContext'
import { useDemoMode } from '../../app/providers/DemoModeProvider'
import { useInvite } from '../auth/api/useInvite'
import { useAcceptInvite } from '../auth/api/useAcceptInvite'
import { rememberInviteWelcome, rememberPendingInvite } from '../auth/api/pendingInvite'
import { OnboardingPage } from '../auth/OnboardingPage'
import { InviteExpiredPage } from './InviteExpiredPage'
import { loaderSteps } from './inviteLanding.data'
import {
  InviteCardView,
  InviteLoadingView,
  InviteOpeningView,
  InviteSealedView,
} from './InviteLandingViews'

type Phase = 'sealed' | 'opening' | 'invite'

export function InviteLandingPage() {
  const { code } = useParams<{ code: string }>()
  const prefersReduced = usePrefersReducedMotion()
  const { showToast } = useToast()
  const { signIn } = useAuth()
  const { demoMode } = useDemoMode()
  const { data: invite, isLoading, isError } = useInvite(code)
  const acceptInvite = useAcceptInvite()

  const [phase, setPhase] = useState<Phase>('sealed')
  const [step, setStep] = useState(0)
  const [joined, setJoined] = useState(false)

  // Once a valid invite resolves, stash what the join flow needs to survive the
  // hop into onboarding: the code (to redeem) and the welcome payload (inviter +
  // vouch), since the in-memory invite is gone after a full-page auth redirect.
  const validInvite = invite?.status === 'valid' ? invite : undefined
  useEffect(() => {
    if (!validInvite) return
    rememberPendingInvite(validInvite.code)
    rememberInviteWelcome({
      vouch: validInvite.vouch,
      inviter: {
        name: validInvite.inviter.name,
        firstName: validInvite.inviter.firstName,
        initials: validInvite.inviter.initials,
        since: validInvite.inviter.since,
        photo: validInvite.inviter.photo,
      },
    })
  }, [validInvite])

  // Decorative unsealing: advance the loader steps, then reveal the opened card.
  useEffect(() => {
    if (phase !== 'opening' || !invite) return
    const stepMs = 800
    const total = loaderSteps(invite.inviter.firstName).length
    const timers = Array.from({ length: total }, (_, i) =>
      window.setTimeout(() => setStep(i), i * stepMs),
    )
    const done = window.setTimeout(() => setPhase('invite'), total * stepMs + 350)
    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(done)
    }
  }, [phase, invite])

  // While GET /invites/:code resolves the inviter.
  if (isLoading) return <InviteLoadingView />

  // Bad, used, expired or revoked code → the expired/invalid screen.
  if (isError || !invite || invite.status !== 'valid') return <InviteExpiredPage />

  if (joined) return <OnboardingPage />

  function openInvitation() {
    setPhase(prefersReduced ? 'invite' : 'opening')
  }

  // "Register with Google" authenticates through the same OAuth call the sign-in
  // page uses. Live mode → a real /auth/google redirect carrying the invite code
  // (so the backend redeems it during signup — a new Google user with no invite
  // is rejected) and a redirect into /onboarding on return. Demo mode has no real
  // Google, so redeem now and reveal onboarding inline, as the prototype does.
  async function joinWithGoogle() {
    if (!demoMode) {
      signIn('/onboarding', invite!.code)
      return
    }
    try {
      await acceptInvite.mutateAsync(invite!.code)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not redeem this invite', 'error')
    }
    setJoined(true)
  }

  if (phase === 'sealed') return <InviteSealedView view={invite} onOpen={openInvitation} />
  if (phase === 'opening') return <InviteOpeningView view={invite} step={step} />

  return <InviteCardView view={invite} onGoogle={joinWithGoogle} />
}
