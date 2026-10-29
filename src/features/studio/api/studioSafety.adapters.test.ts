import { describe, expect, it } from "vitest";
import type { ModReportDTO } from "../../admin/api/moderation.api";
import type { StudioReleaseDTO, StudioTrackDTO } from "./studio.types";
import { toReleaseView, toTrackView } from "./studio.adapters";
import {
  toAdminClaimView,
  toMyClaimView,
  toReviewTrackReportView,
} from "./studioSafety.adapters";
import {
  contentWarningsOf,
  safeOriginalLinkOf,
  toOwnerClaimView,
} from "./studioSafetyFields";
import type {
  StudioAdminClaimDTO,
  StudioMyClaimDTO,
  StudioOwnerClaimDTO,
} from "./studioSafety.types";

const artist = {
  id: "persona-1",
  handle: "nightform",
  name: "NIGHTFORM",
  kind: "musician" as const,
  avatarUrl: null,
};

const ownerClaim: StudioOwnerClaimDTO = {
  id: "claim-1",
  trackId: "track-2",
  status: "accepted",
  originalWork: "Candeia, by Rosa Marinho",
  originalLink: "https://example.org/candeia",
  details: "The chorus from 0:40",
  claimantRole: "rights_holder",
  counterNote: null,
  claimantReply: null,
  staffNote: null,
  acceptedAt: "2026-10-10T14:00:00.000Z",
  counteredAt: null,
  decidedAt: null,
  canCounter: true,
};

function releaseDto(
  overrides: Partial<StudioReleaseDTO> = {},
): StudioReleaseDTO {
  return {
    id: "release-1",
    title: "Salt water",
    type: "ep",
    coverUrl: null,
    releasedOn: "2026-04-12",
    trackCount: 2,
    totalDurationSeconds: 258,
    artist,
    description: null,
    genre: "folk",
    genres: ["folk"],
    mood: null,
    scene: null,
    status: "published",
    publishedAt: "2026-04-12T10:00:00.000Z",
    tracks: [
      {
        id: "track-1",
        position: 1,
        title: "Tide",
        durationSeconds: 258,
        isExplicit: false,
        hasAudio: true,
        contentWarnings: ["self-harm", "medical", "self-harm"],
      },
      {
        id: "track-2",
        position: 2,
        title: "Pier",
        durationSeconds: 200,
        isExplicit: true,
        hasAudio: true,
        isWithheld: true,
        contentWarnings: ["violence"],
      },
    ],
    isOwner: false,
    rightsConfirmedAt: null,
    takedownReason: null,
    sceneId: null,
    personaCredits: [],
    claims: [ownerClaim],
    ...overrides,
  };
}

describe("contentWarningsOf", () => {
  it("keeps the D7 order, folds duplicates and drops unknown ids", () => {
    expect(
      contentWarningsOf(["police", "medical", "made-up", "police"]),
    ).toEqual(["medical", "police"]);
    expect(contentWarningsOf(undefined)).toEqual([]);
  });
});

describe("safeOriginalLinkOf", () => {
  it("keeps http and https links only", () => {
    expect(safeOriginalLinkOf(" https://example.org/a ")).toBe(
      "https://example.org/a",
    );
    expect(safeOriginalLinkOf("http://example.org")).toBe("http://example.org");
    expect(safeOriginalLinkOf("javascript:alert(1)")).toBeNull();
    expect(safeOriginalLinkOf("mailto:someone@example.org")).toBeNull();
    expect(safeOriginalLinkOf("")).toBeNull();
  });
});

