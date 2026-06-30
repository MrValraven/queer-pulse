import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { usePrefersReducedMotion } from '../../shared/hooks'
import { useInvite } from '../auth/api/useInvite'
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
  const { data: invite, isLoading, isError } = useInvite(code)

  const [phase, setPhase] = useState<Phase>('sealed')
  const [step, setStep] = useState(0)
  const [joined, setJoined] = useState(false)

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

  if (phase === 'sealed') return <InviteSealedView view={invite} onOpen={openInvitation} />
  if (phase === 'opening') return <InviteOpeningView view={invite} step={step} />

  return <InviteCardView view={invite} onGoogle={() => setJoined(true)} />
}
