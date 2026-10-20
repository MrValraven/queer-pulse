import { beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { toReleaseView } from "./studio.adapters";
import { demoStudioRelease } from "./studioDemoApi";
import { DEMO_SHOW_ID } from "./studioDemoFormats.data";
import { resetDemoListeningStore } from "./studioDemoListening";
import { DEMO_ARTIST_MARIANA } from "./studioDemoMe.data";
import {
  demoPreviewLinkFor,
  demoStorePreviewLink,
} from "./studioDemoArtistTools";
import {
  demoAddVersion,
  demoConfirmAudio,
  demoCreateRelease,
  demoCreateTrack,
  demoUpdateTrack,
  demoPreviewToken,
  demoPublish,
  demoPublishEpisode,
  demoReorder,
  demoSchedule,
  demoUnpublish,
  demoUnschedule,
  demoWithdrawalStatus,
  demoUpdateRelease,
  lisbonDateOf,
  studioRefusal,
} from "./studioDemoMutations";

describe("demo artist mutations", () => {
  it("creates a draft for the demo persona and edits it", () => {
    const draft = demoCreateRelease({
      subprofileId: DEMO_ARTIST_MARIANA.id,
      type: "ep",
      title: "Cartas",
    });
    expect(draft.status).toBe("draft");
    expect(draft.artist.id).toBe(DEMO_ARTIST_MARIANA.id);
    const edited = demoUpdateRelease(draft, {
      description: "Notes",
      rightsConfirmed: true,
      coverKey: "blob:cover",
    });
    expect(edited.description).toBe("Notes");
    expect(edited.rightsConfirmedAt).not.toBeNull();
    expect(edited.coverUrl).toBe("blob:cover");
  });

  it("reads a demo duration from the key the demo upload wrote", () => {
    const track = demoCreateTrack("release-1", "Tide", 1);
    const confirmed = demoConfirmAudio(track, "demo-audio:3200000:tide.mp3");
    expect(confirmed.hasAudio).toBe(true);
    expect(confirmed.durationSeconds).toBe(200);
  });

  it("reorders tracks and renumbers their positions", () => {
    const draft = demoCreateRelease({
      subprofileId: DEMO_ARTIST_MARIANA.id,
      type: "ep",
      title: "Cartas",
    });
    const withTracks = {
      ...draft,
      tracks: [
        demoCreateTrack(draft.id, "One", 1),
        demoCreateTrack(draft.id, "Two", 2),
      ],
    };
    const reordered = demoReorder(withTracks, [
      withTracks.tracks[1]!.id,
      withTracks.tracks[0]!.id,
    ]);
    expect(
      reordered.tracks.map((track) => `${track.position}:${track.title}`),
    ).toEqual(["1:Two", "2:One"]);
  });

  it("publishes a draft", () => {
    const draft = demoCreateRelease({
      subprofileId: DEMO_ARTIST_MARIANA.id,
      type: "single",
      title: "Uma",
    });
    expect(demoPublish(draft).status).toBe("published");
  });
});

describe("demo artist tools", () => {
  const draft = () =>
    demoCreateRelease({
      subprofileId: DEMO_ARTIST_MARIANA.id,
      type: "ep",
      title: "Cartas",
    });
  const inDays = (days: number) =>
    new Date(Date.now() + days * 86_400_000).toISOString();
  // A past date: never the Lisbon date of a publish time ahead, whatever day
  // the suite runs.
  const TYPED_RELEASE_DATE = "2020-05-01";

  it("schedules a draft and fills an empty release date in Lisbon", () => {
    const publishAt = inDays(3);
    const scheduled = demoSchedule(draft(), publishAt);
    expect(scheduled.status).toBe("scheduled");
    expect(scheduled.statusLabelKey).toBe("studio:releaseStatus.scheduled");
    expect(scheduled.isUpcoming).toBe(true);
    expect(scheduled.publishAt).toBe(publishAt);
    expect(scheduled.releasedOn).toBe(lisbonDateOf(publishAt));
    const back = demoUnschedule(scheduled);
    expect(back.status).toBe("draft");
    expect(back.publishAt).toBeNull();
    expect(back.isUpcoming).toBe(false);
    expect(back.releasedOn).toBeNull();
  });

  it("moves a filled release date with a reschedule and keeps a typed one", () => {
    const first = demoSchedule(draft(), inDays(3));
    const later = inDays(10);
    expect(demoSchedule(first, later).releasedOn).toBe(lisbonDateOf(later));
    const typed = demoUpdateRelease(draft(), {
      releasedOn: TYPED_RELEASE_DATE,
    });
    const scheduledTyped = demoSchedule(typed, inDays(3));
    expect(scheduledTyped.releasedOn).toBe(TYPED_RELEASE_DATE);
    expect(demoSchedule(scheduledTyped, later).releasedOn).toBe(
      TYPED_RELEASE_DATE,
    );
    const unscheduled = demoUnschedule(demoSchedule(typed, inDays(3)));
    expect(unscheduled.status).toBe("draft");
    expect(unscheduled.releasedOn).toBe(TYPED_RELEASE_DATE);
  });

  const withLink = (release: ReturnType<typeof draft>) => {
    const link = {
      token: "ab".repeat(32),
      createdAt: "2026-10-10T10:00:00.000Z",
    };
    demoStorePreviewLink(release.id, link);
    return {
      ...release,
      previewToken: link.token,
      previewLinkCreatedAt: link.createdAt,
    };
  };

  it("clears the preview link on unpublish and keeps it through publish", () => {
    const published = demoPublish(withLink(draft()));
    expect(published.previewToken).not.toBeNull();
    expect(demoPreviewLinkFor(published.id)).not.toBeNull();
    const back = demoUnpublish(published);
    expect(back.status).toBe("draft");
    expect(back.previewToken).toBeNull();
    expect(back.previewLinkCreatedAt).toBeNull();
    expect(demoPreviewLinkFor(back.id)).toBeNull();
  });

  it("leaves a draft and a scheduled release unchanged on unpublish, and refuses a taken-down one", () => {
    const draftWithLink = withLink(draft());
    expect(demoUnpublish(draftWithLink)).toBe(draftWithLink);
    expect(demoPreviewLinkFor(draftWithLink.id)).not.toBeNull();
    const scheduled = demoSchedule(draft(), inDays(3));
    expect(demoUnpublish(scheduled)).toBe(scheduled);
    const down = demoWithdrawalStatus(draft(), "taken_down");
    expect(() => demoUnpublish(down)).toThrow(
      studioRefusal(409, "studio_release_not_draft"),
    );
  });

  it("takes a scheduled release down with nothing upcoming and no link", () => {
    const publishAt = inDays(3);
    const scheduled = withLink(demoSchedule(draft(), publishAt));
    const down = demoWithdrawalStatus(scheduled, "taken_down");
    expect(down.status).toBe("taken_down");
    expect(down.statusLabelKey).toBe("studio:releaseStatus.taken_down");
    expect(down.isUpcoming).toBe(false);
    expect(down.publishAt).toBeNull();
    expect(down.releasedOn).toBeNull();
    expect(down.previewToken).toBeNull();
    expect(down.previewLinkCreatedAt).toBeNull();
    expect(demoPreviewLinkFor(down.id)).toBeNull();
    const restored = demoWithdrawalStatus(down, "draft");
    expect(restored.status).toBe("draft");
    expect(restored.isUpcoming).toBe(false);
    expect(restored.previewToken).toBeNull();
  });

  it("keeps a typed release date through a takedown", () => {
    const typed = demoUpdateRelease(draft(), {
      releasedOn: TYPED_RELEASE_DATE,
    });
    const down = demoWithdrawalStatus(
      demoSchedule(typed, inDays(3)),
      "taken_down",
    );
    expect(down.releasedOn).toBe(TYPED_RELEASE_DATE);
  });

  it("publishes a scheduled release now, its filled date becoming today in Lisbon", () => {
    const published = demoPublish(demoSchedule(draft(), inDays(3)));
    expect(published.status).toBe("published");
    expect(published.publishAt).toBeNull();
    expect(published.isUpcoming).toBe(false);
    expect(published.releasedOn).toBe(lisbonDateOf(new Date().toISOString()));
  });

  it("keeps a typed release date when a scheduled release is published now", () => {
    const typed = demoUpdateRelease(draft(), {
      releasedOn: TYPED_RELEASE_DATE,
    });
    expect(demoPublish(demoSchedule(typed, inDays(3))).releasedOn).toBe(
      TYPED_RELEASE_DATE,
    );
  });

  it("keeps reminders with the release through unschedule and reschedule", () => {
    const scheduled = {
      ...demoSchedule(draft(), inDays(3)),
      isReminderSet: true,
    };
    const unscheduled = demoUnschedule(scheduled);
    expect(unscheduled.isReminderSet).toBe(true);
    expect(demoSchedule(unscheduled, inDays(4)).isReminderSet).toBe(true);
  });

  it("leaves a draft alone on unschedule and refuses a published one", () => {
    const plain = draft();
    expect(demoUnschedule(plain)).toBe(plain);
    expect(() => demoUnschedule(demoPublish(draft()))).toThrow(ApiError);
  });

  it("refuses a time outside the window as the server does", () => {
    expect(() =>
      demoSchedule(draft(), new Date(Date.now() + 60_000).toISOString()),
    ).toThrow(ApiError);
    expect(() => demoSchedule(draft(), inDays(400))).toThrow(ApiError);
  });

  it("refuses to schedule a published release", () => {
    expect(() => demoSchedule(demoPublish(draft()), inDays(2))).toThrow(
      ApiError,
    );
  });

  it("marks a published release changed on reorder, and a version note clears it", () => {
    const published = { ...demoPublish(draft()), version: 1 };
    const reordered = demoReorder(published, []);
    expect(reordered.hasUnnotedChanges).toBe(true);
    const noted = demoAddVersion(reordered, "  New mix of track 2  ");
    expect(noted.version).toBe(2);
    expect(noted.latestVersion?.note).toBe("New mix of track 2");
    expect(noted.versions).toHaveLength(1);
    expect(noted.hasUnnotedChanges).toBe(false);
    expect(() => demoAddVersion(noted, "Again")).toThrow(ApiError);
  });

  it("leaves a draft unmarked on reorder", () => {
    expect(demoReorder(draft(), []).hasUnnotedChanges).toBe(false);
  });

  it("mints a token in the server's format", () => {
    expect(demoPreviewToken()).toMatch(/^[0-9a-f]{64}$/);
  });

  it("stores a buy link through the release patch", () => {
    const edited = demoUpdateRelease(draft(), {
      buyUrl: "https://marianasol.bandcamp.com/album/cartas",
    });
    expect(edited.buyUrl).toBe("https://marianasol.bandcamp.com/album/cartas");
    expect(edited.buyLink?.labelKey).toBe("studio:support.buyOnBandcamp");
    const cleared = demoUpdateRelease(edited, { buyUrl: null });
    expect(cleared.buyUrl).toBeNull();
    expect(cleared.buyLink).toBeNull();
  });

  it("starts a draft with gaps and keeps the gapless flag until a patch sets it", () => {
    const created = draft();
    expect(created.isGapless).toBe(false);
    const gapless = demoUpdateRelease(created, { isGapless: true });
    expect(gapless.isGapless).toBe(true);
    expect(demoUpdateRelease(gapless, { title: "Cartas II" }).isGapless).toBe(
      true,
    );
    expect(demoUpdateRelease(gapless, { isGapless: false }).isGapless).toBe(
      false,
    );
  });

  it("shapes a refusal the way the server sends it", () => {
    const refusal = studioRefusal(409, "studio_release_no_changes");
    expect(refusal).toBeInstanceOf(ApiError);
    expect(refusal.status).toBe(409);
    expect(refusal.message).toBe("studio_release_no_changes");
    expect(refusal.data).toEqual({
      statusCode: 409,
      code: "studio_release_no_changes",
      message: "studio_release_no_changes",
    });
  });
});

describe("demo listening writes", () => {
  beforeEach(() => resetDemoListeningStore());

  it("stores chapters and synced lines and returns them as views", () => {
    const track = demoConfirmAudio(
      demoCreateTrack("release-1", "Mix", 1),
      "demo-audio:16000000:mix.mp3",
    );
    const updated = demoUpdateTrack(track, {
      chapters: [
        { startSeconds: 0, title: "Open" },
        { startSeconds: 600, title: "Close", artist: "Rita" },
      ],
      syncedLyrics: [{ ms: 1000, text: " hey " }],
    });
    expect(updated.chapters?.map((chapter) => chapter.timeLabel)).toEqual([
      "0:00",
      "10:00",
    ]);
    expect(updated.chapters?.[0]?.artist).toBeNull();
    expect(updated.syncedLyrics).toEqual([{ ms: 1000, text: "hey" }]);
  });

  it("refuses chapters on a track without audio with the contract code", () => {
    const track = demoCreateTrack("release-1", "Empty", 1);
    try {
      demoUpdateTrack(track, { chapters: [{ startSeconds: 0, title: "A" }] });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).data).toMatchObject({
        code: "studio_chapters_out_of_range",
      });
    }
  });

  it("keeps owner rows in step with a reorder", () => {
    const draft = demoCreateRelease({
      subprofileId: DEMO_ARTIST_MARIANA.id,
      type: "ep",
      title: "Cartas",
    });
    const one = demoCreateTrack(draft.id, "One", 1);
    const two = demoCreateTrack(draft.id, "Two", 2);
    const withTracks = {
      ...draft,
      tracks: [one, two],
      ownerTracks: [
        {
          ...one,
          hasAnalysis: false,
          loudnessLufs: null,
          peakDb: null,
          syncedLyrics: null,
          chapters: null,
        },
        {
          ...two,
          hasAnalysis: true,
          loudnessLufs: null,
          peakDb: null,
          syncedLyrics: null,
          chapters: null,
        },
      ],
    };
    const reordered = demoReorder(withTracks, [two.id, one.id]);
    expect(
      reordered.ownerTracks?.map(
        (row) => `${row.position}:${row.title}:${row.hasAnalysis}`,
      ),
    ).toEqual(["1:Two:true", "2:One:false"]);
  });
});

