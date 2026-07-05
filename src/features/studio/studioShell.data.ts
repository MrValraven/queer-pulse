import { routes } from "../../app/routeMap";

export interface RailLink {
  label: string;
  to: string;
  end?: boolean;
}

export const RAIL_MAIN: RailLink[] = [
  { label: "Home", to: routes.studio, end: true },
  { label: "The Wednesday set", to: routes.studio, end: true },
  { label: "Browse", to: routes.studio, end: true },
  { label: "Sheet music", to: "/studio/sheet-store" },
  { label: "Live broadcasts", to: routes.studioLive },
  { label: "Notifications", to: routes.studioNotifications },
];

export const CONTRIBUTE: RailLink[] = [
  { label: "Submit a set", to: routes.studioSetSubmission },
  { label: "Go live", to: routes.studioBroadcast },
  { label: "Open calls", to: routes.studioCalls },
  { label: "Rights & takedown", to: routes.studioRights },
  { label: "Solidarity fund", to: "/studio/solidarity-fund" },
];

export const GOVERNANCE: RailLink[] = [
  { label: "Programme the week", to: routes.studioProgram },
  { label: "Curation council", to: routes.studioCouncil },
  { label: "Submission inbox", to: routes.studioTriage },
  { label: "Flagged tracks", to: routes.studioFlagReview },
];

export const UTILITY: RailLink[] = [
  { label: "About the co-op", to: routes.studioAbout },
  { label: "Help & FAQ", to: routes.studioHelp },
  { label: "Accessibility", to: routes.studioAccessibility },
  { label: "Trust & terms", to: routes.studioTerms },
];

export const PLAYER_ART =
  "https://images.unsplash.com/photo-1654432673600-33ff123df18a?q=80&w=400&auto=format&fit=crop";

export interface LibraryItem {
  name: string;
  em: string;
  meta: string;
  tint: "coral" | "plum" | "jade";
  to: string;
  image?: string;
}

export const LIBRARY: LibraryItem[] = [
  {
    name: "Cidade dos ",
    em: "santos",
    meta: "Album · Mariana Sol",
    tint: "coral",
    to: routes.studioAlbum,
    image:
      "https://images.unsplash.com/photo-1629794138560-46d2815a6d79?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Vespertina ",
    em: "vol. iv",
    meta: "Set · Sara Marques",
    tint: "plum",
    to: routes.studio,
    image:
      "https://images.unsplash.com/photo-1528643609128-c50fdc20cc58?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Lisbon dyke-bar ",
    em: "standards",
    meta: "Collection · 28 tracks",
    tint: "jade",
    to: routes.studio,
    image:
      "https://images.unsplash.com/photo-1565502233254-3d22afd146eb?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Trans ",
    em: "composers",
    meta: "Mix · D. Okoye",
    tint: "plum",
    to: routes.studio,
    image:
      "https://images.unsplash.com/photo-1566108253680-7c860e4633a3?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "The Anjos ",
    em: "tape",
    meta: "Live · Casa do Comum",
    tint: "coral",
    to: routes.studio,
    image:
      "https://images.unsplash.com/photo-1585310808021-c2221275d7ad?q=80&w=800&auto=format&fit=crop",
  },
];
