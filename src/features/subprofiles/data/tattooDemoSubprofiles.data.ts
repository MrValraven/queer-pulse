import { currentUserSlug } from "../../members/data/demoCurrentUser";
import { memberName } from "../../members/data/members";
import type { DemoSubprofile } from "./subprofiles.data";

// ── Tattoo artist demo personas ──────────────────────────────────────────────
// The four artists on Tinta Viva's team (`listBusiness/api/listingTeam.demo.data.ts`
// holds the matching team rows). Unlinked, so their owners stay unnamed. The
// demo viewer's own persona, Agulha Lenta, takes the next free position among
// the viewer's personas (the draft is 0, Late Bloomers is 1).

type TattooPersonaDefaults = Pick<
  DemoSubprofile,
  | "avatarUrl"
  | "coverUrl"
  | "accent"
  | "availability"
  | "ctaLabel"
  | "ctaUrl"
  | "socialLinks"
  | "linkVisibility"
  | "visibility"
  | "status"
  | "endorsementCount"
  | "viewerEndorsed"
  | "followerCount"
  | "viewerFollowing"
  | "affiliations"
  | "endorsers"
  | "items"
>;

const tattooPersonaDefaults = (): TattooPersonaDefaults => ({
  avatarUrl: null,
  coverUrl: null,
  accent: null,
  availability: null,
  ctaLabel: null,
  ctaUrl: null,
  socialLinks: [],
  linkVisibility: "unlinked",
  visibility: "open",
  status: "published",
  endorsementCount: 0,
  viewerEndorsed: false,
  followerCount: 0,
  viewerFollowing: false,
  affiliations: [],
  endorsers: [],
  items: [],
});

const ROSA_BRAVA: DemoSubprofile = {
  ...tattooPersonaDefaults(),
  ownerSlug: "rita",
  ownerName: memberName("rita"),
  id: "sp-rita-rosa-brava",
  kind: "tattoo_artist",
  slug: "rosa-brava",
  handle: "rosa-brava",
  displayName: "Rosa Brava",
  tagline: "bold botanicals and big colour",
  bio: "i grew up drawing flowers on my school books and now i put them on people, loud and bright and a bit wild, and my favourite clients are the ones nervous about a first tattoo",
  position: 0,
};

const LINHA_FINA: DemoSubprofile = {
  ...tattooPersonaDefaults(),
  ownerSlug: "kai",
  ownerName: memberName("kai"),
  id: "sp-kai-linha-fina",
  kind: "tattoo_artist",
  slug: "linha-fina",
  handle: "linha-fina",
  displayName: "Linha Fina",
  tagline: "fine line and tiny quiet things",
  bio: "single needle work is my whole thing, small lettering and little constellations and anything that fits on a wrist, and i keep my sessions slow so you can breathe between lines",
  position: 0,
};

const AGULHA_LENTA: DemoSubprofile = {
  ...tattooPersonaDefaults(),
  ownerSlug: currentUserSlug,
  ownerName: "Tiago Costa",
  id: "sp-tiago-agulha-lenta",
  kind: "tattoo_artist",
  slug: "agulha-lenta",
  handle: "agulha-lenta",
  displayName: "Agulha Lenta",
  tagline: "hand poked, one dot at a time",
  bio: "a needle and a lot of patience is all i use, and every piece takes the time it takes, and i love covering scars and old pieces you outgrew and starting something that feels like yours",
  position: 2,
};

const FUMO_AZUL: DemoSubprofile = {
  ...tattooPersonaDefaults(),
  ownerSlug: "anika",
  ownerName: memberName("anika"),
  id: "sp-anika-fumo-azul",
  kind: "tattoo_artist",
  slug: "fumo-azul",
  handle: "fumo-azul",
  displayName: "Fumo Azul",
  tagline: "blackwork and blue ink smoke",
  bio: "heavy black shapes and soft blue shading are what i love most, big back pieces and sleeves that grow over a few sessions, and come with a rough idea because we sketch it together",
  position: 0,
};

/** The four Tinta Viva artists, appended to `DEMO_SUBPROFILES`. */
export const TATTOO_DEMO_SUBPROFILES: DemoSubprofile[] = [
  ROSA_BRAVA,
  LINHA_FINA,
  AGULHA_LENTA,
  FUMO_AZUL,
];
