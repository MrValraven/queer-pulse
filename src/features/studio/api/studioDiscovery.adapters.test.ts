import { describe, expect, it } from "vitest";
import {
  toPersonaCreditViews,
  toPersonaRefView,
  toReleaseCardView,
  toReleaseView,
  toTrackView,
} from "./studio.adapters";
import type {
  StudioCreditInboxRowDTO,
  StudioCreditRole,
  StudioPersonaRefDTO,
  StudioReleaseCardDTO,
  StudioReleaseDTO,
} from "./studio.types";
import {
  toAppearsOnCardView,
  toCreditInboxView,
  toCurationView,
  toMoodList,
  toPersonaCreditOwnerRows,
  toSceneView,
} from "./studioDiscovery.adapters";

const nightform: StudioPersonaRefDTO = {
  id: "sp-nightform",
  handle: "nightform",
  name: "NIGHTFORM",
  kind: "musician",
  avatarUrl: null,
  isListenable: true,
};
const grain: StudioPersonaRefDTO = {
  id: "sp-grain",
  handle: "grain-studio",
  name: "GRAIN",
  kind: "visual_artist",
  avatarUrl: null,
  isListenable: false,
};
const handleless: StudioPersonaRefDTO = {
  id: "sp-coro",
  handle: "",
  name: "Coro de Outubro",
  kind: "musician",
  avatarUrl: null,
  isListenable: false,
};

const card: StudioReleaseCardDTO = {
  id: "release-1",
  title: "Cidade dos santos",
  type: "album",
  coverUrl: null,
  releasedOn: "2026-04-12",
  trackCount: 2,
  totalDurationSeconds: 400,
  artist: {
    id: "persona-mariana",
    handle: "",
    name: "Mariana Sol",
    kind: "musician",
    avatarUrl: null,
  },
  publishedAt: "2026-04-12T10:00:00.000Z",
  genre: "fado",
  mood: "melancholy",
  scene: { slug: "mouraria-fado", name: "Mouraria fado" },
};

const release: StudioReleaseDTO = {
  ...card,
  description: null,
  status: "published",
  tracks: [],
  isOwner: false,
  rightsConfirmedAt: null,
  takedownReason: null,
  sceneId: "scene-1",
  personaCredits: [
    { persona: grain, roles: ["cover-art"] },
    { persona: nightform, roles: ["remix", "producer"] },
  ],
};

const unknownRole = "lighting" as unknown as StudioCreditRole;

describe("release cards (discovery)", () => {
  it("carries the mood and the scene", () => {
    const view = toReleaseCardView(card);
    expect(view.mood).toBe("melancholy");
    expect(view.scene).toEqual({
      slug: "mouraria-fado",
      name: "Mouraria fado",
    });
  });

  it("reads an unknown mood and a missing scene as none", () => {
    const view = toReleaseCardView({ ...card, mood: "furious", scene: null });
    expect(view.mood).toBeNull();
    expect(view.scene).toBeNull();
  });
});

describe("persona refs", () => {
  it("links a listenable persona to its Studio page and any other persona to its persona page", () => {
    expect(toPersonaRefView(nightform).href).toBe(
      "/studio/artist?id=sp-nightform",
    );
    expect(toPersonaRefView(grain).href).toBe("/p/grain-studio");
  });

  it("leaves a persona with no handle as plain text", () => {
    expect(toPersonaRefView(handleless).href).toBeNull();
  });
});

describe("persona credits on releases and tracks", () => {
  it("keeps the scene id for the owner alone", () => {
    expect(toReleaseView(release).sceneId).toBeNull();
    expect(toReleaseView({ ...release, isOwner: true }).sceneId).toBe(
      "scene-1",
    );
  });

  it("orders each persona's roles by the role list", () => {
    const rows = toReleaseView(release).personaCredits;
    expect(rows.map((row) => row.persona.name)).toEqual(["GRAIN", "NIGHTFORM"]);
    expect(rows[1]?.roles).toEqual(["producer", "remix"]);
    expect(rows[1]?.roleLabelKeys).toEqual([
      "studio:credits.role.producer",
      "studio:credits.role.remix",
    ]);
  });

  it("drops a credit whose role this client cannot name", () => {
    const views = toPersonaCreditViews([
      { persona: nightform, role: "producer" },
      { persona: grain, role: unknownRole },
    ]);
    expect(views.map((view) => view.persona.name)).toEqual(["NIGHTFORM"]);
  });

  it("puts accepted credits on the track view", () => {
    const view = toTrackView({
      id: "track-6",
      position: 6,
      title: "Carta para a santa",
      durationSeconds: 258,
      isExplicit: false,
      hasAudio: true,
      releaseId: "release-1",
      credits: [],
      lyrics: null,
      syncedLyrics: null,
      chapters: null,
      release: card,
      personaCredits: [{ persona: nightform, role: "producer" }],
    });
    expect(view.personaCredits[0]?.roleLabelKey).toBe(
      "studio:credits.role.producer",
    );
    expect(view.personaCredits[0]?.persona.href).toBe(
      "/studio/artist?id=sp-nightform",
    );
  });
});

