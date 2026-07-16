import { type ReactNode } from "react";

export type Badge = "yes" | "partial" | "no";

/**
 * Mock venue records. `name`, `type`, `hood`, `note` and each `features[].label`
 * are the venue's own self-reported accessibility facts — content, not chrome
 * (matches DirectoryPage's venue records elsewhere in this feature) — so they
 * stay in English regardless of locale. `reviewedByCount` is the one platform-
 * generated field (QueerPulse's own "reviewed by N disabled members" badge);
 * it holds just the number so the phrase can live in the catalog and get
 * pluralised. `undefined` means "QueerPulse-operated space" instead.
 */
export interface Venue {
  name: string;
  type: string;
  hood: string;
  note: string;
  features: { label: string; cls: Badge }[];
  featureTags: string[];
  reviewedByCount?: number;
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
    reviewedByCount: 3,
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
    reviewedByCount: 2,
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
    reviewedByCount: 2,
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
    reviewedByCount: 5,
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
    reviewedByCount: 4,
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
    reviewedByCount: 2,
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
    // No count set — QueerPulse operates this space directly.
  },
];

/**
 * i18n Pattern A — everything below is platform-authored chrome (filter
 * chips, the commitments list, resource links, the flag-issue picklist), so
 * every label is a catalog key resolved with `t()` at the call site.
 */
export const FILTERS: { id: string; labelKey: string }[] = [
  { id: "all", labelKey: "marketing:accessibility.filters.all" },
  { id: "step-free", labelKey: "marketing:accessibility.filters.stepFree" },
  {
    id: "accessible-bathroom",
    labelKey: "marketing:accessibility.filters.accessibleBathroom",
  },
  { id: "seating", labelKey: "marketing:accessibility.filters.seating" },
  {
    id: "hearing-loop",
    labelKey: "marketing:accessibility.filters.hearingLoop",
  },
  {
    id: "sensory-friendly",
    labelKey: "marketing:accessibility.filters.sensoryFriendly",
  },
  {
    id: "carer-welcome",
    labelKey: "marketing:accessibility.filters.carerWelcome",
  },
];

export const COMMITMENTS: {
  icon: ReactNode;
  titleKey: string;
  bodyKey: string;
  statusKey: string;
}[] = [
  {
    icon: (
      <>
        <rect x="2" y="5" width="16" height="11" rx="2" />
        <path d="M5 9h10M5 13h6" />
      </>
    ),
    titleKey: "marketing:accessibility.commitments.captions.title",
    bodyKey: "marketing:accessibility.commitments.captions.body",
    statusKey: "marketing:accessibility.commitments.captions.status",
  },
  {
    icon: (
      <>
        <path d="M4 14l4-4 3 3 5-6" />
        <circle cx="15" cy="5" r="2" />
      </>
    ),
    titleKey: "marketing:accessibility.commitments.lgp.title",
    bodyKey: "marketing:accessibility.commitments.lgp.body",
    statusKey: "marketing:accessibility.commitments.lgp.status",
  },
  {
    icon: <path d="M10 3v14M3 10h14" />,
    titleKey: "marketing:accessibility.commitments.seating.title",
    bodyKey: "marketing:accessibility.commitments.seating.body",
    statusKey: "marketing:accessibility.commitments.seating.status",
  },
  {
    icon: (
      <>
        <circle cx="10" cy="10" r="7" />
        <path d="M10 7v4l2.5 2.5" />
      </>
    ),
    titleKey: "marketing:accessibility.commitments.sensory.title",
    bodyKey: "marketing:accessibility.commitments.sensory.body",
    statusKey: "marketing:accessibility.commitments.sensory.status",
  },
  {
    icon: (
      <>
        <circle cx="10" cy="7" r="3" />
        <path d="M4 17c0-3.31 2.69-6 6-6s6 2.69 6 6" />
      </>
    ),
    titleKey: "marketing:accessibility.commitments.carers.title",
    bodyKey: "marketing:accessibility.commitments.carers.body",
    statusKey: "marketing:accessibility.commitments.carers.status",
  },
  {
    icon: <path d="M10 2L2 7v6a8 8 0 0 0 16 0V7L10 2z" />,
    titleKey: "marketing:accessibility.commitments.platform.title",
    bodyKey: "marketing:accessibility.commitments.platform.body",
    statusKey: "marketing:accessibility.commitments.platform.status",
  },
];

export const RESOURCES: {
  eyebrowKey: string;
  titleKey: string;
  bodyKey: string;
  linkKey: string;
}[] = [
  {
    eyebrowKey: "marketing:accessibility.resources.benefits.eyebrow",
    titleKey: "marketing:accessibility.resources.benefits.title",
    bodyKey: "marketing:accessibility.resources.benefits.body",
    linkKey: "marketing:accessibility.resources.benefits.link",
  },
  {
    eyebrowKey: "marketing:accessibility.resources.healthcare.eyebrow",
    titleKey: "marketing:accessibility.resources.healthcare.title",
    bodyKey: "marketing:accessibility.resources.healthcare.body",
    linkKey: "marketing:accessibility.resources.healthcare.link",
  },
  {
    eyebrowKey: "marketing:accessibility.resources.legal.eyebrow",
    titleKey: "marketing:accessibility.resources.legal.title",
    bodyKey: "marketing:accessibility.resources.legal.body",
    linkKey: "marketing:accessibility.resources.legal.link",
  },
  {
    eyebrowKey: "marketing:accessibility.resources.mentalHealth.eyebrow",
    titleKey: "marketing:accessibility.resources.mentalHealth.title",
    bodyKey: "marketing:accessibility.resources.mentalHealth.body",
    linkKey: "marketing:accessibility.resources.mentalHealth.link",
  },
];

export const FLAG_ISSUE_KEYS = [
  "marketing:accessibility.flagIssues.stepFree",
  "marketing:accessibility.flagIssues.bathroom",
  "marketing:accessibility.flagIssues.seating",
  "marketing:accessibility.flagIssues.hearingLoop",
  "marketing:accessibility.flagIssues.sensory",
  "marketing:accessibility.flagIssues.staff",
  "marketing:accessibility.flagIssues.other",
];
