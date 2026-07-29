import { PICS } from "../gatheringPhotos.data";
import type { EventPhotoDTO } from "./events.api";

// Demo-mode stand-in. The prototype album renders tinted tiles with captions,
// not real image URLs, so each PIC becomes a captioned photo with an empty
// `url`. The photos page still renders the real `PICS` tiles in demo mode —
// this only keeps `useEventPhotos` network-free and typed when demoMode is on.
export function demoEventPhotos(): EventPhotoDTO[] {
  return PICS.map((pic, index) => ({
    id: `demo-photo-${index}`,
    url: "",
    uploader: null,
    caption: pic.label,
    createdAt: new Date(Date.UTC(2026, 0, 1)).toISOString(),
  }));
}
