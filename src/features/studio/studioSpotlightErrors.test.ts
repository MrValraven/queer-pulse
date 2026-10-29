import { describe, expect, it } from "vitest";
import { ApiError } from "../../shared/api/client";
import { studioAdminSaveErrorKeyOf } from "../admin/studioAdmin.model";
import type { StudioErrorCode } from "./api/studio.types";
import { STUDIO_ERROR_MESSAGE_KEY } from "./studioErrors.data";

// The six spotlight codes, in contract order (section 4), each with the
// studio error line the console dialogs and toasts read.
const SPOTLIGHT_ERROR_KEYS: ReadonlyArray<[StudioErrorCode, string]> = [
  ["studio_spotlight_not_an_artist", "studio:errors.spotlightNotAnArtist"],
  ["studio_spotlight_no_release", "studio:errors.spotlightNoRelease"],
  ["studio_spotlight_slot_full", "studio:errors.spotlightSlotFull"],
  ["studio_spotlight_already_in_slot", "studio:errors.spotlightAlreadyInSlot"],
  ["studio_spotlight_order_mismatch", "studio:errors.spotlightOrderMismatch"],
  ["studio_spotlight_not_found", "studio:errors.spotlightNotFound"],
];

describe("studio spotlight errors", () => {
  it("names each spotlight code with its own studio error line", () => {
    for (const [code, key] of SPOTLIGHT_ERROR_KEYS) {
      expect(STUDIO_ERROR_MESSAGE_KEY[code]).toBe(key);
      expect(
        studioAdminSaveErrorKeyOf(new ApiError(409, "Conflict", { code })),
      ).toBe(key);
    }
  });
});
