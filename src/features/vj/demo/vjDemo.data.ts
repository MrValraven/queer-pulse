/**
 * Seed of the demo VJ library: three packs over the eight generated clips of
 * `vjDemoMedia.data.ts`, two scenes and one set list of scene and clip steps
 * (C 9.5, sequences contract 10.5). Ids are fixed v4-shaped uuids so the
 * shared uuid checks pass; clips follow the generator's slug order. Pack, scene and set list names are English data
 * (user content).
 */
import type {
  VjCreatorDTO,
  VjFitMode,
  VjLoopMode,
  VjMix,
  VjSceneLook,
  VjSpeed,
  VjStepDuration,
} from "../../../shared/contracts/vj";
import { VJ_DEMO_EVENT_IDS } from "./vjDemoEvents.data";

export interface VjDemoClipSeed {
  id: string;
  slug: string;
  createdDaysAgo: number;
  fitMode: VjFitMode;
  creator: "marta" | "rafa";
  isFavorite: boolean;
  defaultSpeed: VjSpeed;
  /** Every seed clip is a GIF, so none carries loop points. */
  loopMode: VjLoopMode;
}

export interface VjDemoPackSeed {
  id: string;
  name: string;
  clipIds: string[];
  creator: "marta" | "rafa";
  /** The demo event the pack links, from `vjDemoEvents.data.ts`. */
  eventId: string | null;
}

export interface VjDemoSceneSeed {
  id: string;
  name: string;
  packId: string | null;
  look: VjSceneLook;
  creator: "marta" | "rafa";
}

/** One seed step; a null duration plays the sequence default. */
export type VjDemoSetlistItemSeed =
  | { kind: "scene"; sceneId: string; duration: VjStepDuration | null }
  | { kind: "clip"; clipId: string; duration: VjStepDuration | null };

export interface VjDemoSetlistSeed {
  id: string;
  name: string;
  isLooping: boolean;
  stepDuration: VjStepDuration;
  items: VjDemoSetlistItemSeed[];
  creator: "marta" | "rafa";
}

/** Invented staff members who built the demo library. */
export const VJ_DEMO_CREATORS: Record<"marta" | "rafa", VjCreatorDTO> = {
  marta: {
    userId: "00000000-0000-4000-8000-0000000000e1",
    displayName: "Marta Lobo",
  },
  rafa: {
    userId: "00000000-0000-4000-8000-0000000000e2",
    displayName: "Rafa Quintas",
  },
};

const NEON_GRID_ID = "00000000-0000-4000-8000-0000000000c1";
const WARM_HAZE_ID = "00000000-0000-4000-8000-0000000000c2";
const DISCO_DOTS_ID = "00000000-0000-4000-8000-0000000000c3";
const PINK_TUNNEL_ID = "00000000-0000-4000-8000-0000000000c4";
const SUNSET_BARS_ID = "00000000-0000-4000-8000-0000000000c5";
const PIXEL_HEART_ID = "00000000-0000-4000-8000-0000000000c6";
const TALL_RIBBON_ID = "00000000-0000-4000-8000-0000000000c7";
const STATIC_BLOOM_ID = "00000000-0000-4000-8000-0000000000c8";

const WARM_UP_PACK_ID = "00000000-0000-4000-8000-0000000000a1";
const PEAK_HOUR_PACK_ID = "00000000-0000-4000-8000-0000000000a2";

const WARM_UP_SCENE_ID = "00000000-0000-4000-8000-0000000000d1";
const PEAK_SCENE_ID = "00000000-0000-4000-8000-0000000000d2";