describe("owner rows", () => {
  it("keeps a row whose persona stopped being public, with its status label", () => {
    const [row] = toPersonaCreditOwnerRows([
      {
        id: "credit-1",
        persona: grain,
        role: "cover-art",
        status: "accepted",
        isPersonaPublic: false,
        createdAt: "2026-10-01T10:00:00.000Z",
      },
    ]);
    expect(row?.isPersonaPublic).toBe(false);
    expect(row?.statusLabelKey).toBe("studio:credits.status.accepted");
    expect(row?.roleLabelKey).toBe("studio:credits.role.coverArt");
  });
});

describe("curation", () => {
  it("trims notes and reads a blank note as none", () => {
    const view = toCurationView({
      featured: { ...card, note: "  Start with track six  " },
      staffPicks: [{ ...card, id: "release-2", note: "   " }],
      newThisWeek: [],
    });
    expect(view.featured?.note).toBe("Start with track six");
    expect(view.staffPicks[0]?.note).toBeNull();
    expect(view.featured?.href).toBe("/studio/album?id=release-1");
  });
});

describe("scenes", () => {
  it("links each event to its event page and names the place", () => {
    const view = toSceneView({
      id: "scene-1",
      slug: "mouraria-fado",
      name: "Mouraria fado",
      city: "Lisboa",
      coverUrl: null,
      blurb: "  ",
      artists: [],
      upcomingEvents: [
        {
          slug: "supper-club-12",
          title: "Queer Supper Club",
          startAt: "2026-11-14T19:30:00.000Z",
          endAt: null,
          timezone: "Europe/Lisbon",
          venue: null,
          neighbourhood: "Mouraria",
          isOnline: false,
          coverImageUrl: null,
        },
      ],
    });
    expect(view.blurb).toBeNull();
    expect(view.href).toBe("/studio/scene?slug=mouraria-fado");
    expect(view.upcomingEvents[0]?.placeName).toBe("Mouraria");
    expect(view.upcomingEvents[0]?.href).toMatch(
      /^\/gatherings\/supper-club-12-/,
    );
  });
});

describe("moods", () => {
  it("keeps the known moods in the server's order", () => {
    expect(
      toMoodList({ moods: ["tender", "furious", "late-night"] }).moods,
    ).toEqual(["tender", "late-night"]);
    expect(
      toMoodList({ moods: ["tender"], covers: { tender: "/tender.jpg" } })
        .coverByMood,
    ).toEqual({ tender: "/tender.jpg" });
  });
});

describe("credits inbox", () => {
  const pending: StudioCreditInboxRowDTO = {
    id: "credit-5",
    role: "featured",
    status: "pending",
    requestingPersona: nightform,
    creditedPersona: grain,
    track: { id: "track-1", title: "Pedro on the 25" },
    release: { id: "release-4", title: "Pedro on the 25", coverUrl: null },
    createdAt: "2026-10-10T10:00:00.000Z",
    respondedAt: null,
  };

  it("files pending and accepted rows apart and links the track", () => {
    const view = toCreditInboxView({
      requests: [pending],
      accepted: [
        {
          ...pending,
          id: "credit-7",
          status: "accepted",
          respondedAt: "2026-10-11T10:00:00.000Z",
        },
      ],
    });
    expect(view.requests.map((row) => row.id)).toEqual(["credit-5"]);
    expect(view.accepted.map((row) => row.id)).toEqual(["credit-7"]);
    expect(view.accepted[0]?.track.href).toBe("/studio/track?id=track-1");
    expect(view.accepted[0]?.release.href).toBe("/studio/album?id=release-4");
  });
});

describe("appears on", () => {
  it("lists the roles on the card in role order", () => {
    const view = toAppearsOnCardView({
      ...card,
      roles: ["mixing", "co-writer"],
    });
    expect(view.roles).toEqual(["co-writer", "mixing"]);
    expect(view.roleLabelKeys).toEqual([
      "studio:credits.role.coWriter",
      "studio:credits.role.mixing",
    ]);
  });
});