describe("demo episode mutations", () => {
  const show = toReleaseView(demoStudioRelease(DEMO_SHOW_ID));

  it("creates a draft episode on a live show", () => {
    const track = demoCreateTrack(show.id, "New one", 5, show);
    expect(track.isDraft).toBe(true);
    expect(track.publishedAt).toBeNull();
    expect(track.release.isShow).toBe(true);
  });

  it("creates an ordinary track elsewhere", () => {
    const track = demoCreateTrack("demo-draft-1", "Tide", 1);
    expect(track.isDraft).toBe(false);
  });

  it("saves notes and sources", () => {
    const track = demoCreateTrack(show.id, "New one", 5, show);
    const updated = demoUpdateTrack(track, {
      notes: "00:00 Hello",
      sources: [{ title: " Vogue ", artist: "Madonna" }],
    });
    expect(updated.notes).toBe("00:00 Hello");
    expect(updated.sources).toEqual([{ title: "Vogue", artist: "Madonna" }]);
    expect(demoUpdateTrack(updated, { notes: null }).notes).toBeNull();
  });

  it("publishes one draft episode", () => {
    const track = demoCreateTrack(show.id, "New one", 5, show);
    const published = demoPublishEpisode({ ...track, hasAudio: true });
    expect(published.isDraft).toBe(false);
    expect(published.publishedAt).not.toBeNull();
  });

  it("refuses an episode without audio", () => {
    const track = demoCreateTrack(show.id, "New one", 5, show);
    expect(() => demoPublishEpisode(track)).toThrow(
      studioRefusal(409, "studio_publish_tracks_pending"),
    );
  });

  it("refuses an episode that is already live", () => {
    const track = demoCreateTrack(show.id, "New one", 5, show);
    const published = demoPublishEpisode({ ...track, hasAudio: true });
    expect(() => demoPublishEpisode(published)).toThrow(
      studioRefusal(409, "studio_episode_already_published"),
    );
  });

  it("stamps a show's playable episodes when the show is published", () => {
    const draftShow = {
      ...show,
      status: "draft" as const,
      tracks: show.tracks.map((track) => ({
        ...track,
        publishedAt: null,
        isDraft: true,
      })),
    };
    const published = demoPublish(draftShow);
    expect(
      published.tracks.every(
        (track) => track.publishedAt !== null && !track.isDraft,
      ),
    ).toBe(true);
  });
});
