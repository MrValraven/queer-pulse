import type { Member } from "./members";
import gabriellaPhoto from "../../../assets/gaby2.jpeg";
import philippinePhoto from "../../../assets/philippine.jpeg";

/**
 * Real, vouched-for members — the people actually joining QueerPulse.
 *
 * This file is deliberately separate from the seed registry in `./members`:
 * everything in there is prototype fiction, everything here is a real person.
 * `MEMBERS` merges the two (real entries last, so they win on slug collisions),
 * which keeps the demo populated while the real community grows — and lets us
 * delete the seed data in one move once there are enough real profiles.
 *
 * Writing an entry:
 * - Only fill fields you actually have. Empty `work`/`board`/`skills`/`groups`/
 *   `activity`/`related` arrays and an empty `shapings` are fine — every profile
 *   section returns `null` when its data is empty.
 * - Never invent `pronouns`, `hood`, or vouchers for a real person. Leave the
 *   optional ones off and use a neutral placeholder for the required ones.
 * - `verified: true` is what renders the "Vouched by …" line, so `vouchers` and
 *   `voucherNames` must name people who really vouched.
 * - Portraits live in `src/assets/` and are imported (not remote URLs), so they
 *   get hashed and bundled by Vite.
 */
export const REAL_ENTRIES: Record<string, Omit<Member, "id">> = {
  gabriella: {
    slug: "gabriella",
    first: "Gabriella",
    last: "E.C",
    role: "Marketer, analyst & trainer",
    pronouns: "she/her",
    // Placeholder until she tells us her neighbourhood.
    hood: "Lisboa",
    tags: [
      "Data analysis",
      "Marketing",
      "Training",
      "Personal training",
      "Yoga",
    ],
    visibility: "open",
    initials: "GE",
    tint: "coral",
    photo: gabriellaPhoto,
    verified: true,
    since: "2026",
    bio: "I am a Londoner in Lisbon looking to collaborate with others who centre community, compassion and growth, in a world that is designed to isolate. I am a solutions driven marketer, analyst and trainer who is always looking for ways to use my skills to support and foster community.",
    now: "Looking for ways to put marketing, analysis and training to work for community here in Lisbon.",
    openTo: [{ kind: "preset", id: "collaborating" }],
    work: [],
    board: [],
    vouchers: ["tiago"],
    voucherNames: "Tiago",
    related: [],
    skills: [
      { name: "Data analysis", meta: "Marketing & performance analytics" },
      { name: "Marketing", meta: "Strategy, campaigns & comms" },
      { name: "Personal training", meta: "One-to-one coaching" },
      { name: "Yoga teaching", meta: "Classes & sessions" },
    ],
    groups: [],
    activity: [],
    shapings: {},
  },
  philippine: {
    slug: "philippine",
    first: "Philippine",
    last: "Leclerc",
    role: "Dancer, model & venture builder",
    pronouns: "she/her",
    // Placeholder until she tells us her neighbourhood.
    hood: "Lisboa",
    tags: [
      "Venture capital",
      "Sustainability",
      "Dance",
      "Modelling",
      "Ecosystem building",
    ],
    visibility: "open",
    initials: "PL",
    tint: "jade",
    photo: philippinePhoto,
    verified: true,
    since: "2026",
    bio: "My journey has always been about bridging worlds: from the grace of dance stages to the runway of fashion shows, and now to the world of innovation and sustainability. As a professional dancer and model, I've performed in fashion shows and TV commercials, bringing artistry and presence to every project, and that creative foundation shapes how I approach ecosystem building and impact-driven innovation. Today I'm building my path in venture capital through VC Lab's Venture Institute, supporting entrepreneurs and scaling sustainable, tech-enabled solutions across Europe and Africa.",
    now: "Building my path in venture capital through VC Lab's Venture Institute, and backing sustainable, tech-enabled ventures across Europe and Africa.",
    openTo: [
      { kind: "preset", id: "collaborating" },
      { kind: "preset", id: "mentoring" },
    ],
    work: [],
    board: [],
    vouchers: ["tiago"],
    voucherNames: "Tiago",
    related: [],
    skills: [
      { name: "Venture capital", meta: "VC Lab Venture Institute" },
      { name: "Ecosystem building", meta: "Impact-driven innovation" },
      { name: "Sustainability", meta: "Tech-enabled solutions" },
      { name: "Dance", meta: "Professional performance" },
      { name: "Modelling", meta: "Fashion shows & TV commercials" },
    ],
    groups: [],
    activity: [],
    shapings: {},
  },
};
