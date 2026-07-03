/** Static content for the Cinema film-submission wizard (`/cinema/submit`). */

export interface StepDef {
  label: string;
  sub: string;
}

/** The five wizard steps, in order. */
export const SUBMIT_STEPS: StepDef[] = [
  { label: "The film", sub: "Basic info" },
  { label: "Accessibility", sub: "Captions & AD" },
  { label: "Rights", sub: "Territory & term" },
  { label: "Revenue", sub: "How you want to sell" },
  { label: "Review", sub: "& submit" },
];

/** "The promise, in numbers" rows in the header panel. */
export const PROMISE_ROWS: {
  k: string;
  pre?: string;
  em: string;
  post?: string;
}[] = [
  { k: "Your share of every rent", em: "80", post: "%" },
  { k: "Your share of every buy", em: "80", post: "%" },
  { k: "Your share of every tip", em: "100", post: "%" },
  { k: "Paid to you", em: "Weekly" },
  { k: "Contract type", pre: "Non-", em: "exclusive" },
];

export interface FormatOption {
  value: string;
  label: string;
  sub: string;
}

export const FORMATS: FormatOption[] = [
  { value: "documentary", label: "Documentary", sub: "Non-fiction" },
  { value: "narrative", label: "Narrative feature", sub: "Fiction" },
  { value: "short", label: "Short", sub: "Under 40 min" },
  { value: "series", label: "Series", sub: "Episodic" },
  { value: "experimental", label: "Experimental", sub: "Essay / hybrid" },
  { value: "animation", label: "Animation", sub: "" },
];

export const COUNTRIES = ["Portugal", "Brazil", "France", "Spain", "Other"];
export const LANGUAGES = [
  "Portuguese",
  "English",
  "French",
  "Spanish",
  "Other",
];

export const IDENTITY_TAGS = [
  "Lesbian",
  "Gay",
  "Bi",
  "Trans woman",
  "Trans man",
  "Non-binary",
  "Queer",
  "Intersex",
  "Asexual",
];

/* ── Step 2: Accessibility ── */
export interface RadioOption {
  value: string;
  label: string;
  sub: string;
}

export const CAPTION_OPTIONS: RadioOption[] = [
  { value: "have", label: "I have them", sub: "SRT / VTT ready" },
  { value: "help", label: "I need help", sub: "Use the fund" },
  { value: "none", label: "None yet", sub: "We'll talk" },
];

export const CAPTION_LANGS = [
  "Portuguese",
  "English",
  "Spanish",
  "French",
  "Brazilian PT",
];

export const AD_OPTIONS: RadioOption[] = [
  { value: "have", label: "Audio description ready", sub: "Track or script" },
  { value: "help", label: "I'd like help making one", sub: "Access fund" },
  { value: "none", label: "Not this time", sub: "" },
];

export const SIGN_TRACKS = ["LGP", "ASL", "BSL", "None yet"];

/* ── Step 3: Rights ── */
export const TERRITORY_OPTIONS: RadioOption[] = [
  { value: "worldwide", label: "Worldwide", sub: "Reaches the most people" },
  { value: "europe", label: "Europe only", sub: "EU + UK" },
  { value: "portugal", label: "Portugal only", sub: "Local première" },
];

export const TERM_OPTIONS: RadioOption[] = [
  { value: "1yr", label: "One year", sub: "Auto-renews, cancel anytime" },
  { value: "2yr", label: "Two years", sub: "A little more stability" },
  { value: "perpetual", label: "Rolling", sub: "Until you pull it" },
];

/* ── Step 4: Revenue ── */
export interface RevenueModel {
  value: string;
  label: string;
  tag: string;
  tagKind: "free" | "paid";
  desc: string;
  split: string;
  /** Whether this model asks for a rental / buy price. */
  priced?: "rent" | "rentbuy";
}

export const REVENUE_MODELS: RevenueModel[] = [
  {
    value: "free",
    label: "Free to watch",
    tag: "Free",
    tagKind: "free",
    desc: "Anyone can watch. You earn a per-watch share of the community pool, funded by sustainers. Good for shorts and activist work.",
    split: "~€0.03–0.12 per watch",
  },
  {
    value: "sustainer",
    label: "Sustainer library",
    tag: "Member",
    tagKind: "paid",
    desc: "Included in sustainer access. You earn a per-minute-watched share. Predictable, slower to grow.",
    split: "~€0.008/min watched · 80% to you",
  },
  {
    value: "rent",
    label: "Rent · you set the price",
    tag: "€",
    tagKind: "paid",
    desc: "You set the rental price (min €2, max €8). 80% comes to you. 48-hour rental window.",
    split: "80% to you · paid weekly",
    priced: "rent",
  },
  {
    value: "rentbuy",
    label: "Rent + Buy",
    tag: "€€",
    tagKind: "paid",
    desc: "Set a rental price and a buy price (min 2× rental). 80% of both comes to you. Tips always 100%.",
    split: "80% rent + buy · 100% tip",
    priced: "rentbuy",
  },
];

/* ── Sidebar ── */
export const NEXT_POINTS: { strong: string; rest: string }[] = [
  {
    strong: "We watch it.",
    rest: "Every submission is screened by a human, within 10–14 days.",
  },
  {
    strong: "We write back either way.",
    rest: "If we don't accept it, we say why specifically — not a form rejection.",
  },
  {
    strong: "Non-exclusive contract.",
    rest: "You keep all your other rights. You can still show the film anywhere.",
  },
  {
    strong: "Paid within 7 days",
    rest: "of each transaction, to your IBAN or Stripe account.",
  },
];
