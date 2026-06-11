export interface Entry {
  kicker: string
  titleHtml: string
  dek: string
  bylineHtml: string
  page: string
}

export const TOC: { heading: string; entries: Entry[] }[] = [
  {
    heading: 'Cover story',
    entries: [
      {
        kicker: 'Cover · 14 min read',
        titleHtml: "Five things I learned <em>navigating Lisbon's trans health system.</em>",
        dek: 'From the SNS to private clinics, what nobody tells you about waiting lists, referrals, and how to actually get a hormone prescription without losing a year of your life.',
        bylineHtml: 'By <b>Sara Pinheiro</b> · illustrated by André Bento',
        page: '04',
      },
    ],
  },
  {
    heading: 'Features',
    entries: [
      { kicker: 'Reportage · 11 min', titleHtml: 'Inside the back room of <em>Café Beirão.</em>', dek: "How a monthly open clinic became Lisbon's quietest piece of mutual-aid infrastructure.", bylineHtml: 'By <b>Jonas Ferreira</b>', page: '18' },
      { kicker: 'Interview · 9 min', titleHtml: "Dr. Inês Pereira on <em>fifteen minutes of someone else's time.</em>", dek: 'The Anjos GP who treats trans patients as adults — and changed the protocol for an entire clinic.', bylineHtml: 'Interview by <b>Sara Pinheiro</b>', page: '28' },
      { kicker: 'Essay · 7 min', titleHtml: 'The waiting room is <em>also part of the treatment.</em>', dek: 'On chairs, lighting, music, and what design does to a body waiting to be seen.', bylineHtml: 'By <b>Luísa Gomes</b> · photographs by André Bento', page: '36' },
      { kicker: 'Long read · 22 min', titleHtml: 'A history of the lifeline, <em>1995–2025.</em>', dek: "Three decades of ILGA Portugal's helpline, told through the calls operators remember and the ones they can't.", bylineHtml: 'By <b>Catarina Vaz</b>', page: '44' },
    ],
  },
  {
    heading: 'Profiles',
    entries: [
      { kicker: 'Profile · 6 min', titleHtml: 'The pharmacist who fills <em>every prescription.</em>', dek: "Rui from Farmácia do Carmo doesn't ask follow-up questions. He has reasons.", bylineHtml: 'By <b>Tomás Mendes</b>', page: '58' },
      { kicker: 'Profile · 7 min', titleHtml: 'Twenty years in a hospital corridor.', dek: "A nurse on what's changed, what hasn't, and what she still does anyway.", bylineHtml: 'By <b>Anika Kovač</b>', page: '64' },
    ],
  },
]

export const CONTRIBUTORS = [
  { initials: 'SP', name: 'Sara Pinheiro', role: 'Health & access' },
  { initials: 'JF', name: 'Jonas Ferreira', role: 'Reportage' },
  { initials: 'LG', name: 'Luísa Gomes', role: 'Essays' },
  { initials: 'CV', name: 'Catarina Vaz', role: 'Long reads' },
  { initials: 'TM', name: 'Tomás Mendes', role: 'Profiles' },
  { initials: 'AK', name: 'Anika Kovač', role: 'Profiles' },
  { initials: 'AB', name: 'André Bento', role: 'Illustration' },
  { initials: 'MR', name: 'Marta Reis', role: 'Editor in chief' },
]