describe("toReleaseView, Studio safety", () => {
  it("redacts a listener's withheld row even when the server sends it whole", () => {
    const view = toReleaseView(releaseDto());
    const withheld = view.tracks[1];
    expect(withheld?.isWithheld).toBe(true);
    expect(withheld?.title).toBe("");
    expect(withheld?.hasAudio).toBe(false);
    expect(withheld?.isExplicit).toBe(false);
    expect(withheld?.durationLabel).toBeNull();
    expect(withheld?.contentWarnings).toEqual([]);
    expect(withheld?.position).toBe(2);
    expect(view.playableTrackCount).toBe(1);
  });

  it("orders a listener's warnings in D7 order", () => {
    expect(toReleaseView(releaseDto()).tracks[0]?.contentWarnings).toEqual([
      "medical",
      "self-harm",
    ]);
  });

  it("gives a listener no claims, whatever arrives", () => {
    expect(toReleaseView(releaseDto()).claims).toEqual([]);
  });

  it("keeps the owner's withheld row playable, with claims and owner fields", () => {
    const view = toReleaseView(
      releaseDto({
        isOwner: true,
        tracks: [
          {
            id: "track-2",
            position: 2,
            title: "Pier",
            durationSeconds: 200,
            isExplicit: true,
            hasAudio: true,
            isWithheld: true,
            contentWarnings: ["violence", "police"],
            artistContentWarnings: ["violence"],
            staffContentWarnings: ["police"],
            isExplicitLocked: true,
          },
        ],
      }),
    );
    expect(view.tracks[0]).toMatchObject({
      title: "Pier",
      hasAudio: true,
      isWithheld: true,
    });
    expect(view.ownerTracks?.[0]).toMatchObject({
      artistContentWarnings: ["violence"],
      staffContentWarnings: ["police"],
      isExplicitLocked: true,
    });
    expect(view.claims?.map((claim) => claim.id)).toEqual(["claim-1"]);
  });
});

describe("toTrackView, Studio safety", () => {
  it("carries the owner's claims on a withheld track the server answered 200", () => {
    const dto: StudioTrackDTO = {
      id: "track-2",
      position: 2,
      title: "Pier",
      durationSeconds: 200,
      isExplicit: false,
      hasAudio: true,
      isWithheld: true,
      releaseId: "release-1",
      credits: [],
      lyrics: null,
      syncedLyrics: null,
      chapters: null,
      release: releaseDto(),
      personaCredits: [],
      claims: [ownerClaim],
    };
    const view = toTrackView(dto);
    expect(view.title).toBe("Pier");
    expect(view.isWithheld).toBe(true);
    expect(view.claims?.[0]?.canCounter).toBe(true);
  });
});

describe("toOwnerClaimView", () => {
  it("never carries the claimant, even when a server sends one", () => {
    const leaky = {
      ...ownerClaim,
      claimant: { id: "member-9", displayName: "Someone" },
      claimantId: "member-9",
    } as StudioOwnerClaimDTO;
    const view = toOwnerClaimView(leaky);
    expect(Object.keys(view)).not.toContain("claimant");
    expect(Object.keys(view)).not.toContain("claimantId");
    expect(JSON.stringify(view)).not.toContain("member-9");
  });

  it("offers a counter-notice only on an accepted claim with none sent", () => {
    expect(toOwnerClaimView(ownerClaim).canCounter).toBe(true);
    expect(
      toOwnerClaimView({ ...ownerClaim, counterNote: "Mine", canCounter: true })
        .canCounter,
    ).toBe(false);
    expect(
      toOwnerClaimView({ ...ownerClaim, status: "upheld", canCounter: true })
        .canCounter,
    ).toBe(false);
  });

  it("drops an unsafe original link", () => {
    expect(
      toOwnerClaimView({ ...ownerClaim, originalLink: "javascript:alert(1)" })
        .originalLink,
    ).toBeNull();
  });
});

