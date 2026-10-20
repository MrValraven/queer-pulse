import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { setDemoModeRuntime } from "../../shared/api/demoModeRuntime";
import { conversations } from "./data";
import {
  findStudioLink,
  type StudioLinkTarget,
} from "../studio/share/studioLinkTarget";
import {
  demoStudioRelease,
  demoStudioTrack,
} from "../studio/api/studioDemoApi";
import { demoStudioPlaylist } from "../studio/api/studioDemoPlaylists";
import { isStudioNotFound, isStudioWithdrawn } from "../studio/api/studio.api";

function seededLinks(conversationId: string) {
  const conversation = conversations.find(
    (candidate) => candidate.id === conversationId,
  );
  return (conversation?.messages ?? [])
    .flatMap((group) => group.items)
    .flatMap((item) => {
      const match = findStudioLink(item.text);
      return match ? [{ messageId: item.id, text: item.text, match }] : [];
    });
}

function outcomeOf(target: StudioLinkTarget): string {
  try {
    if (target.kind === "track") demoStudioTrack(target.id);
    else if (target.kind === "release") demoStudioRelease(target.id);
    else demoStudioPlaylist(target.id);
    return "ready";
  } catch (error) {
    if (isStudioWithdrawn(error)) return "withdrawn";
    if (isStudioNotFound(error)) return "unavailable";
    throw error;
  }
}

// Demo Studio ids are slugs, which the parser reads only in demo mode.
beforeAll(() => setDemoModeRuntime(true));
afterAll(() => setDemoModeRuntime(false));

describe("demo Studio share seeds", () => {
  it("gives Priya's DM a track with a note and a withdrawn track", () => {
    const links = seededLinks("priya");
    expect(
      links.map(
        (link) => `${link.match.target.kind}:${outcomeOf(link.match.target)}`,
      ),
    ).toEqual(["track:ready", "track:withdrawn"]);
    expect(links[0]?.text.split("\n")[0]).not.toBe("");
    expect(links[0]?.match.target.startAtSeconds).toBe(42);
  });

  it("gives the Porto group a playlist and an unavailable track", () => {
    const links = seededLinks("porto-mentors");
    expect(
      links.map(
        (link) => `${link.match.target.kind}:${outcomeOf(link.match.target)}`,
      ),
    ).toEqual(["playlist:ready", "track:unavailable"]);
  });
});
