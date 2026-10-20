import { describe, expect, it } from "vitest";
import type { EventDraftPreview } from "../../api/adminCreatorDrafts.api";
import { eventDraftPreviewToGatheringDetail } from "./eventDraftPreviewToGatheringDetail";

const picnicPreview: EventDraftPreview = {
  title: "Sunday picnic in Monsanto",
  description:
    "Bring a blanket and something to share. We meet at the top of the park and walk down together.",
  family: "eat",
  format: "picnic",
  cap: "24",
  showAttendeeCount: true,
  date: "2026-11-01",
  time: "13:00",
  hood: "Monsanto",
  communitySlug: "rainbow-runners",
  audienceScope: "community",
  lang: "English only",
  costKind: "free",
  themes: ["outdoors", "low-key"],
  accessNotes:
    "The meeting point is flat. The path down is gravel and gently sloped.",
  houseRules: "Be kind, share the shade, take your rubbish home.",
  allowWaitlist: true,
  community: { slug: "rainbow-runners", name: "Rainbow Runners" },
  runByListing: null,
};

describe("event draft preview to gathering detail", () => {
  it("fills the public page fields from the draft", () => {
    const detail = eventDraftPreviewToGatheringDetail(
      picnicPreview,
      "Marta Fonseca",
    );
    expect(detail).toMatchObject({
      title: "Sunday picnic in Monsanto",
      hood: "Monsanto",
      host: "Marta Fonseca",
      type: picnicPreview.format,
      body: picnicPreview.description,
    });
    expect(detail.date.getFullYear()).toBe(2026);
    expect(detail.date.getMonth()).toBe(10);
    expect(detail.date.getDate()).toBe(1);
    expect(detail.date.getHours()).toBe(13);
    expect(detail.community?.name).toBe("Rainbow Runners");
    expect(detail.capacity).toBe(24);
    expect(detail.isFree).toBe(true);
  });

  it("carries no door details and no organiser rights", () => {
    const detail = eventDraftPreviewToGatheringDetail(
      {
        ...picnicPreview,
        ...({ address: "Rua X 1", onlineUrl: "https://x" } as object),
      },
      "Marta",
    );
    expect(detail.address ?? null).toBeNull();
    expect(detail.onlineUrl ?? null).toBeNull();
    expect(detail.arrivalNotes ?? null).toBeNull();
    expect(detail.viewerIsOrganizer).toBe(false);
  });

  it("reads an empty draft as an untitled event with today's date", () => {
    const detail = eventDraftPreviewToGatheringDetail(
      { community: null, runByListing: null },
      "Marta",
    );
    expect(detail.title).toBe("");
    expect(Number.isNaN(detail.date.getTime())).toBe(false);
    expect(detail.community).toBeUndefined();
  });

  it("uses the host's own words for a format they wrote themselves", () => {
    const detail = eventDraftPreviewToGatheringDetail(
      { ...picnicPreview, format: "other", otherText: "  Knitting circle " },
      "Marta",
    );
    expect(detail.type).toBe("Knitting circle");
  });

  it("reads the online neighbourhood as an online event with no venue", () => {
    const detail = eventDraftPreviewToGatheringDetail(
      {
        ...picnicPreview,
        hood: "Online",
        venue: "Casa Lilás",
        venueListing: { slug: "casa-lilas", name: "Casa Lilás" },
      },
      "Marta",
    );
    expect(detail.isOnline).toBe(true);
    expect(detail.venue).toBeNull();
    expect(detail.venueListing).toBeNull();
  });

  it("reads a malformed payload as a sparser page", () => {
    const malformed = {
      title: 42,
      description: { text: "x" },
      format: "other",
      otherText: ["Knitting"],
      cap: "lots",
      date: 20261101,
      time: true,
      hood: null,
      venue: 7,
      lang: {},
      accessNotes: 3,
      houseRules: false,
      themes: "outdoors",
      contentNotes: 5,
      formatDetails: "bring",
      accessibilityAnswers: "yes",
      rsvpQuestions: 1,
      audienceScope: "everyone",
      community: { slug: 1, name: 2 },
      runByListing: "Tasca",
    } as unknown as EventDraftPreview;
    const detail = eventDraftPreviewToGatheringDetail(malformed, "Marta");
    expect(detail.title).toBe("");
    expect(detail.body).toBe("");
    expect(detail.type).toBe("");
    expect(detail.capacity).toBeNull();
    expect(Number.isNaN(detail.date.getTime())).toBe(false);
    expect(detail.venue).toBeNull();
    expect(detail.language).toBeNull();
    expect(detail.accessibilityNote).toBe("");
    expect(detail.themes).toEqual([]);
    expect(detail.contentNotes).toEqual([]);
    expect(detail.formatDetails).toBeNull();
    expect(detail.visibility).toBe("members");
    expect(detail.community).toBeUndefined();
  });
});
