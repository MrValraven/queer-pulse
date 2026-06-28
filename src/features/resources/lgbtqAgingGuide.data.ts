export interface Topic {
  title: string
  body: string
}

export interface ExternalLink {
  label: string
  note: string
  href: string
}

export const TOPICS: Topic[] = [
  { title: 'Finding a GP who doesn\'t make it weird', body: 'You are allowed to ask a Centro de Saúde to note your pronouns and partner, and to switch GP if one is dismissive. Bring a written summary of your history so you are not explaining your life from scratch each visit.' },
  { title: 'Hospitals and specialist referrals', body: 'Next-of-kin assumptions still trip up same-sex partners in hospital settings. A simple signed document naming your partner as your contact and decision-maker prevents most problems before they start.' },
  { title: 'Elder care and housing', body: 'Ask any care facility directly about their experience with LGBTQ+ residents and same-sex couples. The good ones answer plainly; the answer itself tells you most of what you need to know.' },
  { title: 'Mental health in later life', body: 'Isolation and a lifetime of guardedness take a toll. Affirming therapy exists at every age, and the elders group keeps a short list of practitioners who understand the particular history you carry.' },
]

export const LINKS: ExternalLink[] = [
  { label: 'ILGA Portugal — services', note: 'Support, legal help, and community programmes including for older LGBTQ+ people.', href: 'https://ilga-portugal.pt' },
  { label: 'SNS 24 health line', note: '808 24 24 24 · 24h national health line for triage and advice.', href: 'https://www.sns24.gov.pt' },
]
