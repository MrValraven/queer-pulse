import type { StudioCurationShelf } from "./studio.types";
import { DEMO_DEFAULT_RELEASE_ID } from "./studioDemoMe.data";

export interface DemoCuratedPickSeed {
  id: string;
  releaseId: string;
  /** Staff content, written in one language and shown as written. */
  note: string | null;
  createdAt: string;
}

/** The demo's featured release and two shelves, in shelf order. */
export const DEMO_CURATION_SEED: Record<
  StudioCurationShelf,
  DemoCuratedPickSeed[]
> = {
  featured: [
    {
      id: "demo-pick-featured",
      releaseId: DEMO_DEFAULT_RELEASE_ID,
      note: "Ten years of letters, recorded in a kitchen in Anjos with one cellist",
      createdAt: "2026-10-06T09:00:00.000Z",
    },
  ],
  staff_picks: [
    {
      id: "demo-pick-staff-1",
      releaseId: "demo-release-home-2",
      note: "Ninety minutes for the hour after the lights come up",
      createdAt: "2026-10-01T09:00:00.000Z",
    },
    {
      id: "demo-pick-staff-2",
      releaseId: "demo-release-mariana-3",
      note: "Start with Ladainha",
      createdAt: "2026-09-24T09:00:00.000Z",
    },
    {
      id: "demo-pick-staff-3",
      releaseId: "demo-release-home-3",
      note: null,
      createdAt: "2026-09-18T09:00:00.000Z",
    },
  ],
  new_this_week: [
    {
      id: "demo-pick-new-1",
      releaseId: "demo-release-home-1",
      note: "A folk song about a kitchen and one long April",
      createdAt: "2026-10-12T09:00:00.000Z",
    },
    {
      id: "demo-pick-new-2",
      releaseId: "demo-release-home-4",
      note: null,
      createdAt: "2026-10-11T09:00:00.000Z",
    },
  ],
};
