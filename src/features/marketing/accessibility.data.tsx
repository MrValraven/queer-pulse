import { type ReactNode } from "react";

export type Badge = "yes" | "partial" | "no";

export interface Venue {
  name: string;
  type: string;
  hood: string;
  note: string;
  features: { label: string; cls: Badge }[];
  featureTags: string[];
  reviewer: string;
}

export const VENUES: Venue[] = [
  {
    name: "Maria Caxuxa",
    type: "Bar · Community space",
    hood: "Intendente",
    note: "One of the most consistently accessible queer spaces in Lisbon. Reviewer notes that step-free access is genuinely easy and staff are helpful without being patronising.",
    features: [
      { label: "Step-free entry", cls: "yes" },
      { label: "Accessible bathroom", cls: "yes" },
      { label: "Seating throughout", cls: "yes" },
      { label: "Hearing loop", cls: "yes" },
      { label: "Sensory-friendly nights", cls: "yes" },
      { label: "Carer welcome", cls: "yes" },
    ],
    featureTags: [
      "step-free",
      "accessible-bathroom",
      "seating",
      "hearing-loop",
      "sensory-friendly",
      "carer-welcome",
    ],
    reviewer: "Reviewed by 3 disabled members",
  },
  {
    name: "Trumps",
    type: "Club · Bar",
    hood: "Príncipe Real",
    note: "One step at the main entrance — manageable for some wheelchair users with staff assistance, but requires asking. Inside access is good once you're in. Accessible bathroom on the ground floor.",
    features: [
      { label: "1 step at entry (staff help available)", cls: "partial" },
      { label: "Accessible bathroom", cls: "yes" },
      { label: "Seating at bar area", cls: "partial" },
      { label: "No hearing loop", cls: "no" },
      { label: "Carer welcome", cls: "yes" },
    ],
    featureTags: ["accessible-bathroom", "seating", "carer-welcome"],
    reviewer: "Reviewed by 2 disabled members",
  },
  {
    name: "Deep Marvila",
    type: "Club · Events space",
    hood: "Marvila",
    note: "Large warehouse venue. Entry is fully step-free and the space is wide and open. However: no accessible bathroom on site and noise levels are very high at club nights. Better for daytime events.",
    features: [
      { label: "Step-free entry", cls: "yes" },
      { label: "No accessible bathroom", cls: "no" },
      { label: "Seating in gallery area", cls: "partial" },
      { label: "No hearing loop", cls: "no" },
      { label: "Low sensory during day events", cls: "partial" },
      { label: "Carer welcome", cls: "yes" },
    ],
    featureTags: ["step-free", "seating", "carer-welcome"],
    reviewer: "Reviewed by 2 disabled members",
  },
  {
    name: "A Cena",
    type: "Community venue · Theatre",
    hood: "Mouraria",
    note: "Purpose-built community space with accessibility as a design priority. LGP interpretation regularly provided for in-house productions. One of the best options for members with multiple access needs.",
    features: [
      { label: "Step-free entry", cls: "yes" },
      { label: "Accessible bathroom", cls: "yes" },
      { label: "Seating always available", cls: "yes" },
      { label: "Hearing loop", cls: "yes" },
      { label: "LGP interpretation (some events)", cls: "yes" },
      { label: "Sensory-friendly", cls: "yes" },
      { label: "Carer welcome", cls: "yes" },
    ],
    featureTags: [
      "step-free",
      "accessible-bathroom",
      "seating",
      "hearing-loop",
      "sensory-friendly",
      "carer-welcome",
    ],
    reviewer: "Reviewed by 5 disabled members",
  },
  {
    name: "Finalmente Club",
    type: "Club",
    hood: "Príncipe Real",
    note: "Stairs to the main floor with no lift. Not accessible for wheelchair users or people who cannot manage stairs. Inside: very tight space, high noise, limited seating. Community history is important but accessibility is genuinely poor.",
    features: [
      { label: "Multiple stairs, no lift", cls: "no" },
      { label: "No accessible bathroom", cls: "no" },
      { label: "Very limited seating", cls: "no" },
      { label: "High noise environment", cls: "no" },
    ],
    featureTags: [],
    reviewer: "Reviewed by 4 disabled members",
  },
  {
    name: "Tasca do Chico",
    type: "Bar · Music",
    hood: "Bairro Alto",
    note: "Narrow, old building with steps at entry. Once inside, the space is very tight. The fado nights are exceptional but the physical space has real limitations for disabled visitors.",
    features: [
      { label: "Steps at entry", cls: "no" },
      { label: "No accessible bathroom", cls: "no" },
      { label: "Limited seating", cls: "partial" },
      { label: "Staff welcoming", cls: "yes" },
    ],
    featureTags: [],
    reviewer: "Reviewed by 2 disabled members",
  },
  {
    name: "Queer Lisboa HQ",
    type: "Community space · Office",
    hood: "Arroios",
    note: "The community space used for smaller QueerPulse gatherings. Step-free lift access, accessible bathroom, adjustable seating. Events held here carry an accessibility guarantee.",
    features: [
      { label: "Step-free (lift)", cls: "yes" },
      { label: "Accessible bathroom", cls: "yes" },
      { label: "Adjustable seating", cls: "yes" },
      { label: "Quiet room available", cls: "yes" },
      { label: "Carer welcome", cls: "yes" },
    ],
    featureTags: [
      "step-free",
      "accessible-bathroom",
      "seating",
      "sensory-friendly",
      "carer-welcome",
    ],
    reviewer: "QueerPulse-operated space",
  },
];

