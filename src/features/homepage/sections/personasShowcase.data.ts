/** Showcase content for the homepage Personas section, shown in both demo and
 * live mode by product decision. These are fabricated identities used to
 * explain how personas work, not real members. Unlike most homepage showcase
 * data (e.g. `changemakers.ts`), this content is fully translated (via
 * `getPersonas(t)`) rather than left English-only — see
 * the note in en/homepage.ts's "Subprofiles" block for why this is an
 * intentional exception to the file's i18n scope rule. Proper names stay as
 * plain literals here since names aren't localized. */
import type { TFunction } from "../../../shared/i18n/types";

export type PersonaKey = "main" | "drag" | "yoga" | "poetry";

export type PersonaTint = "plum" | "acc" | "jade" | "mute";

/** Who can see a persona. The editor also offers "private" (just you), which
 * is a drafting state and has no place in a public showcase. */
export type PersonaVisibility = "open" | "network";

/** How a persona relates to the main profile. `main` marks the main profile
 * itself, which is the thing the other personas link to or stand apart from. */
export type PersonaLink = "main" | "linked" | "standalone";

export interface PersonaTile {
  label: string;
  imageUrl: string;
}

export interface PersonaProfile {
  key: PersonaKey;
  initials: string;
  /** Unsplash photo for the avatar. `rect` pre-crops the source around the
   *  face, so the small square stays readable; PersonaAvatar adds the size. */
  avatarUrl: string;
  name: string;
  /** Sophie's name renders in small caps letterspacing, matching a drag stage name. */
  nameCaps?: boolean;
  tint: PersonaTint;
  visibility: PersonaVisibility;
  link: PersonaLink;
  role: string;
  sub: string;
  cta: string;
  /** One-line bio shown on the persona's glimpse card. */
  bio: string;
  meta: string[];
  /** Unsplash photos picked for each side. Portrait shots pass crop=faces
   *  and a height that matches the tile shape, so the thin strips keep
   *  faces in frame. */
  tiles: PersonaTile[];
  foot: string;
  /** The "speaking as…" quote shown at the foot of the stage's audience panel. */
  note: string;
  /** Short descriptor shown under the name in the stage's persona rail. */
  laneLabel: string;
}

