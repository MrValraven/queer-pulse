import { beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { demoStudioRelease, demoStudioTrack } from "./studioDemoApi";
import {
  demoAdminClaimCounts,
  demoAdminClaimsPage,
  demoCounterClaim,
  demoDecideClaim,
  demoFileClaim,
  demoOwnerClaimsOfTrack,
  demoReplyToClaim,
  demoTrackWithSafety,
  demoWithdrawClaim,
  demoWithheldTrackIds,
  resetDemoSafety,
} from "./studioDemoSafety";
import {
  DEMO_CLAIMED_TRACK_ID,
  DEMO_WARNED_TRACK_ID,
  DEMO_WITHHELD_TRACK_ID,
} from "./studioDemoSafety.data";

const body = {
  claimantRole: "rights_holder" as const,
  originalWork: "Something, by someone",
  details: "From 0:10",
  goodFaith: true as const,
};

function codeOf(run: () => unknown): string | null {
  try {
    run();
    return null;
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return ((error.data ?? {}) as { code?: string }).code ?? `${error.status}`;
  }
}

beforeEach(() => resetDemoSafety());

describe("demo Studio safety: tracks", () => {
  it("withholds the demo track while its accepted and countered claims hold", () => {
    expect(demoWithheldTrackIds().has(DEMO_WITHHELD_TRACK_ID)).toBe(true);
  });

  it("redacts a withheld row for a listener and keeps it whole for the owner", () => {
    const row = {
      id: DEMO_WITHHELD_TRACK_ID,
      position: 2,
      title: "Vela acesa",
      durationSeconds: 217,
      isExplicit: false,
      hasAudio: true,
    };
    expect(demoTrackWithSafety(row, false)).toMatchObject({
      title: "",
      hasAudio: false,
      isWithheld: true,
      contentWarnings: [],
    });
    expect(demoTrackWithSafety(row, true)).toMatchObject({
      title: "Vela acesa",
      hasAudio: true,
      isWithheld: true,
      artistContentWarnings: [],
      staffContentWarnings: [],
      isExplicitLocked: false,
    });
  });

  it("puts the warned track's warning on the demo album and its track page", () => {
    const release = demoStudioRelease("demo-release-cidade-dos-santos");
    const warned = release.tracks.find(
      (track) => track.id === DEMO_WARNED_TRACK_ID,
    );
    expect(warned?.contentWarnings).toEqual(["family-rejection"]);
    expect(demoStudioTrack(DEMO_WARNED_TRACK_ID).contentWarnings).toEqual([
      "family-rejection",
    ]);
  });

  it("gives the owner the claims on their withheld track, with no claimant", () => {
    const claims = demoOwnerClaimsOfTrack(DEMO_WITHHELD_TRACK_ID);
    expect(claims.map((claim) => claim.status).sort()).toEqual([
      "accepted",
      "countered",
    ]);
    expect(JSON.stringify(claims)).not.toContain('claimant"');
  });
});

describe("demo Studio safety: claims", () => {
  it("refuses a claim about the owner's own track", () => {
    expect(codeOf(() => demoFileClaim(DEMO_WARNED_TRACK_ID, body))).toBe(
      "studio_claim_own_track",
    );
  });

  it("refuses a second live claim by the same member on a track", () => {
    expect(codeOf(() => demoFileClaim(DEMO_CLAIMED_TRACK_ID, body))).toBe(
      "studio_claim_exists",
    );
  });

  it("lists submitted and countered claims oldest first for staff, and counts them", async () => {
    const statuses = demoAdminClaimsPage(null).items.map((item) => item.status);
    expect(statuses.sort()).toEqual(["countered", "submitted"]);
    expect(await demoAdminClaimCounts()).toEqual({
      submitted: 1,
      countered: 1,
      disputesWaiting: 1,
    });
  });

  it("restores a track only when no other claim holds it", () => {
    const held = demoAdminClaimsPage("accepted").items[0];
    const countered = demoAdminClaimsPage("countered").items[0];
    if (!held || !countered) throw new Error("demo seeds missing");
    demoDecideClaim(held.id, "reject", "Not the same melody");
    expect(demoWithheldTrackIds().has(DEMO_WITHHELD_TRACK_ID)).toBe(true);
    demoDecideClaim(
      countered.id,
      "reject",
      "The recording is the artist's own",
    );
    expect(demoWithheldTrackIds().has(DEMO_WITHHELD_TRACK_ID)).toBe(false);
  });

  it("keeps the track offline after an uphold and brings it back after a withdraw or reject", () => {
    const held = demoAdminClaimsPage("accepted").items[0];
    const countered = demoAdminClaimsPage("countered").items[0];
    if (!held || !countered) throw new Error("demo seeds missing");
    demoDecideClaim(held.id, "uphold", "The melody matches");
    demoDecideClaim(
      countered.id,
      "reject",
      "The recording is the artist's own",
    );
    expect(demoWithheldTrackIds().has(DEMO_WITHHELD_TRACK_ID)).toBe(true);
  });

  it("takes one counter-notice, on an accepted claim only", () => {
    const held = demoAdminClaimsPage("accepted").items[0];
    if (!held) throw new Error("demo seed missing");
    expect(demoCounterClaim(held.id, "It is mine").status).toBe("countered");
    expect(codeOf(() => demoCounterClaim(held.id, "Again"))).toBe(
      "studio_claim_not_accepted",
    );
  });

  it("refuses a decline on a claim our team already accepted", () => {
    const held = demoAdminClaimsPage("accepted").items[0];
    if (!held) throw new Error("demo seed missing");
    expect(codeOf(() => demoDecideClaim(held.id, "decline", "No"))).toBe(
      "studio_claim_not_submitted",
    );
  });

  it("lets the claimant withdraw a live claim once", () => {
    const mine = demoAdminClaimsPage("submitted").items[0];
    if (!mine) throw new Error("demo seed missing");
    expect(demoWithdrawClaim(mine.id).status).toBe("withdrawn");
    expect(codeOf(() => demoWithdrawClaim(mine.id))).toBe(
      "studio_claim_not_live",
    );
  });

  it("refuses a reply before a counter-notice", () => {
    const mine = demoAdminClaimsPage("submitted").items[0];
    if (!mine) throw new Error("demo seed missing");
    expect(codeOf(() => demoReplyToClaim(mine.id, "Hello"))).toBe(
      "studio_claim_not_countered",
    );
  });
});
