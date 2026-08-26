import type { PartnerApplicationDTO } from "./partners.api";

const DAY_MS = 86_400_000;

/**
 * The OPS-04 due date as an offset from right now, the same way
 * `joinRequests.data.ts` builds its own. A frozen ISO string would read as
 * overdue forever once the date passed, and the queue needs to show a late
 * application AND applications with time left whenever the demo is opened.
 */
function dueDaysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString();
}

/**
 * A small mock queue of PENDING applications for demo mode, so the admin triage
 * view has something to render without a backend. Plain strings throughout (no
 * JSX) — these are raw DTOs, adapted for display by `applicationToView`.
 *
 * OPS-04 gave this queue a clock and an assignee, so the fixture covers all
 * three states a reviewer has to be able to tell apart: one application past
 * its due date and unclaimed, ones with time left, and one a colleague is
 * already holding (which offers no claim button, by design).
 */
export const MOCK_PARTNER_APPLICATIONS: PartnerApplicationDTO[] = [
  {
    id: "app-casa-arco",
    slug: "casa-arco",
    name: "Casa Arco",
    logo: "CA",
    region: "pt",
    regionLabel: "Portugal",
    city: "Porto",
    desc: "A queer-run community kitchen and drop-in in Porto, offering warm meals, a warm room, and a soft landing for people between housing.",
    tags: ["Housing", "Food", "Drop-in"],
    featured: false,
    testimonialQuote: null,
    testimonialAuthor: null,
    testimonialRole: null,
    tier: "Community partner",
    since: "Applying · 2026",
    eyebrow: "Partner · Community drop-in",
    tagline:
      "A community kitchen that decided nobody in Porto should be cold or hungry while they wait for a queer-safe bed.",
    about: [
      "Casa Arco runs a nightly community kitchen and a daytime drop-in, staffed almost entirely by volunteers who've been through the door themselves.",
    ],
    stats: [{ value: "2023", label: "Opened" }],
    aboutMore: [],
    jointWork: [],
    timeline: [],
    how: [],
    funding:
      "Volunteer-run; funded by neighbourhood donations and small grants.",
    atGlance: [
      { label: "Type", value: "Community kitchen" },
      { label: "HQ", value: "Porto" },
    ],
    contact: {
      phone: null,
      phoneNote: null,
      email: "ola@casaarco.pt",
      website: "casaarco.pt",
      address: "Rua de Santa Catarina, Porto",
    },
    status: "pending",
    submittedBy: {
      slug: "marta-luis",
      firstName: "Marta",
      lastName: "Luís",
      avatarUrl: null,
    },
    reviewNote: null,
    createdAt: "2026-07-02T09:14:00.000Z",
    // Past due and nobody has picked it up: the case OPS-04 exists for.
    assignedStaffId: null,
    dueAt: dueDaysFromNow(-6),
  },
  {
    id: "app-transfeminist-fund",
    slug: "transfeminist-mutual-fund",
    name: "Transfeminist Mutual Fund",
    logo: "TMF",
    region: "eu",
    regionLabel: "Europe",
    city: "Barcelona",
    desc: "A member-run mutual-aid fund covering surgery travel, binders, and legal fees for trans people across the Iberian peninsula.",
    tags: ["Trans care", "Mutual aid", "Funder"],
    featured: false,
    testimonialQuote: null,
    testimonialAuthor: null,
    testimonialRole: null,
    tier: "Solidarity partner",
    since: "Applying · 2026",
    eyebrow: "Partner · Mutual-aid fund",
    tagline:
      "Small money in trans hands, fast. No gatekeeping letters, no waiting for a grant cycle.",
    about: [
      "The Transfeminist Mutual Fund pools monthly member contributions and disburses micro-grants decided by a rotating trans committee.",
    ],
    stats: [{ value: "2022", label: "Founded" }],
    aboutMore: [],
    jointWork: [],
    timeline: [],
    how: [],
    funding: "Member contributions and a small solidarity reserve.",
    atGlance: [
      { label: "Type", value: "Mutual-aid fund" },
      { label: "Reach", value: "Iberian peninsula" },
    ],
    contact: {
      phone: null,
      phoneNote: null,
      email: "hola@transfeministfund.org",
      website: "transfeministfund.org",
      address: null,
    },
    status: "pending",
    submittedBy: null,
    reviewNote: null,
    createdAt: "2026-06-28T16:40:00.000Z",
    // Held by a colleague, so the card names them and offers no button:
    // taking a row out of somebody's hands is a conversation, not a click.
    assignedStaffId: "staff-ines",
    assignedStaffName: "Inês Duarte",
    dueAt: dueDaysFromNow(2),
  },
  {
    id: "app-radio-fervor",
    slug: "radio-fervor",
    name: "Rádio Fervor",
    logo: "RF",
    region: "pt",
    regionLabel: "Portugal",
    city: "Lisbon",
    desc: "A volunteer-run community radio station with a nightly queer programming block, broadcast from a converted garage in Marvila.",
    tags: ["Media", "Culture", "Volunteer-run"],
    featured: false,
    testimonialQuote: null,
    testimonialAuthor: null,
    testimonialRole: null,
    tier: "Culture partner",
    since: "Applying · 2026",
    eyebrow: "Partner · Community radio",
    tagline:
      "Four hours a night where the city hears itself, hosted by people the mainstream stations never called back.",
    about: [
      "Rádio Fervor went on air in 2021 with one transmitter and a rota of eleven hosts. The queer block runs Monday to Thursday and is the only one of its kind broadcasting in Portuguese.",
    ],
    stats: [{ value: "2021", label: "On air" }],
    aboutMore: [],
    jointWork: [],
    timeline: [],
    how: [],
    funding: "Listener donations and a municipal culture grant.",
    atGlance: [
      { label: "Type", value: "Community radio" },
      { label: "HQ", value: "Lisbon" },
    ],
    contact: {
      phone: null,
      phoneNote: null,
      email: "estudio@radiofervor.pt",
      website: "radiofervor.pt",
      address: "Rua do Açúcar, Lisbon",
    },
    status: "pending",
    submittedBy: {
      slug: "nuno-cardoso",
      firstName: "Nuno",
      lastName: "Cardoso",
      avatarUrl: null,
    },
    reviewNote: null,
    createdAt: "2026-07-08T11:05:00.000Z",
    // Time left and unclaimed: the ordinary state, and the one the claim
    // button is offered on.
    assignedStaffId: null,
    dueAt: dueDaysFromNow(5),
  },
  {
    id: "app-ponto-seguro",
    slug: "ponto-seguro",
    name: "Ponto Seguro",
    logo: "PS",
    region: "pt",
    regionLabel: "Portugal",
    city: "Coimbra",
    desc: "A student-founded drop-in offering peer support, a quiet room, and referrals for LGBTQ+ students in Coimbra.",
    tags: ["Peer support", "Students", "Drop-in"],
    featured: false,
    testimonialQuote: null,
    testimonialAuthor: null,
    testimonialRole: null,
    tier: "Community partner",
    since: "Applying · 2026",
    eyebrow: "Partner · Student drop-in",
    tagline:
      "A room with a door that closes, five minutes from the faculty, staffed by people who have sat in the same chair.",
    about: [
      "Ponto Seguro opens four afternoons a week during term and keeps a referral list of clinicians and lawyers who have been checked by students who used them.",
    ],
    stats: [{ value: "2024", label: "Opened" }],
    aboutMore: [],
    jointWork: [],
    timeline: [],
    how: [],
    funding: "Student union budget line and a small annual grant.",
    atGlance: [
      { label: "Type", value: "Peer-support drop-in" },
      { label: "HQ", value: "Coimbra" },
    ],
    contact: {
      phone: null,
      phoneNote: null,
      email: "ola@pontoseguro.pt",
      website: "pontoseguro.pt",
      address: null,
    },
    status: "pending",
    submittedBy: null,
    reviewNote: null,
    createdAt: "2026-07-11T08:20:00.000Z",
    assignedStaffId: null,
    dueAt: dueDaysFromNow(9),
  },
];
