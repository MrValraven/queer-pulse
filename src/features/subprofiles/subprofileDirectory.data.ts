import type { SubprofileKind } from "./api/subprofiles.api";

/** The kinds shown as directory filter chips, in a deliberate display order
 *  (labels come from `KIND_LABELS`). An "All" chip is rendered before these. */
export const DIRECTORY_KINDS: SubprofileKind[] = [
  "developer",
  "writer",
  "musician",
  "visual_artist",
  "filmmaker",
  "designer",
  "maker",
  "drag",
  "dj",
  "dancer",
  "performer",
  "photographer",
  "videomaker",
  "chef",
  "mixologist",
  "therapist",
  "generic",
];
