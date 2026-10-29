import { describe, expect, it } from "vitest";
import {
  BADGED_STAFF_ROLE_LABEL_KEY,
  staffBadgeRolesFor,
} from "./badgedStaffRoles";

describe("music_manager_producer badge", () => {
  it("badges a music manager and producer on the member tier", () => {
    expect(staffBadgeRolesFor(null, ["music_manager_producer"])).toEqual([
      "music_manager_producer",
    ]);
  });
  it("lets the account tier win", () => {
    expect(staffBadgeRolesFor("moderator", ["music_manager_producer"])).toEqual(
      ["moderator"],
    );
  });
  it("labels it from the shared namespace", () => {
    expect(BADGED_STAFF_ROLE_LABEL_KEY.music_manager_producer).toBe(
      "shared:staffBadge.grant.musicManagerProducer",
    );
  });
});
