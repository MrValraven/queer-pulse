/** Showcase content for the homepage Personas section, shown in both demo and
 * live mode by product decision. These are fabricated identities used to
 * explain how personas work, not real members. Unlike most homepage showcase
 * data (e.g. `changemakers.ts`), this content is fully translated (via
 * `getPersonas(t)` / `getDeckCards(t)`) rather than left English-only — see
 * the note in en/homepage.ts's "Subprofiles" block for why this is an
 * intentional exception to the file's i18n scope rule. Proper names stay as
 * plain literals here since names aren't localized. */
import type { TFunction } from "../../../shared/i18n/types";

export type PersonaKey = "main" | "mara" | "atelier" | "byline";

export type PersonaTint = "plum" | "acc" | "jade" | "mute";

export type VisibilityVariant = "open" | "net" | "priv";

export interface PersonaTile {
  label: string;
  imageUrl: string;
}

export interface PersonaProfile {
  key: PersonaKey;
  initials: string;
  name: string;
  /** Mara's name renders in small caps letterspacing, matching a drag stage name. */
  nameCaps?: boolean;
  tint: PersonaTint;
  role: string;
  sub: string;
  cta: string;
  /** One-line bio shown alongside the name in the PersonaProof comparison lane. */
  bio: string;
  meta: string[];
  /** Reused from ../../subprofiles/data/subprofiles.data.ts — the closest
   *  existing persona of each kind in the app's own demo fixtures, rather
   *  than new stock photos. */
  tiles: PersonaTile[];
  foot: string;
  /** The "speaking as…" quote shown in the proof block. */
  note: string;
  /** Subtitle line inside the "Posting as" switcher menu. */
  switcherSub: string;
  /** Short descriptor used on the comparison lane in PersonaProof. */
  laneLabel: string;
}

export interface DeckCard {
  key: Exclude<PersonaKey, "main">;
  skinLabel: string;
  tag: string;
  visLabel: string;
  visVariant: VisibilityVariant;
  showsLine: string;
}

