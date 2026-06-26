export interface MinutesResolution {
  ref: string
  title: string
  outcome: 'Passed' | 'Rejected' | 'Tabled'
  tally: string
}

export interface MinutesAgendaItem {
  time: string
  title: string
  note: string
}

export interface AssemblyMinutes {
  year: string
  date: string
  location: string
  chair: string
  secretary: string
  quorum: string
  attendeesInPerson: number
  attendeesOnline: number
  votesCast: number
  summary: string
  agenda: MinutesAgendaItem[]
  resolutions: MinutesResolution[]
  actions: string[]
}

export const MINUTES: Record<string, AssemblyMinutes> = {
  '2025': {
    year: '2025',
    date: 'Saturday 15 — Sunday 16 November 2025',
    location: 'Atelier Pulso, Mouraria, Lisbon (+ video link)',
    chair: 'Marta Reis',
    secretary: 'Catarina Vaz',
    quorum: '184 votes required · 312 cast · quorum met',
    attendeesInPerson: 96,
    attendeesOnline: 218,
    votesCast: 312,
    summary:
      'The fifth Annual Assembly ratified eleven resolutions, of which nine passed. The §06 off-platform conduct clause was added for the first time, the Porto launch was green-lit for August 2026, and the solidarity (free) rate was codified as permanent and non-revocable.',
    agenda: [
      { time: '10:00', title: 'Welcome & ground rules', note: 'Marta opened. Quorum confirmed at 312 votes.' },
      { time: '10:30', title: '2025 review · co-treasurers', note: 'Catarina & André walked the transparency report. No objections raised.' },
      { time: '11:30', title: 'Resolutions 1–4 · budget & reserves', note: 'All four budget items carried.' },
      { time: '14:30', title: 'Resolutions 5–7 · code & manifesto', note: '§06 off-platform clause adopted; manifesto stanza 4 reworded.' },
      { time: '16:00', title: 'Open floor · expansion to Porto', note: 'Discussion only. Strong support; host circle to be formed.' },
      { time: 'Day 2 · 10:00', title: 'Resolutions 8–11 · circles & partners', note: 'Standing-circle terms set; Clínica do Largo partnership approved.' },
      { time: 'Day 2 · 14:00', title: 'Tallying, ratification & close', note: 'Results read out, resolutions signed, assembly closed at 15:10.' },
    ],
    resolutions: [
      { ref: 'R·01', title: 'Approve 2027 budget (€312k)', outcome: 'Passed', tally: '243 yes · 37 no · 32 abstain' },
      { ref: 'R·02', title: 'Raise micro-grant cap to €300', outcome: 'Passed', tally: '258 yes · 19 no · 32 abstain' },
      { ref: 'R·03', title: 'Set 2027 reserve target (six months)', outcome: 'Passed', tally: '253 yes · 28 no · 31 abstain' },
      { ref: 'R·04', title: 'Renew ILGA Portugal partnership', outcome: 'Passed', tally: '281 yes · 9 no · 22 abstain' },
      { ref: 'R·05', title: 'Code of Conduct v2.2 · §06 off-platform clause', outcome: 'Passed', tally: '192 yes · 67 no · 53 abstain (60% met)' },
      { ref: 'R·06', title: 'New §06 clause · data minimisation', outcome: 'Passed', tally: '221 yes · 44 no · 47 abstain' },
      { ref: 'R·07', title: 'Manifesto · stanza 4 wording', outcome: 'Passed', tally: '274 yes · 16 no · 22 abstain' },
      { ref: 'R·08', title: 'Standing-circle terms (12 months)', outcome: 'Passed', tally: '237 yes · 41 no · 34 abstain' },
      { ref: 'R·09', title: 'New partner · Clínica do Largo', outcome: 'Passed', tally: '265 yes · 19 no · 28 abstain' },
      { ref: 'R·10', title: 'Porto launch budget release (€40k)', outcome: 'Tabled', tally: 'Deferred pending host circle of five' },
      { ref: 'R·11', title: 'Solidarity rate · keep free tier permanent', outcome: 'Passed', tally: '293 yes · 6 no · 13 abstain' },
    ],
    actions: [
      'Co-treasurers to publish the signed 2027 budget within 14 days.',
      'A Porto host circle of at least five members to be convened before R·10 returns.',
      'Code of Conduct v2.2 to be republished with the §06 and data-minimisation clauses.',
      'Next Annual Assembly provisionally set for 14–15 November 2026.',
    ],
  },
  '2024': {
    year: '2024',
    date: 'Saturday 16 November 2024',
    location: 'Café Beirão back room, Lisbon (+ video link)',
    chair: 'Marta Reis',
    secretary: 'André Bento',
    quorum: '150 votes required · 241 cast · quorum met',
    attendeesInPerson: 72,
    attendeesOnline: 169,
    votesCast: 241,
    summary:
      'The fourth Annual Assembly was the first to ratify the Code of Conduct. Eight resolutions were tabled and seven passed. Sustainer pricing was set at €96/year.',
    agenda: [
      { time: '10:00', title: 'Welcome & quorum', note: 'André opened. Quorum confirmed at 241 votes.' },
      { time: '11:00', title: 'Code of Conduct · first ratification', note: 'Adopted after two amendments from the floor.' },
      { time: '14:00', title: 'Budget & Sustainer pricing', note: 'Sustainer rate set at €96/year.' },
      { time: '16:30', title: 'Tallying & close', note: 'Seven of eight resolutions passed. Closed at 17:20.' },
    ],
    resolutions: [
      { ref: 'R·01', title: 'Ratify the Code of Conduct v1.0', outcome: 'Passed', tally: '198 yes · 21 no · 22 abstain' },
      { ref: 'R·02', title: 'Set Sustainer pricing at €96/year', outcome: 'Passed', tally: '210 yes · 14 no · 17 abstain' },
      { ref: 'R·03', title: 'Establish the micro-grants fund', outcome: 'Passed', tally: '224 yes · 6 no · 11 abstain' },
      { ref: 'R·04', title: 'Approve 2025 budget', outcome: 'Passed', tally: '201 yes · 19 no · 21 abstain' },
      { ref: 'R·05', title: 'Adopt the safe-spaces verification standard', outcome: 'Passed', tally: '219 yes · 8 no · 14 abstain' },
      { ref: 'R·06', title: 'Create the rotating grants circle', outcome: 'Passed', tally: '205 yes · 16 no · 20 abstain' },
      { ref: 'R·07', title: 'Mandate annual independent audit', outcome: 'Passed', tally: '231 yes · 3 no · 7 abstain' },
      { ref: 'R·08', title: 'Cap membership growth target', outcome: 'Rejected', tally: '101 yes · 118 no · 22 abstain' },
    ],
    actions: [
      'Publish the ratified Code of Conduct v1.0 to all members.',
      'Stand up the micro-grants fund and rotating circle by Q1 2025.',
      'Commission the first independent audit for the 2024 financial year.',
    ],
  },
}

export const MINUTES_FALLBACK_YEAR = '2025'
