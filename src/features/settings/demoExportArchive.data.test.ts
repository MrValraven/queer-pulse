import { describe, expect, it } from "vitest";
import {
  buildDemoArchiveContent,
  CATEGORY_ARCHIVE_KEYS,
} from "./demoExportArchive.data";

describe("demo data export, collaborative playlists", () => {
  it("files both playlist sections under saved, with rows from the demo seeds", () => {
    expect(CATEGORY_ARCHIVE_KEYS.saved).toEqual(
      expect.arrayContaining([
        "studioPlaylistSeats",
        "studioPlaylistAdditions",
      ]),
    );
    const content = buildDemoArchiveContent(["saved"]);
    expect(content.studioPlaylistSeats).toEqual([
      {
        playlistName: "Tour diary",
        status: "active",
        source: "persona_co_owner",
        invitedAt: "2026-10-12T10:00:00.000Z",
        acceptedAt: "2026-10-12T10:00:00.000Z",
        endedAt: null,
      },
      {
        playlistName: "Pride warm-up",
        status: "invited",
        source: "member_invite",
        invitedAt: "2026-10-14T08:00:00.000Z",
        acceptedAt: null,
        endedAt: null,
      },
    ]);
    // Only additions to playlists the member does not own are exported.
    expect(content.studioPlaylistAdditions).toEqual([
      {
        playlistName: "Tour diary",
        trackTitle: "Devoção",
        addedAt: "2026-10-13T19:00:00.000Z",
      },
    ]);
  });
});

describe("demo data export, creator drafts", () => {
  it("files creator drafts under saved as an empty list", () => {
    expect(CATEGORY_ARCHIVE_KEYS.saved).toContain("creatorDrafts");
    const content = buildDemoArchiveContent(["saved"]);
    expect(content).toHaveProperty("creatorDrafts");
    expect(content.creatorDrafts).toEqual([]);
  });
});

describe("demo data export, Pulse Live plays", () => {
  it("writes the Pulse Live plays under events", () => {
    expect(CATEGORY_ARCHIVE_KEYS.events).toContain("quizshowPlays");
    const content = buildDemoArchiveContent(["events"]);
    expect(content.quizshowPlays).toHaveLength(1);
    expect(content.quizshowPlays).toEqual([
      expect.objectContaining({
        eventSlug: "coop-info-night",
        teamName: null,
        score: 6420,
        wasRemoved: false,
      }),
    ]);
  });

  it("names a real demo event and carries one sample answer and one vote", () => {
    const content = buildDemoArchiveContent(["events"]);
    const [play] = content.quizshowPlays as Array<{
      eventTitle: string;
      answers: unknown[];
      votes: unknown[];
    }>;
    expect(play?.eventTitle).toBe(
      "Co-op Info Night: Buying a Building Together",
    );
    expect(play?.answers).toEqual([
      expect.objectContaining({
        answer: { type: "type_answer", text: "Amar pelos dois" },
        pointsAwarded: 870,
      }),
    ]);
    expect(play?.votes).toEqual([
      expect.objectContaining({ votedForTruth: true }),
    ]);
  });
});

describe("demo data export, Pulse Live games", () => {
  it("writes the member's games under events", () => {
    expect(CATEGORY_ARCHIVE_KEYS.events).toContain("quizshowGames");
    const content = buildDemoArchiveContent(["events"]);
    expect(content.quizshowGames).toHaveLength(1);
    const [game] = content.quizshowGames as Array<{
      rounds: Array<{ questions: unknown[] }>;
    }>;
    expect(game).toEqual(
      expect.objectContaining({
        title: "Friday flat quiz",
        isAdultsOnly: false,
        languages: "both",
        screenLanguage: "en",
      }),
    );
    expect(game?.rounds).toHaveLength(1);
    expect(game?.rounds[0]?.questions).toHaveLength(1);
  });

  it("mirrors the live game row's round and question fields", () => {
    const content = buildDemoArchiveContent(["events"]);
    const [game] = content.quizshowGames as Array<{
      rounds: Array<Record<string, unknown> & { questions: object[] }>;
    }>;
    const [round] = game?.rounds ?? [];
    expect(Object.keys(round ?? {}).sort()).toEqual([
      "contentLabel",
      "kind",
      "questions",
      "title",
    ]);
    expect(Object.keys(round?.questions[0] ?? {}).sort()).toEqual([
      "acceptedAnswers",
      "answer",
      "mediaRef",
      "options",
      "prompt",
      "type",
    ]);
  });

  it("carries the quiz title on a play", () => {
    const content = buildDemoArchiveContent(["events"]);
    const [play] = content.quizshowPlays as Array<{ quizTitle: string }>;
    expect(play?.quizTitle).toBe("Co-op quiz night");
  });
});