export function getPersonas(t: TFunction): Record<PersonaKey, PersonaProfile> {
  return {
    main: {
      key: "main",
      initials: "SM",
      name: "Sofia Marques",
      tint: "plum",
      role: t("homepage:subprofiles.personas.main.role"),
      sub: t("homepage:subprofiles.personas.main.sub"),
      cta: t("homepage:subprofiles.personas.main.cta"),
      bio: t("homepage:subprofiles.personas.main.bio"),
      meta: [
        t("homepage:subprofiles.personas.main.meta.0"),
        t("homepage:subprofiles.personas.main.meta.1"),
        t("homepage:subprofiles.personas.main.meta.2"),
      ],
      tiles: [
        // Rui Marçal (developer persona) cover photo.
        {
          label: t("homepage:subprofiles.personas.main.tiles.0.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=800&auto=format&fit=crop",
        },
        // GRAIN's "Held" portfolio piece.
        {
          label: t("homepage:subprofiles.personas.main.tiles.1.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop",
        },
        // Terceiro Piso's gallery room (Held, Again exhibition).
        {
          label: t("homepage:subprofiles.personas.main.tiles.2.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?q=80&w=800&auto=format&fit=crop",
        },
      ],
      foot: t("homepage:subprofiles.personas.main.foot"),
      note: t("homepage:subprofiles.personas.main.note"),
      switcherSub: t("homepage:subprofiles.personas.main.switcherSub"),
      laneLabel: t("homepage:subprofiles.personas.main.laneLabel"),
    },
    mara: {
      key: "mara",
      initials: "MV",
      name: "Mara Vulgar",
      nameCaps: true,
      tint: "acc",
      role: t("homepage:subprofiles.personas.mara.role"),
      sub: t("homepage:subprofiles.personas.mara.sub"),
      cta: t("homepage:subprofiles.personas.mara.cta"),
      bio: t("homepage:subprofiles.personas.mara.bio"),
      meta: [
        t("homepage:subprofiles.personas.mara.meta.0"),
        t("homepage:subprofiles.personas.mara.meta.1"),
        t("homepage:subprofiles.personas.mara.meta.2"),
      ],
      tiles: [
        // Vanda Diesel (drag persona) cover photo.
        {
          label: t("homepage:subprofiles.personas.mara.tiles.0.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?q=80&w=800&auto=format&fit=crop",
        },
        // Vanda Diesel's "Motorbike Madonna" look.
        {
          label: t("homepage:subprofiles.personas.mara.tiles.1.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop",
        },
        // Vanda Diesel's "First Communion" look.
        {
          label: t("homepage:subprofiles.personas.mara.tiles.2.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop",
        },
      ],
      foot: t("homepage:subprofiles.personas.mara.foot"),
      note: t("homepage:subprofiles.personas.mara.note"),
      switcherSub: t("homepage:subprofiles.personas.mara.switcherSub"),
      laneLabel: t("homepage:subprofiles.personas.mara.laneLabel"),
    },
    atelier: {
      key: "atelier",
      initials: "AV",
      name: "Atelier Vinte",
      tint: "jade",
      role: t("homepage:subprofiles.personas.atelier.role"),
      sub: t("homepage:subprofiles.personas.atelier.sub"),
      cta: t("homepage:subprofiles.personas.atelier.cta"),
      bio: t("homepage:subprofiles.personas.atelier.bio"),
      meta: [
        t("homepage:subprofiles.personas.atelier.meta.0"),
        t("homepage:subprofiles.personas.atelier.meta.1"),
        t("homepage:subprofiles.personas.atelier.meta.2"),
      ],
      tiles: [
        // SANTA CRUEL (fashion designer persona) "PENITENTE" collection.
        {
          label: t("homepage:subprofiles.personas.atelier.tiles.0.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
        },
        // SANTA CRUEL's "IRMÃ" collection.
        {
          label: t("homepage:subprofiles.personas.atelier.tiles.1.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop",
        },
        // SANTA CRUEL's "PRIMEIRA COMUNHÃO" collection.
        {
          label: t("homepage:subprofiles.personas.atelier.tiles.2.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop",
        },
      ],
      foot: t("homepage:subprofiles.personas.atelier.foot"),
      note: t("homepage:subprofiles.personas.atelier.note"),
      switcherSub: t("homepage:subprofiles.personas.atelier.switcherSub"),
      laneLabel: t("homepage:subprofiles.personas.atelier.laneLabel"),
    },
    byline: {
      key: "byline",
      initials: "RD",
      name: "R. Duarte",
      tint: "mute",
      role: t("homepage:subprofiles.personas.byline.role"),
      sub: t("homepage:subprofiles.personas.byline.sub"),
      cta: t("homepage:subprofiles.personas.byline.cta"),
      bio: t("homepage:subprofiles.personas.byline.bio"),
      meta: [
        t("homepage:subprofiles.personas.byline.meta.0"),
        t("homepage:subprofiles.personas.byline.meta.1"),
        t("homepage:subprofiles.personas.byline.meta.2"),
      ],
      tiles: [
        // NIGHTFORM's "Threshold EP" release art.
        {
          label: t("homepage:subprofiles.personas.byline.tiles.0.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=800&auto=format&fit=crop",
        },
        // NIGHTFORM's "Static Bloom" release art.
        {
          label: t("homepage:subprofiles.personas.byline.tiles.1.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
        },
        // NIGHTFORM (musician persona) cover photo.
        {
          label: t("homepage:subprofiles.personas.byline.tiles.2.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
        },
      ],
      foot: t("homepage:subprofiles.personas.byline.foot"),
      note: t("homepage:subprofiles.personas.byline.note"),
      switcherSub: t("homepage:subprofiles.personas.byline.switcherSub"),
      laneLabel: t("homepage:subprofiles.personas.byline.laneLabel"),
    },
  };
}

/** Fan order for the deck, left to right (rotation -5deg / 0 / +5deg). */
export function getDeckCards(t: TFunction): DeckCard[] {
  return [
    {
      key: "mara",
      skinLabel: t("homepage:subprofiles.personas.mara.deck.skinLabel"),
      tag: t("homepage:subprofiles.personas.mara.deck.tag"),
      visLabel: t("homepage:subprofiles.personas.mara.deck.visLabel"),
      visVariant: "open",
      showsLine: t("homepage:subprofiles.personas.mara.deck.showsLine"),
    },
    {
      key: "atelier",
      skinLabel: t("homepage:subprofiles.personas.atelier.deck.skinLabel"),
      tag: t("homepage:subprofiles.personas.atelier.deck.tag"),
      visLabel: t("homepage:subprofiles.personas.atelier.deck.visLabel"),
      visVariant: "net",
      showsLine: t("homepage:subprofiles.personas.atelier.deck.showsLine"),
    },
    {
      key: "byline",
      skinLabel: t("homepage:subprofiles.personas.byline.deck.skinLabel"),
      tag: t("homepage:subprofiles.personas.byline.deck.tag"),
      visLabel: t("homepage:subprofiles.personas.byline.deck.visLabel"),
      visVariant: "priv",
      showsLine: t("homepage:subprofiles.personas.byline.deck.showsLine"),
    },
  ];
}

/** Order shown in the "Posting as" switcher menu (main profile first, then personas). */
export const SWITCHER_ORDER: PersonaKey[] = [
  "main",
  "mara",
  "atelier",
  "byline",
];

export const DEFAULT_PERSONA_KEY: PersonaKey = "mara";
