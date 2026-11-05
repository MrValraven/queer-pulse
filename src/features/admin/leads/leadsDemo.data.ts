import type { LeadEntryKind, LeadStage, LeadType } from "./api/leads.types";

// The demo leads: invented artists, venues and promoters the music team is
// talking to. Every name, address and handle here is made up; links point at
// `.example` sites or handles ending in `demo`. Follow-up dates are day
// offsets from today, so the due ones stay due whenever the demo runs.

/** One history line, written `daysAgo` days before the demo loads. */
export interface DemoLeadEntrySeed {
  kind: LeadEntryKind;
  daysAgo: number;
  /** A key of `DEMO_LEAD_AUTHORS`, or null for an account that is gone. */
  authorId: string | null;
  body?: string;
  fromStage?: LeadStage;
  toStage?: LeadStage;
  /** A `DEMO_SUBPROFILES` id; null for a persona that no longer exists. */
  personaId?: string | null;
  isEdited?: boolean;
}

export interface DemoLeadRecord {
  id: string;
  name: string;
  type: LeadType;
  stage: LeadStage;
  location: string | null;
  email: string | null;
  phone: string | null;
  links: string[];
  /** Days from today; negative is in the past. */
  followUpOffsetDays: number | null;
  linkedPersonaId: string | null;
  /** Oldest first; the first one is always the `created` line. */
  entries: DemoLeadEntrySeed[];
}

export interface DemoLeadsSeed {
  leads: DemoLeadRecord[];
}

/** The staff members who wrote the seeded history. */
export const DEMO_LEAD_AUTHORS: Record<
  string,
  { displayName: string; avatarUrl: string | null }
> = {
  "demo-staff-marta": { displayName: "Marta Lobo", avatarUrl: null },
  "demo-staff-rafa": { displayName: "Rafa Quintas", avatarUrl: null },
};

const MARTA = "demo-staff-marta";
const RAFA = "demo-staff-rafa";

