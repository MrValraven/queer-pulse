import { beforeEach, describe, expect, it } from "vitest";
import {
  toLandingPreviewOwnerView,
  toLandingPreviewOwnerViews,
} from "./studioLandingPreviews.adapters";
import type { StudioLandingPreviewOwnerItemDTO } from "./studioLanding.types";
import { DEMO_ARTIST_MARIANA } from "./studioDemoMe.data";
import {
  DEMO_APPROVED_ID,
  DEMO_PENDING_ID,
  demoActOnStudioLandingPreview,
  demoStudioLandingPreviews,
  resetDemoStudioLandingPreviewsForTests,
} from "./studioDemoLandingPreviews";

/** What a demo action throws: the status and the contract code. */
function refusalOf(act: () => unknown): { status: number; code: unknown } {
  try {
    act();
  } catch (error) {
    const { status, data } = error as { status: number; data: unknown };
    return { status, code: (data as { code?: unknown }).code };
  }
  throw new Error("The demo action did not refuse");
}

const PENDING_MAIN: StudioLandingPreviewOwnerItemDTO = {
  id: "preview-1",
  status: "pending",
  relation: "main",
  track: { id: "track-1", title: "Planície", durationSeconds: 238 },
  release: { id: "release-1", title: "Cidade dos santos", coverUrl: null },
  mainArtist: DEMO_ARTIST_MARIANA,
  requestedAt: "2026-10-26T09:30:00.000Z",
  decidedAt: null,
  isEligible: true,
  canApprove: true,
  canDecline: true,
  canWithdraw: false,
};
const APPROVED_MAIN: StudioLandingPreviewOwnerItemDTO = {
  ...PENDING_MAIN,
  id: "preview-2",
  status: "approved",
  decidedAt: "2026-10-27T10:00:00.000Z",
  canApprove: false,
  canDecline: false,
  canWithdraw: true,
};
const APPROVED_CREDITED: StudioLandingPreviewOwnerItemDTO = {
  ...APPROVED_MAIN,
  id: "preview-3",
  relation: "credited",
};

describe("toLandingPreviewOwnerView", () => {
  it("passes the server's flags through untouched", () => {
    const view = toLandingPreviewOwnerView({
      ...PENDING_MAIN,
      canApprove: false,
      canDecline: false,
    })!;
    expect(view).toMatchObject({
      canApprove: false,
      canDecline: false,
      canWithdraw: false,
    });
  });

  it("reads a credited approved row as withdraw only", () => {
    expect(toLandingPreviewOwnerView(APPROVED_CREDITED)).toMatchObject({
      relation: "credited",
      canApprove: false,
      canWithdraw: true,
    });
  });

  it("reads titles, dates and the release persona", () => {
    const view = toLandingPreviewOwnerView(APPROVED_MAIN)!;
    expect(view).toMatchObject({
      trackTitle: "Planície",
      releaseTitle: "Cidade dos santos",
      coverUrl: null,
    });
    expect(view.requestedAt).toEqual(new Date("2026-10-26T09:30:00.000Z"));
    expect(view.decidedAt).toEqual(new Date("2026-10-27T10:00:00.000Z"));
    expect(view.mainArtist.name).toBe("Mariana Sol");
    expect(toLandingPreviewOwnerView(PENDING_MAIN)?.decidedAt).toBeNull();
  });

  it("leaves out a status or relation this client does not know", () => {
    expect(
      toLandingPreviewOwnerView({ ...PENDING_MAIN, status: "archived" }),
    ).toBeNull();
    expect(
      toLandingPreviewOwnerViews({
        items: [PENDING_MAIN, { ...PENDING_MAIN, id: "x", relation: "guest" }],
      }),
    ).toHaveLength(1);
  });

  it("keeps an approved but ineligible row with isEligible false", () => {
    expect(
      toLandingPreviewOwnerView({ ...APPROVED_MAIN, isEligible: false })
        ?.isEligible,
    ).toBe(false);
  });
});

describe("demo owner previews", () => {
  beforeEach(() => {
    resetDemoStudioLandingPreviewsForTests();
  });

  it("lists pending first, then approved, and nothing for a podcaster", () => {
    expect(
      demoStudioLandingPreviews(DEMO_ARTIST_MARIANA.id).items.map(
        (item) => item.id,
      ),
    ).toEqual([DEMO_PENDING_ID, DEMO_APPROVED_ID]);
    expect(demoStudioLandingPreviews("sp-tiago-late-bloomers").items).toEqual(
      [],
    );
  });

  it("approve moves the pending row to approved; a second approve answers not pending", () => {
    const approved = demoActOnStudioLandingPreview(
      DEMO_ARTIST_MARIANA.id,
      DEMO_PENDING_ID,
      "approve",
    );
    expect(approved.status).toBe("approved");
    expect(approved.canWithdraw).toBe(true);
    expect(
      refusalOf(() =>
        demoActOnStudioLandingPreview(
          DEMO_ARTIST_MARIANA.id,
          DEMO_PENDING_ID,
          "approve",
        ),
      ),
    ).toEqual({ status: 409, code: "studio_landing_preview_not_pending" });
  });

  it("withdraw takes an approved row off the list; a pending row answers not approved", () => {
    expect(
      refusalOf(() =>
        demoActOnStudioLandingPreview(
          DEMO_ARTIST_MARIANA.id,
          DEMO_PENDING_ID,
          "withdraw",
        ),
      ),
    ).toEqual({ status: 409, code: "studio_landing_preview_not_approved" });
    const withdrawn = demoActOnStudioLandingPreview(
      DEMO_ARTIST_MARIANA.id,
      DEMO_APPROVED_ID,
      "withdraw",
    );
    expect(withdrawn.status).toBe("withdrawn");
    expect(
      demoStudioLandingPreviews(DEMO_ARTIST_MARIANA.id).items.map(
        (item) => item.id,
      ),
    ).toEqual([DEMO_PENDING_ID]);
  });

  it("a declined row answers not pending on a second decline", () => {
    demoActOnStudioLandingPreview(
      DEMO_ARTIST_MARIANA.id,
      DEMO_PENDING_ID,
      "decline",
    );
    expect(
      refusalOf(() =>
        demoActOnStudioLandingPreview(
          DEMO_ARTIST_MARIANA.id,
          DEMO_PENDING_ID,
          "decline",
        ),
      ),
    ).toEqual({ status: 409, code: "studio_landing_preview_not_pending" });
  });

  it("answers 404 for a row this persona cannot see", () => {
    expect(
      refusalOf(() =>
        demoActOnStudioLandingPreview(
          "sp-tiago-late-bloomers",
          DEMO_PENDING_ID,
          "decline",
        ),
      ),
    ).toEqual({ status: 404, code: "studio_landing_preview_not_found" });
  });
});
