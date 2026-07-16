/** Static data for the Studio Welcome onboarding wizard (StudioWelcomePage). */

export interface WelcomeArtist {
  id: string;
  name: string;
  place: string;
  avatar: string;
  /** Pre-selected when the wizard opens. */
  preselected?: boolean;
}

export interface TipChip {
  amount: number;
  noteKey: string;
}

export interface ToggleRow {
  id: string;
  titleKey: string;
  bodyKey: string;
  /** Default on-state for the switch. */
  defaultOn: boolean;
}

/** Step 1 — eight artists to follow (Mariana pre-selected). */
export const WELCOME_ARTISTS: WelcomeArtist[] = [
  {
    id: "mariana-sol",
    name: "Mariana Sol",
    place: "Sintra",
    avatar:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&q=80&auto=format&fit=crop",
    preselected: true,
  },
  {
    id: "akin-diallo",
    name: "Akin Diallo",
    place: "Dakar / Paris",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop",
  },
  {
    id: "coro-de-outubro",
    name: "Coro de Outubro",
    place: "Lisbon",
    avatar:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=200&q=80&auto=format&fit=crop",
  },
  {
    id: "yara-reis",
    name: "Yara Reis",
    place: "Lisbon",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80&auto=format&fit=crop",
  },
  {
    id: "pedro-limao",
    name: "Pedro Limão",
    place: "Lisbon",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&auto=format&fit=crop",
  },
  {
    id: "yuki-tanaka",
    name: "Yuki Tanaka",
    place: "Hokkaido",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80&auto=format&fit=crop",
  },
  {
    id: "mateus-f",
    name: "Mateus F.",
    place: "Porto",
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80&auto=format&fit=crop",
  },
  {
    id: "sofia-castro",
    name: "Sofía Castro",
    place: "Madrid",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80&auto=format&fit=crop",
  },
];

/** Step 2 — default tip chips (€2 default). */
export const TIP_CHIPS: TipChip[] = [
  { amount: 1, noteKey: "studio:welcome.tip.nod" },
  { amount: 2, noteKey: "studio:welcome.tip.coffee" },
  { amount: 5, noteKey: "studio:welcome.tip.round" },
  { amount: 10, noteKey: "studio:welcome.tip.record" },
];

export const DEFAULT_TIP = 2;

/** Step 3 — privacy toggle rows. */
export const TOGGLE_ROWS: ToggleRow[] = [
  {
    id: "history",
    titleKey: "studio:welcome.step3.history.title",
    bodyKey: "studio:welcome.step3.history.body",
    defaultOn: false,
  },
  {
    id: "tip-notes",
    titleKey: "studio:welcome.step3.tipNotes.title",
    bodyKey: "studio:welcome.step3.tipNotes.body",
    defaultOn: false,
  },
  {
    id: "library-sync",
    titleKey: "studio:welcome.step3.librarySync.title",
    bodyKey: "studio:welcome.step3.librarySync.body",
    defaultOn: true,
  },
];