export const FILTERS = [
  { id: "all", label: "All venues" },
  { id: "step-free", label: "Step-free" },
  { id: "accessible-bathroom", label: "Accessible bathroom" },
  { id: "seating", label: "Seating available" },
  { id: "hearing-loop", label: "Hearing loop" },
  { id: "sensory-friendly", label: "Sensory-friendly" },
  { id: "carer-welcome", label: "Carer welcome" },
];

export const COMMITMENTS: {
  icon: ReactNode;
  title: string;
  body: string;
  status: string;
}[] = [
  {
    icon: (
      <>
        <rect x="2" y="5" width="16" height="11" rx="2" />
        <path d="M5 9h10M5 13h6" />
      </>
    ),
    title: "Live captions at online events",
    body: "All QueerPulse online events use automatic captions as a minimum. For larger events, human-edited captions are arranged on request.",
    status: "Standard practice",
  },
  {
    icon: (
      <>
        <path d="M4 14l4-4 3 3 5-6" />
        <circle cx="15" cy="5" r="2" />
      </>
    ),
    title: "LGP interpretation on request",
    body: "Portuguese Sign Language (LGP) interpretation can be arranged for QueerPulse gatherings and larger community events with at least two weeks' notice.",
    status: "Available on request · 14 days notice",
  },
  {
    icon: <path d="M10 3v14M3 10h14" />,
    title: "Seating always available",
    body: "QueerPulse gatherings always have seating available — standing-only events are not acceptable. If an event is at a venue where seating is limited, we say so clearly in the listing.",
    status: "Non-negotiable minimum",
  },
  {
    icon: (
      <>
        <circle cx="10" cy="10" r="7" />
        <path d="M10 7v4l2.5 2.5" />
      </>
    ),
    title: "Sensory-friendly events flagged",
    body: "Events designed with lower sensory load (quieter music, lower lighting, no strobes, quieter entry space) are flagged on the calendar with a clear indicator.",
    status: "Flagged on every calendar listing",
  },
  {
    icon: (
      <>
        <circle cx="10" cy="7" r="3" />
        <path d="M4 17c0-3.31 2.69-6 6-6s6 2.69 6 6" />
      </>
    ),
    title: "Carers & PAs welcome",
    body: "Personal assistants and carers are always welcome at QueerPulse events at no additional cost. No justification required — just let us know when you register.",
    status: "Always, without question",
  },
  {
    icon: <path d="M10 2L2 7v6a8 8 0 0 0 16 0V7L10 2z" />,
    title: "Platform accessibility",
    body: "QueerPulse is committed to WCAG 2.1 AA compliance. If you find something inaccessible on the platform, report it — we treat these as priority fixes, not feature requests.",
    status: "Report via the forum or contact page",
  },
];

export const RESOURCES = [
  {
    eyebrow: "Benefits & entitlements",
    title: "Portuguese disability benefits as a migrant",
    body: "Navigating the Portuguese social security system (Segurança Social) as an expat or recent migrant with a disability is genuinely complicated. This guide, maintained by community members, covers what you're entitled to at different stages of residency — EU citizens, non-EU residents, and people awaiting documentation.",
    link: "Full benefits guide →",
  },
  {
    eyebrow: "Healthcare",
    title: "Disability-affirming, queer-friendly healthcare",
    body: "Finding a GP or specialist who is both disability-affirming and queer-friendly is harder than it should be. Community-reviewed healthcare providers are listed here — people who understand that being disabled and queer are not separate things requiring separate appointments.",
    link: "Health providers directory →",
  },
  {
    eyebrow: "Legal rights",
    title: "Disability discrimination and your rights",
    body: "Portuguese law prohibits discrimination on grounds of disability in employment, housing, and public services. This includes the right to reasonable adjustments. If you've experienced discrimination from a landlord, employer, or service provider, there are routes to challenge it.",
    link: "Legal resources →",
  },
  {
    eyebrow: "Mental health",
    title: "Chronic illness, disability, and mental health support",
    body: "The intersection of chronic illness, disability, and queer identity creates specific mental health pressures. QueerPulse's wellbeing resources include therapists with experience of disabled queer clients, and peer support groups that don't require you to explain yourself from scratch.",
    link: "Wellbeing resources →",
  },
];

export const FLAG_ISSUES = [
  "Step-free access was not as described",
  "Accessible bathroom was unavailable or not as described",
  "Seating was not available",
  "Hearing loop was not working",
  "Sensory environment was not as described",
  "Staff were unhelpful or dismissive",
  "Something else",
];
