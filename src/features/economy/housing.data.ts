import { routes } from "../../app/routeMap";

export const FILTERS = [
  { value: "all", label: "All listings" },
  { value: "sublet", label: "Sublet" },
  { value: "room", label: "Room share" },
  { value: "short", label: "Short-term" },
  { value: "studio", label: "Studio / whole flat" },
];

export const TIPS = [
  {
    num: "01",
    title: "Budget for a competitive market",
    text: "Rooms in central neighbourhoods go for €700–1000/month. Studios €900–1400. Things move quickly. Have documents ready: NIF, proof of income or a guarantor, and a cover message.",
  },
  {
    num: "02",
    title: "Use the community board",
    text: 'The QueerPulse board consistently surfaces housing before it hits any portal. Post "looking for a room in [neighbourhood]" and the network will reply. It works.',
  },
  {
    num: "03",
    title: "Know your rights as a tenant",
    text: "Portuguese tenancy law is reasonably protective. You need a written contract. Landlords can't evict without proper notice. ILGA Portugal can advise if you face discrimination.",
  },
  {
    num: "04",
    title: "Short-term first is fine",
    text: "It's completely valid to arrive with a short-term sublet for 2–3 months and find long-term housing once you know the city better.",
  },
  {
    num: "05",
    title: "Trust your gut on viewings",
    text: "Meet the landlord before signing. Ask about other tenants. A bad feeling is worth more than a good price.",
  },
  {
    num: "06",
    title: "In an emergency, ask the community",
    text: "If you're suddenly homeless or in a dangerous living situation, post to the board. The community responds quickly to genuine need.",
  },
];

export const HOUSING_SUBPAGES = [
  {
    label: "Housing Co-op",
    to: routes.housingCoop,
    blurb:
      "Members buying and running homes together — how co-ops form, and how to join one.",
  },
  {
    label: "Flatmates",
    to: routes.flatmates,
    blurb: "Find a room or a flatmate in a queer-friendly household.",
  },
];
