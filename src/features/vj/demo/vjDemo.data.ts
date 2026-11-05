/**
 * Seed of the demo VJ library: three packs over the eight generated clips of
 * `vjDemoMedia.data.ts`. Ids are fixed v4-shaped uuids so the shared uuid
 * checks pass; clips follow the generator's slug order.
 */
import type { VjCreatorDTO, VjFitMode } from "../../../shared/contracts/vj";

export interface VjDemoClipSeed {
  id: string;
  slug: string;
  createdDaysAgo: number;
  fitMode: VjFitMode;
  creator: "marta" | "rafa";
}

export interface VjDemoPackSeed {
  id: string;
  name: string;
  clipIds: string[];
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

export const VJ_DEMO_SEED: {
  packs: VjDemoPackSeed[];
  clips: VjDemoClipSeed[];
} = {
  packs: [
    {
      id: "00000000-0000-4000-8000-0000000000a1",
      name: "Warm-up",
      clipIds: [NEON_GRID_ID, WARM_HAZE_ID, TALL_RIBBON_ID],
      creator: "marta",
    },
    {
      id: "00000000-0000-4000-8000-0000000000a2",
      name: "Peak hour",
      clipIds: [DISCO_DOTS_ID, NEON_GRID_ID, PINK_TUNNEL_ID, PIXEL_HEART_ID],
      creator: "rafa",
    },
    {
      id: "00000000-0000-4000-8000-0000000000a3",
      name: "Closing",
      clipIds: [WARM_HAZE_ID, SUNSET_BARS_ID],
      creator: "marta",
    },
  ],
  clips: [
    {
      id: NEON_GRID_ID,
      slug: "neon-grid",
      createdDaysAgo: 8,
      fitMode: "fill",
      creator: "marta",
    },
    {
      id: WARM_HAZE_ID,
      slug: "warm-haze",
      createdDaysAgo: 7,
      fitMode: "fill",
      creator: "rafa",
    },
    {
      id: DISCO_DOTS_ID,
      slug: "disco-dots",
      createdDaysAgo: 6,
      fitMode: "fill",
      creator: "marta",
    },
    {
      id: PINK_TUNNEL_ID,
      slug: "pink-tunnel",
      createdDaysAgo: 5,
      fitMode: "fill",
      creator: "rafa",
    },
    {
      id: SUNSET_BARS_ID,
      slug: "sunset-bars",
      createdDaysAgo: 4,
      fitMode: "fill",
      creator: "marta",
    },
    {
      id: PIXEL_HEART_ID,
      slug: "pixel-heart",
      createdDaysAgo: 3,
      fitMode: "fill",
      creator: "rafa",
    },
    {
      id: TALL_RIBBON_ID,
      slug: "tall-ribbon",
      createdDaysAgo: 2,
      fitMode: "fit",
      creator: "marta",
    },
    {
      id: STATIC_BLOOM_ID,
      slug: "static-bloom",
      createdDaysAgo: 1,
      fitMode: "fill",
      creator: "rafa",
    },
  ],
};
