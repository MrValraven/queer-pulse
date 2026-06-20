import { routes } from '../../app/routeMap'

export interface SimFlow {
  title: string
  desc: string
  to: string
}

export const SIM_GROUPS: { label: string; flows: SimFlow[] }[] = [
  {
    label: 'Onboarding',
    flows: [
      {
        title: 'Invite flow',
        desc: 'Start from the invite landing page — the first screen someone sees when they open an invitation link.',
        to: routes.inviteLanding,
      },
    ],
  },
]