export const DEMO_LEADS_SEED: DemoLeadsSeed = {
  leads: [
    {
      id: "demo-lead-lua-marques",
      name: "Lua Marques",
      type: "artist",
      stage: "in_talks",
      location: "Lisbon",
      email: "lua.marques@example.org",
      phone: null,
      links: [
        "https://instagram.com/luamarques.demo",
        "https://soundcloud.com/luamarques-demo",
      ],
      followUpOffsetDays: -2,
      linkedPersonaId: null,
      entries: [
        {
          kind: "created",
          daysAgo: 30,
          authorId: MARTA,
          toStage: "to_contact",
        },
        {
          kind: "note",
          daysAgo: 29,
          authorId: MARTA,
          body: "Saw her live set at a friend's party, soft synths and spoken word",
        },
        {
          kind: "stage_changed",
          daysAgo: 25,
          authorId: MARTA,
          fromStage: "to_contact",
          toStage: "contacted",
        },
        {
          kind: "stage_changed",
          daysAgo: 12,
          authorId: RAFA,
          fromStage: "contacted",
          toStage: "in_talks",
        },
        {
          kind: "note",
          daysAgo: 12,
          authorId: RAFA,
          body: "she's keen on a spring date and I'm sending her the tech sheet",
          isEdited: true,
        },
      ],
    },
    {
      id: "demo-lead-kai-duarte",
      name: "Kai Duarte",
      type: "dj",
      stage: "contacted",
      location: "Porto",
      email: null,
      phone: "+351 000 000 101",
      links: [
        "https://instagram.com/kaiduarte.demo",
        "https://www.mixcloud.com/kaiduarte-demo/",
        "https://ra.co/dj/kaiduartedemo",
        "https://soundcloud.com/kaiduarte-demo",
      ],
      followUpOffsetDays: 0,
      linkedPersonaId: null,
      entries: [
        { kind: "created", daysAgo: 20, authorId: RAFA, toStage: "to_contact" },
        {
          kind: "note",
          daysAgo: 20,
          authorId: RAFA,
          body: "Plays long house sets in Porto, asked around and people love them",
        },
        {
          kind: "stage_changed",
          daysAgo: 9,
          authorId: RAFA,
          fromStage: "to_contact",
          toStage: "contacted",
        },
      ],
    },
    {
      id: "demo-lead-os-farois",
      name: "Os Faróis",
      type: "band",
      stage: "to_contact",
      location: "Coimbra",
      email: null,
      phone: null,
      links: [
        "https://osfarois-demo.bandcamp.com",
        "https://youtube.com/@osfaroisdemo",
      ],
      followUpOffsetDays: 5,
      linkedPersonaId: null,
      entries: [
        { kind: "created", daysAgo: 6, authorId: MARTA, toStage: "to_contact" },
        {
          kind: "note",
          daysAgo: 6,
          authorId: MARTA,
          body: "four piece, folk with drum machines and we write after their Coimbra show",
        },
      ],
    },
    {
      id: "demo-lead-cave-23",
      name: "Cave 23",
      type: "venue",
      stage: "in_talks",
      location: "Lisbon, Marvila",
      email: "bookings@cave23.example",
      phone: "+351 000 000 223",
      links: ["https://cave23.example", "https://instagram.com/cave23.demo"],
      followUpOffsetDays: -6,
      linkedPersonaId: null,
      entries: [
        { kind: "created", daysAgo: 40, authorId: RAFA, toStage: "to_contact" },
        {
          kind: "stage_changed",
          daysAgo: 35,
          authorId: RAFA,
          fromStage: "to_contact",
          toStage: "contacted",
        },
        {
          kind: "stage_changed",
          daysAgo: 21,
          authorId: MARTA,
          fromStage: "contacted",
          toStage: "in_talks",
        },
        {
          kind: "note",
          daysAgo: 21,
          authorId: MARTA,
          body: "capacity 180 and they can host a monthly Friday from March",
        },
        {
          kind: "note",
          daysAgo: 14,
          authorId: RAFA,
          body: "Waiting on their door split proposal",
        },
      ],
    },
    {
      id: "demo-lead-rita-sol-producoes",
      name: "Rita Sol Produções",
      type: "promoter",
      stage: "not_now",
      location: "Faro",
      email: null,
      phone: null,
      links: ["https://facebook.com/ritasolproducoes.demo"],
      followUpOffsetDays: -10,
      linkedPersonaId: null,
      entries: [
        {
          kind: "created",
          daysAgo: 60,
          authorId: MARTA,
          toStage: "to_contact",
        },
        {
          kind: "stage_changed",
          daysAgo: 50,
          authorId: MARTA,
          fromStage: "to_contact",
          toStage: "contacted",
        },
        {
          kind: "stage_changed",
          daysAgo: 45,
          authorId: MARTA,
          fromStage: "contacted",
          toStage: "not_now",
        },
        {
          kind: "note",
          daysAgo: 45,
          authorId: MARTA,
          body: "busy with summer festivals till October so try again in the autumn",
        },
      ],
    },
    {
      id: "demo-lead-vanda-diesel",
      name: "Vanda Diesel",
      type: "artist",
      stage: "on_board",
      location: "Lisbon",
      email: null,
      phone: null,
      links: [
        "https://instagram.com/vandadiesel.demo",
        "https://tiktok.com/@vandadiesel.demo",
      ],
      followUpOffsetDays: -3,
      linkedPersonaId: "sp-ines-fonseca-vanda-diesel",
      entries: [
        { kind: "created", daysAgo: 50, authorId: RAFA, toStage: "to_contact" },
        {
          kind: "stage_changed",
          daysAgo: 40,
          authorId: RAFA,
          fromStage: "to_contact",
          toStage: "in_talks",
        },
        {
          kind: "stage_changed",
          daysAgo: 28,
          authorId: RAFA,
          fromStage: "in_talks",
          toStage: "on_board",
        },
        {
          kind: "persona_linked",
          daysAgo: 28,
          authorId: RAFA,
          personaId: "sp-ines-fonseca-vanda-diesel",
        },
        {
          kind: "note",
          daysAgo: 27,
          authorId: MARTA,
          body: "hosting the opening night and wants a short lip sync slot at midnight",
        },
      ],
    },
    {
      id: "demo-lead-afterhours",
      name: "Afterhours",
      type: "dj",
      stage: "on_board",
      location: "Lisbon",
      email: null,
      phone: null,
      links: ["https://soundcloud.com/afterhours-demo"],
      followUpOffsetDays: null,
      linkedPersonaId: "sp-jordan-afterhours",
      entries: [
        { kind: "created", daysAgo: 90, authorId: null, toStage: "to_contact" },
        {
          kind: "stage_changed",
          daysAgo: 80,
          authorId: null,
          fromStage: "to_contact",
          toStage: "on_board",
        },
        {
          kind: "persona_linked",
          daysAgo: 80,
          authorId: null,
          personaId: null,
        },
        {
          kind: "note",
          daysAgo: 60,
          authorId: RAFA,
          body: "Closing set confirmed for every second Saturday",
        },
        {
          kind: "persona_linked",
          daysAgo: 15,
          authorId: RAFA,
          personaId: "sp-jordan-afterhours",
        },
      ],
    },
    {
      id: "demo-lead-livraria-po",
      name: "Livraria Pó",
      type: "business",
      stage: "contacted",
      location: "Braga",
      email: "ola@livrariapo.example",
      phone: null,
      links: ["https://livrariapo.example"],
      followUpOffsetDays: 12,
      linkedPersonaId: null,
      entries: [
        {
          kind: "created",
          daysAgo: 15,
          authorId: MARTA,
          toStage: "to_contact",
        },
        {
          kind: "stage_changed",
          daysAgo: 10,
          authorId: MARTA,
          fromStage: "to_contact",
          toStage: "contacted",
        },
        {
          kind: "note",
          daysAgo: 10,
          authorId: MARTA,
          body: "Queer bookshop, could sell zines and tickets at the counter",
        },
      ],
    },
    {
      id: "demo-lead-zine-tinta",
      name: "Zine Tinta",
      type: "other",
      stage: "to_contact",
      location: "Lisbon",
      email: null,
      phone: null,
      links: ["https://instagram.com/zinetinta.demo"],
      followUpOffsetDays: null,
      linkedPersonaId: null,
      entries: [
        { kind: "created", daysAgo: 4, authorId: RAFA, toStage: "to_contact" },
        {
          kind: "note",
          daysAgo: 4,
          authorId: RAFA,
          body: "risograph collective, maybe a print table at the next market",
        },
      ],
    },
    {
      id: "demo-lead-coletivo-mare",
      name: "Coletivo Maré",
      type: "collective",
      stage: "contacted",
      location: "Setúbal",
      email: null,
      phone: null,
      links: ["https://x.com/coletivomare_demo"],
      followUpOffsetDays: -1,
      linkedPersonaId: null,
      entries: [
        {
          kind: "created",
          daysAgo: 18,
          authorId: MARTA,
          toStage: "to_contact",
        },
        {
          kind: "stage_changed",
          daysAgo: 8,
          authorId: MARTA,
          fromStage: "to_contact",
          toStage: "contacted",
        },
        {
          kind: "note",
          daysAgo: 8,
          authorId: MARTA,
          body: "they run beach parties in Setúbal and I asked for their spring calendar",
        },
      ],
    },
    {
      id: "demo-lead-mc-aurora",
      name: "MC Aurora",
      type: "artist",
      stage: "not_now",
      location: "Amadora",
      email: null,
      phone: null,
      links: [
        "https://tiktok.com/@mcaurora.demo",
        "https://open.spotify.com/artist/mcaurorademo",
      ],
      followUpOffsetDays: null,
      linkedPersonaId: null,
      entries: [
        { kind: "created", daysAgo: 70, authorId: RAFA, toStage: "to_contact" },
        {
          kind: "stage_changed",
          daysAgo: 55,
          authorId: RAFA,
          fromStage: "to_contact",
          toStage: "not_now",
        },
        {
          kind: "note",
          daysAgo: 55,
          authorId: RAFA,
          body: "recording an album this year and happy to talk again after the release",
        },
      ],
    },
    {
      id: "demo-lead-sala-ambar",
      name: "Sala Âmbar",
      type: "venue",
      stage: "to_contact",
      location: "Évora",
      email: null,
      phone: null,
      links: ["https://salaambar.example"],
      followUpOffsetDays: 2,
      linkedPersonaId: null,
      entries: [
        { kind: "created", daysAgo: 3, authorId: MARTA, toStage: "to_contact" },
        {
          kind: "note",
          daysAgo: 3,
          authorId: MARTA,
          body: "small theatre with a bar, good fit for an acoustic night",
        },
      ],
    },
  ],
};