export const VJ_DEMO_SEED: {
  packs: VjDemoPackSeed[];
  clips: VjDemoClipSeed[];
} = {
  packs: [
    {
      id: WARM_UP_PACK_ID,
      name: "Warm-up",
      clipIds: [NEON_GRID_ID, WARM_HAZE_ID, TALL_RIBBON_ID],
      creator: "marta",
      eventId: VJ_DEMO_EVENT_IDS.supperClub,
    },
    {
      id: PEAK_HOUR_PACK_ID,
      name: "Peak hour",
      clipIds: [DISCO_DOTS_ID, NEON_GRID_ID, PINK_TUNNEL_ID, PIXEL_HEART_ID],
      creator: "rafa",
      eventId: null,
    },
    {
      id: "00000000-0000-4000-8000-0000000000a3",
      name: "Closing",
      clipIds: [WARM_HAZE_ID, SUNSET_BARS_ID],
      creator: "marta",
      eventId: null,
    },
  ],
  clips: [
    {
      id: NEON_GRID_ID,
      slug: "neon-grid",
      createdDaysAgo: 8,
      fitMode: "fill",
      creator: "marta",
      isFavorite: true,
      defaultSpeed: 1,
      loopMode: "loop",
    },
    {
      id: WARM_HAZE_ID,
      slug: "warm-haze",
      createdDaysAgo: 7,
      fitMode: "fill",
      creator: "rafa",
      isFavorite: false,
      defaultSpeed: 1,
      loopMode: "loop",
    },
    {
      id: DISCO_DOTS_ID,
      slug: "disco-dots",
      createdDaysAgo: 6,
      fitMode: "fill",
      creator: "marta",
      isFavorite: false,
      defaultSpeed: 1,
      loopMode: "loop",
    },
    {
      id: PINK_TUNNEL_ID,
      slug: "pink-tunnel",
      createdDaysAgo: 5,
      fitMode: "fill",
      creator: "rafa",
      isFavorite: false,
      defaultSpeed: 1,
      loopMode: "loop",
    },
    {
      id: SUNSET_BARS_ID,
      slug: "sunset-bars",
      createdDaysAgo: 4,
      fitMode: "fill",
      creator: "marta",
      isFavorite: false,
      defaultSpeed: 1,
      loopMode: "loop",
    },
    {
      id: PIXEL_HEART_ID,
      slug: "pixel-heart",
      createdDaysAgo: 3,
      fitMode: "fill",
      creator: "rafa",
      isFavorite: false,
      defaultSpeed: 1,
      loopMode: "loop",
    },
    {
      id: TALL_RIBBON_ID,
      slug: "tall-ribbon",
      createdDaysAgo: 2,
      fitMode: "fit",
      creator: "marta",
      isFavorite: false,
      defaultSpeed: 1,
      loopMode: "loop",
    },
    {
      id: STATIC_BLOOM_ID,
      slug: "static-bloom",
      createdDaysAgo: 1,
      fitMode: "fill",
      creator: "rafa",
      isFavorite: false,
      defaultSpeed: 1,
      loopMode: "loop",
    },
  ],
};

/** The C 3.5 overlay defaults without `hideAt`: hidden, so a recall clears any text. */
const HIDDEN_OVERLAY: VjSceneLook["overlay"] = {
  text: "",
  style: "big",
  isVisible: false,
  position: "center",
  size: "l",
  colorToken: "cream",
};

const EMPTY_MIX: VjMix = { clipId: null, amount: 0, blendMode: "normal" };

/** "Warm up" files under Warm-up (C 9.5); "Peak" under Peak hour (plan call 6). */
export const VJ_DEMO_SCENE_SEEDS: readonly VjDemoSceneSeed[] = [
  {
    id: WARM_UP_SCENE_ID,
    name: "Warm up",
    packId: WARM_UP_PACK_ID,
    look: {
      source: { kind: "clip", clipId: WARM_HAZE_ID },
      effects: {
        speed: 1,
        settings: { tint: { isOn: true, amount: 0.5, variant: "coral" } },
      },
      transition: { mode: "fade", length: { unit: "beats", value: 2 } },
      overlay: { ...HIDDEN_OVERLAY },
      mix: { ...EMPTY_MIX },
    },
    creator: "marta",
  },
  {
    id: PEAK_SCENE_ID,
    name: "Peak",
    packId: PEAK_HOUR_PACK_ID,
    look: {
      source: {
        kind: "generator",
        generatorId: "prideFlagWave",
        generatorVariant: "rainbow",
      },
      effects: {
        speed: 1,
        // Catalog order: kaleidoscope sits before beatPulse.
        settings: {
          kaleidoscope: { isOn: true, amount: 0.5, variant: "6" },
          beatPulse: { isOn: true, amount: 0.5, variant: null },
        },
      },
      transition: { mode: "cut", length: { unit: "ms", value: 800 } },
      overlay: { ...HIDDEN_OVERLAY },
      mix: { ...EMPTY_MIX },
    },
    creator: "rafa",
  },
];

/** "Friday set" loops on 8 s steps: a scene, a clip, a scene held for 16
 *  beats, a clip (sequences contract 10.5). */
export const VJ_DEMO_SETLIST_SEEDS: readonly VjDemoSetlistSeed[] = [
  {
    id: "00000000-0000-4000-8000-0000000000b1",
    name: "Friday set",
    isLooping: true,
    stepDuration: { kind: "seconds", value: 8 },
    items: [
      { kind: "scene", sceneId: WARM_UP_SCENE_ID, duration: null },
      { kind: "clip", clipId: PINK_TUNNEL_ID, duration: null },
      {
        kind: "scene",
        sceneId: PEAK_SCENE_ID,
        duration: { kind: "beats", value: 16 },
      },
      { kind: "clip", clipId: DISCO_DOTS_ID, duration: null },
    ],
    creator: "rafa",
  },
];