describe("toMyClaimView", () => {
  const mine: StudioMyClaimDTO = {
    id: "claim-3",
    status: "countered",
    claimantRole: "authorised",
    originalWork: "Kitchen light",
    originalLink: null,
    details: "The loop from 1:10",
    counterNote: "I made that loop",
    claimantReply: null,
    staffNote: null,
    createdAt: "2026-10-13T10:00:00.000Z",
    acceptedAt: "2026-10-13T12:00:00.000Z",
    counteredAt: "2026-10-14T09:00:00.000Z",
    repliedAt: null,
    decidedAt: null,
    canReply: true,
    canWithdraw: true,
    track: {
      id: "track-9",
      title: "The kitchen in April",
      release: { id: "release-9", title: "The kitchen in April" },
      artist,
      artistName: "NIGHTFORM",
    },
  };

  it("serves the snapshot of a severed claim without links", () => {
    const view = toMyClaimView({
      ...mine,
      track: {
        id: null,
        title: "The kitchen in April",
        release: { id: null, title: null },
        artist: null,
        artistName: "Old name",
      },
    });
    expect(view.track.href).toBeNull();
    expect(view.track.releaseHref).toBeNull();
    expect(view.track.artistHref).toBeNull();
    expect(view.track.releaseTitle).toBeNull();
    expect(view.track.title).toBe("The kitchen in April");
    expect(view.track.artistName).toBe("Old name");
  });

  it("links the track, the release and the artist", () => {
    const view = toMyClaimView(mine);
    expect(view.track.href).toBe("/studio/track?id=track-9");
    expect(view.track.releaseHref).toBe("/studio/album?id=release-9");
    expect(view.track.artistName).toBe("NIGHTFORM");
    expect(view.canReply).toBe(true);
  });

  it("closes Reply once a reply exists, and Withdraw on a closed claim", () => {
    expect(toMyClaimView({ ...mine, claimantReply: "No" }).canReply).toBe(
      false,
    );
    expect(
      toMyClaimView({ ...mine, status: "upheld", canWithdraw: true })
        .canWithdraw,
    ).toBe(false);
  });
});

describe("toAdminClaimView", () => {
  it("names the claimant and the track for staff", () => {
    const dto: StudioAdminClaimDTO = {
      id: "claim-2",
      status: "submitted",
      claimantRole: "rights_holder",
      originalWork: "Vela",
      originalLink: null,
      details: "0:00 to 0:20",
      counterNote: null,
      claimantReply: null,
      staffNote: null,
      createdAt: "2026-10-12T10:00:00.000Z",
      acceptedAt: null,
      counteredAt: null,
      repliedAt: null,
      decidedAt: null,
      claimant: {
        id: "member-2",
        slug: "teo-m",
        displayName: "Téo M.",
        avatarUrl: null,
      },
      track: { id: "track-2", title: "Pier", position: 2, isWithheld: false },
      release: {
        ...releaseDto(),
        takenDownAt: null,
      },
    };
    const view = toAdminClaimView(dto);
    expect(view.claimant.displayName).toBe("Téo M.");
    expect(view.track.href).toBe("/studio/track?id=track-2");
    expect(view.release.title).toBe("Salt water");
  });
});

describe("toReviewTrackReportView", () => {
  it("reads the track id from the report's subject", () => {
    const view = toReviewTrackReportView({
      id: "report-1",
      subjectId: "track-2",
      reasonCode: "hateful_lyrics",
      createdAt: "2026-10-13T16:00:00.000Z",
    } as ModReportDTO);
    expect(view).toEqual({
      reportId: "report-1",
      trackId: "track-2",
      reasonCode: "hateful_lyrics",
      reasonLabelKey: "safety:reason.hatefulLyrics",
      createdAt: "2026-10-13T16:00:00.000Z",
      severity: null,
      slaDueAt: null,
    });
  });

  it("keeps the moderation severity and SLA when the row has them", () => {
    const view = toReviewTrackReportView({
      id: "report-2",
      subjectId: "track-3",
      reasonCode: "hateful_lyrics",
      createdAt: "2026-10-13T16:00:00.000Z",
      severity: "high",
      slaDueAt: "2026-10-14T16:00:00.000Z",
    } as ModReportDTO);
    expect(view.severity).toBe("high");
    expect(view.slaDueAt).toBe("2026-10-14T16:00:00.000Z");
  });
});
