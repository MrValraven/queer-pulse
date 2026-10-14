import { beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { studioErrorCodeOf } from "./studio.api";
import { resetDemoCreditLedger } from "./studioDemoCreditLedger";
import { DEMO_RELEASES } from "./studioDemo.data";
import {
  demoStudioCreditCandidate,
  demoStudioCreditInbox,
  demoStudioCreditPendingCount,
  demoStudioTrackPersonaCredits,
} from "./studioDemoCreditReads";
import {
  demoStudioAppearsOn,
  demoStudioCuration,
  demoStudioRadio,
  demoStudioRelatedArtists,
  demoStudioScene,
  demoStudioSceneReleases,
  demoStudioScenes,
} from "./studioDemoDiscovery";

function thrownBy(read: () => unknown): unknown {
  try {
    read();
  } catch (error) {
    return error;
  }
  return null;
}

beforeEach(() => resetDemoCreditLedger());

describe("demo curation", () => {
  it("features Cidade dos santos with its note and fills both shelves in order", () => {
    const curation = demoStudioCuration();
    expect(curation.featured?.title).toBe("Cidade dos santos");
    expect(curation.featured?.note).toMatch(/kitchen in Anjos/);
    expect(curation.staffPicks.map((pick) => pick.id)).toEqual([
      "demo-release-home-2",
      "demo-release-mariana-3",
      "demo-release-home-3",
    ]);
    expect(curation.newThisWeek.map((pick) => pick.id)).toEqual([
      "demo-release-home-1",
      "demo-release-home-4",
    ]);
  });
});

describe("demo scenes", () => {
  it("lists the active scenes by position", () => {
    expect(demoStudioScenes().items.map((scene) => scene.slug)).toEqual([
      "mouraria-fado",
      "porto-warehouse",
    ]);
  });

  it("answers an archived or unknown slug with studio_scene_not_found", () => {
    for (const slug of ["sintra-choirs", "nowhere"]) {
      const error = thrownBy(() => demoStudioScene(slug));
      expect(error).toBeInstanceOf(ApiError);
      expect(studioErrorCodeOf(error)).toBe("studio_scene_not_found");
    }
  });

  it("keeps an archived scene off the release card", () => {
    const cantiga = DEMO_RELEASES.find(
      (release) => release.id === "demo-release-home-3",
    );
    expect(cantiga?.scene).toBeNull();
  });

  it("serves a scene with no events and its artists newest first", () => {
    const scene = demoStudioScene("porto-warehouse");
    expect(scene.upcomingEvents).toEqual([]);
    expect(scene.artists.map((artist) => artist.name)).toEqual([
      "LeChatDashinko",
      "NIGHTFORM",
    ]);
  });

  it("pages a scene's releases newest first", () => {
    expect(
      demoStudioSceneReleases("mouraria-fado", null).items.map(
        (release) => release.id,
      ),
    ).toEqual([
      "demo-release-cidade-dos-santos",
      "demo-release-mariana-2",
      "demo-release-mariana-3",
    ]);
  });
});

describe("demo persona credits", () => {
  it("finds a candidate by exact handle, with or without the @", () => {
    expect(demoStudioCreditCandidate("@Grain-Studio").name).toBe("GRAIN");
    expect(
      studioErrorCodeOf(thrownBy(() => demoStudioCreditCandidate("grain"))),
    ).toBe("studio_credit_candidate_not_found");
  });

  it("finds no candidate for a persona shown to the network only", () => {
    expect(
      studioErrorCodeOf(
        thrownBy(() => demoStudioCreditCandidate("afterhours-club")),
      ),
    ).toBe("studio_credit_candidate_not_found");
  });

  it("lists every status on the owner's track, oldest first", () => {
    const rows = demoStudioTrackPersonaCredits(
      "demo-track-cidade-dos-santos-06",
    ).items;
    expect(rows.map((row) => row.status)).toEqual([
      "accepted",
      "accepted",
      "declined",
      "pending",
    ]);
  });

  it("files two requests and one accepted credit for the demo member", () => {
    const inbox = demoStudioCreditInbox();
    expect(inbox.requests.map((row) => row.id)).toEqual([
      "demo-credit-5",
      "demo-credit-6",
    ]);
    expect(inbox.accepted.map((row) => row.id)).toEqual(["demo-credit-7"]);
    expect(demoStudioCreditPendingCount()).toEqual({ count: 2 });
  });
});

describe("demo appears on and related artists", () => {
  it("lists the releases Mariana is credited on, with her roles", () => {
    const page = demoStudioAppearsOn("demo-persona-mariana-sol", null);
    expect(page.items.map((card) => [card.id, card.roles])).toEqual([
      ["demo-release-home-4", ["mixing"]],
    ]);
  });

  it("ranks credits first, then a shared scene, then a shared genre", () => {
    expect(
      demoStudioRelatedArtists("sp-diogo-nightform").items.map(
        (artist) => artist.id,
      ),
    ).toEqual([
      "demo-persona-mariana-sol",
      "sp-jordan-lechatdashinko",
      "demo-persona-rita-ferreira",
      "demo-persona-coro-de-outubro",
    ]);
  });

  it("leaves out every artist with nothing in common", () => {
    expect(
      demoStudioRelatedArtists("demo-persona-mariana-sol").items.map(
        (artist) => artist.id,
      ),
    ).toEqual(["sp-diogo-nightform"]);
  });
});

describe("demo radio", () => {
  it("queues every playable track of a genre with its duration", () => {
    const items = demoStudioRadio({ kind: "genre", value: "fado" }).items;
    expect(items).toHaveLength(17);
    expect(items.every((item) => item.durationSeconds > 0)).toBe(true);
  });

  it("keeps a one-track mood for the end-of-radio case", () => {
    expect(
      demoStudioRadio({ kind: "mood", value: "sweaty" }).items.map(
        (item) => item.trackId,
      ),
    ).toEqual(["demo-track-home-2-01"]);
  });
});
