/** "What happens next" reassurance shown on the request-invite confirmation. */
export interface NextStep {
  title: string
  body: string
}

export const WHAT_NEXT: NextStep[] = [
  {
    title: 'A real person reads it',
    body: 'No algorithm, no waitlist score — a member of the community looks at every request.',
  },
  {
    title: 'We look for a connection',
    body: 'If someone already here can vouch for you, that’s the surest way in. Naming a mutual helps.',
  },
  {
    title: 'You hear back either way',
    body: 'We’ll email you whatever we decide, usually within a couple of weeks. No chasing needed.',
  },
]