export function getPersonas(t: TFunction): Record<PersonaKey, PersonaProfile> {
  return {
    main: {
      key: "main",
      initials: "SM",
      // The speaker from Sofia's conference talk tile.
      avatarUrl:
        "https://images.unsplash.com/photo-1715610258704-e8f9f5710fe0?rect=2277,1504,1103,1103",
      name: "Sofia Marques",
      tint: "plum",
      visibility: "open",
      link: "main",
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
        // Hand-drawn app wireframes with an orange pen.
        {
          label: t("homepage:subprofiles.personas.main.tiles.0.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=800&h=280&auto=format&fit=crop",
        },
        // Wireframe open on a tablet beside a coffee mug.
        {
          label: t("homepage:subprofiles.personas.main.tiles.1.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1597534458220-9fb4969f2df5?q=80&w=800&h=280&auto=format&fit=crop",
        },
        // Woman speaking into a mic in front of a seated audience.
        {
          label: t("homepage:subprofiles.personas.main.tiles.2.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1715610258704-e8f9f5710fe0?q=80&w=1200&h=200&auto=format&fit=crop&crop=faces",
        },
      ],
      foot: t("homepage:subprofiles.personas.main.foot"),
      note: t("homepage:subprofiles.personas.main.note"),
      laneLabel: t("homepage:subprofiles.personas.main.laneLabel"),
    },
    drag: {
      key: "drag",
      initials: "SS",
      // The purple-headdress queen from Sophie's first show tile.
      avatarUrl:
        "https://images.unsplash.com/photo-1531756012882-a68c4e97ac98?rect=1183,898,1469,1469",
      name: "Sophie Stication",
      nameCaps: true,
      tint: "acc",
      visibility: "open",
      link: "linked",
      role: t("homepage:subprofiles.personas.drag.role"),
      sub: t("homepage:subprofiles.personas.drag.sub"),
      cta: t("homepage:subprofiles.personas.drag.cta"),
      bio: t("homepage:subprofiles.personas.drag.bio"),
      meta: [
        t("homepage:subprofiles.personas.drag.meta.0"),
        t("homepage:subprofiles.personas.drag.meta.1"),
        t("homepage:subprofiles.personas.drag.meta.2"),
      ],
      tiles: [
        // Drag queen in a purple sculpted headdress.
        {
          label: t("homepage:subprofiles.personas.drag.tiles.0.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1531756012882-a68c4e97ac98?q=80&w=800&h=280&auto=format&fit=crop&crop=faces",
        },
        // Drag queen in gold eye makeup, low stage light.
        {
          label: t("homepage:subprofiles.personas.drag.tiles.1.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1593536604657-c7087cdc9c9c?q=80&w=800&h=280&auto=format&fit=crop&crop=faces",
        },
        // Two queens laughing at an outdoor festival.
        {
          label: t("homepage:subprofiles.personas.drag.tiles.2.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1554349618-7fe63db620c2?q=80&w=1200&h=200&auto=format&fit=crop&crop=faces",
        },
      ],
      foot: t("homepage:subprofiles.personas.drag.foot"),
      note: t("homepage:subprofiles.personas.drag.note"),
      laneLabel: t("homepage:subprofiles.personas.drag.laneLabel"),
    },
    yoga: {
      key: "yoga",
      initials: "YS",
      // The teal rolled mat from the studio tile: the teaching side leads
      // with the practice, so no second face stands in for Sofia.
      avatarUrl:
        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?rect=2232,1371,783,783",
      name: "Yoga com Sofia",
      tint: "jade",
      visibility: "open",
      link: "linked",
      role: t("homepage:subprofiles.personas.yoga.role"),
      sub: t("homepage:subprofiles.personas.yoga.sub"),
      cta: t("homepage:subprofiles.personas.yoga.cta"),
      bio: t("homepage:subprofiles.personas.yoga.bio"),
      meta: [
        t("homepage:subprofiles.personas.yoga.meta.0"),
        t("homepage:subprofiles.personas.yoga.meta.1"),
        t("homepage:subprofiles.personas.yoga.meta.2"),
      ],
      tiles: [
        // Outdoor class in a garden, arms raised.
        {
          label: t("homepage:subprofiles.personas.yoga.tiles.0.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1758797315487-b3b225dff7d8?q=80&w=800&h=280&auto=format&fit=crop",
        },
        // Rolled mats on a studio shelf. No solo portrait here: any single
        // face on this side would read as someone other than Sofia.
        {
          label: t("homepage:subprofiles.personas.yoga.tiles.1.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=800&h=280&auto=format&fit=crop",
        },
        // Class on a wooden deck by the river.
        {
          label: t("homepage:subprofiles.personas.yoga.tiles.2.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1644612105654-b6b0a941ecde?q=80&w=1200&h=200&auto=format&fit=crop",
        },
      ],
      foot: t("homepage:subprofiles.personas.yoga.foot"),
      note: t("homepage:subprofiles.personas.yoga.note"),
      laneLabel: t("homepage:subprofiles.personas.yoga.laneLabel"),
    },
    poetry: {
      key: "poetry",
      initials: "SM",
      // A pen name gets a pen: this side of Sofia keeps her face out of it.
      avatarUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a",
      name: "S. Marques",
      tint: "mute",
      visibility: "network",
      link: "standalone",
      role: t("homepage:subprofiles.personas.poetry.role"),
      sub: t("homepage:subprofiles.personas.poetry.sub"),
      cta: t("homepage:subprofiles.personas.poetry.cta"),
      bio: t("homepage:subprofiles.personas.poetry.bio"),
      meta: [
        t("homepage:subprofiles.personas.poetry.meta.0"),
        t("homepage:subprofiles.personas.poetry.meta.1"),
        t("homepage:subprofiles.personas.poetry.meta.2"),
      ],
      tiles: [
        // A typed poem held up on a sheet of paper.
        {
          label: t("homepage:subprofiles.personas.poetry.tiles.0.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1503775387537-3258ef9f1af9?q=80&w=800&h=280&auto=format&fit=crop",
        },
        // Red roses across an open poetry book.
        {
          label: t("homepage:subprofiles.personas.poetry.tiles.1.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1513094116080-a9255c930d1a?q=80&w=800&h=280&auto=format&fit=crop",
        },
        // Lilacs beside a handwritten page and a fountain pen.
        {
          label: t("homepage:subprofiles.personas.poetry.tiles.2.label"),
          imageUrl:
            "https://images.unsplash.com/photo-1529251333259-d36cccaf22ea?q=80&w=1200&h=200&auto=format&fit=crop",
        },
      ],
      foot: t("homepage:subprofiles.personas.poetry.foot"),
      note: t("homepage:subprofiles.personas.poetry.note"),
      laneLabel: t("homepage:subprofiles.personas.poetry.laneLabel"),
    },
  };
}

/** Main profile first, then the personas. Drives the stage's persona rail and
 * the showcase's auto-rotation. */
export const PERSONA_ORDER: PersonaKey[] = ["main", "drag", "yoga", "poetry"];

export const DEFAULT_PERSONA_KEY: PersonaKey = "drag";

/** Props the stage layout takes. The showcase owns the selection and the
 * rotation, so the layout only renders them and reports clicks. */
export interface PersonasLayoutProps {
  selectedKey: PersonaKey;
  onSelect: (key: PersonaKey) => void;
}

interface AudienceCopyKeys {
  label: string;
  help: string;
}

/** Catalog keys for the "who sees this" labels. They restate the persona
 * editor's own choices (subprofiles:visibility.*, subprofiles:link.*) in the
 * homepage namespace, so the homepage never depends on the subprofiles
 * catalog. */
export const VISIBILITY_COPY_KEYS: Record<PersonaVisibility, AudienceCopyKeys> =
  {
    open: {
      label: "homepage:subprofiles.visibility.open",
      help: "homepage:subprofiles.visibility.openHelp",
    },
    network: {
      label: "homepage:subprofiles.visibility.network",
      help: "homepage:subprofiles.visibility.networkHelp",
    },
  };

export const LINK_COPY_KEYS: Record<PersonaLink, AudienceCopyKeys> = {
  main: {
    label: "homepage:subprofiles.link.main",
    help: "homepage:subprofiles.link.mainHelp",
  },
  linked: {
    label: "homepage:subprofiles.link.linked",
    help: "homepage:subprofiles.link.linkedHelp",
  },
  standalone: {
    label: "homepage:subprofiles.link.standalone",
    help: "homepage:subprofiles.link.standaloneHelp",
  },
};
