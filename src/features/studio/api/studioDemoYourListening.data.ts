import {
  currentUser,
  currentUserSlug,
} from "../../members/data/demoCurrentUser";
import type { StudioPlaylistPersonDTO } from "./studio.types";

/** The server pages 30; the demo pages 8 so Show more can be reviewed. */
export const DEMO_RECENT_PAGE_SIZE = 8;

/** The demo account as a supporter shows it, read from the demo current user. */
export const DEMO_ACCOUNT_MEMBER: StudioPlaylistPersonDTO = {
  slug: currentUserSlug,
  displayName: `${currentUser.first} ${currentUser.last}`,
  avatarUrl: currentUser.photo ?? null,
};

/** The demo viewer's listening history. Track ids are literals from the
 *  published releases of NIGHTFORM, Lua Cardoso, Vanda Diesel and three other
 *  artists; none belongs to a persona the viewer owns (self-plays record
 *  nothing). Inside the last 28 days NIGHTFORM leads with one track played
 *  three times, so a small exact count shows. The one null track is a row the
 *  viewer can no longer play. The oldest row is about 11.5 months back. */
export const DEMO_LISTEN_SEEDS: readonly {
  id: string;
  trackId: string | null;
  hoursAgo: number;
}[] = [
  { id: "demo-listen-1", trackId: "demo-track-home-4-01", hoursAgo: 5 },
  { id: "demo-listen-2", trackId: "demo-track-vanda-mass-01", hoursAgo: 20 },
  { id: "demo-listen-3", trackId: "demo-track-home-4-01", hoursAgo: 30 },
  { id: "demo-listen-4", trackId: "demo-track-lua-01", hoursAgo: 52 },
  { id: "demo-listen-5", trackId: "demo-track-home-4-01", hoursAgo: 100 },
  { id: "demo-listen-6", trackId: "demo-track-home-1-01", hoursAgo: 130 },
  { id: "demo-listen-7", trackId: "demo-track-lua-02", hoursAgo: 200 },
  {
    id: "demo-listen-8",
    trackId: "demo-track-vanda-motorbike-01",
    hoursAgo: 260,
  },
  { id: "demo-listen-9", trackId: "demo-track-home-2-01", hoursAgo: 330 },
  { id: "demo-listen-10", trackId: "demo-track-home-3-01", hoursAgo: 400 },
  { id: "demo-listen-11", trackId: null, hoursAgo: 450 },
  { id: "demo-listen-12", trackId: "demo-track-home-1-01", hoursAgo: 520 },
  { id: "demo-listen-13", trackId: "demo-track-vanda-mass-01", hoursAgo: 700 },
  { id: "demo-listen-14", trackId: "demo-track-lua-03", hoursAgo: 982 },
  { id: "demo-listen-15", trackId: "demo-track-home-4-01", hoursAgo: 1275 },
  {
    id: "demo-listen-16",
    trackId: "demo-track-vanda-motorbike-01",
    hoursAgo: 1579,
  },
  { id: "demo-listen-17", trackId: "demo-track-lua-01", hoursAgo: 1861 },
  { id: "demo-listen-18", trackId: "demo-track-vanda-mass-01", hoursAgo: 2154 },
  { id: "demo-listen-19", trackId: "demo-track-home-1-01", hoursAgo: 2458 },
  { id: "demo-listen-20", trackId: "demo-track-home-4-01", hoursAgo: 2740 },
  { id: "demo-listen-21", trackId: "demo-track-lua-02", hoursAgo: 3033 },
  {
    id: "demo-listen-22",
    trackId: "demo-track-vanda-motorbike-01",
    hoursAgo: 3337,
  },
  { id: "demo-listen-23", trackId: "demo-track-home-2-01", hoursAgo: 3619 },
  { id: "demo-listen-24", trackId: "demo-track-lua-03", hoursAgo: 3912 },
  { id: "demo-listen-25", trackId: "demo-track-home-4-01", hoursAgo: 4216 },
  { id: "demo-listen-26", trackId: "demo-track-vanda-mass-01", hoursAgo: 4498 },
  { id: "demo-listen-27", trackId: "demo-track-lua-01", hoursAgo: 4791 },
  { id: "demo-listen-28", trackId: "demo-track-home-3-01", hoursAgo: 5095 },
  {
    id: "demo-listen-29",
    trackId: "demo-track-vanda-motorbike-01",
    hoursAgo: 5377,
  },
  { id: "demo-listen-30", trackId: "demo-track-home-4-01", hoursAgo: 5670 },
  { id: "demo-listen-31", trackId: "demo-track-lua-02", hoursAgo: 5974 },
  { id: "demo-listen-32", trackId: "demo-track-home-1-01", hoursAgo: 6256 },
  { id: "demo-listen-33", trackId: "demo-track-vanda-mass-01", hoursAgo: 6549 },
  { id: "demo-listen-34", trackId: "demo-track-home-4-01", hoursAgo: 6853 },
  { id: "demo-listen-35", trackId: "demo-track-lua-03", hoursAgo: 7135 },
  {
    id: "demo-listen-36",
    trackId: "demo-track-vanda-motorbike-01",
    hoursAgo: 7428,
  },
  { id: "demo-listen-37", trackId: "demo-track-lua-01", hoursAgo: 7732 },
  { id: "demo-listen-38", trackId: "demo-track-home-2-01", hoursAgo: 8014 },
  { id: "demo-listen-39", trackId: "demo-track-vanda-mass-01", hoursAgo: 8307 },
  { id: "demo-listen-40", trackId: "demo-track-home-4-01", hoursAgo: 8611 },
];

/** The viewer's opt-ins: NIGHTFORM shown as the account, Vanda Diesel shown
 *  as the viewer's persona Mariana Sol. The viewer never supports Mariana or
 *  Late Bloomers (their own). */
export const DEMO_SUPPORTER_SEEDS: readonly {
  subprofileId: string;
  shownAsSubprofileId: string | null;
  daysAgo: number;
}[] = [
  {
    subprofileId: "sp-diogo-nightform",
    shownAsSubprofileId: null,
    daysAgo: 40,
  },
  {
    subprofileId: "sp-ines-fonseca-vanda-diesel",
    shownAsSubprofileId: "demo-persona-mariana-sol",
    daysAgo: 12,
  },
];
