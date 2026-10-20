import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setDemoModeRuntime } from "../../../shared/api/demoModeRuntime";
import { ApiError } from "../../../shared/api/client";
import { LIVING } from "../../communities/livingCommunities.data";
import { THREADS } from "../../forum/forum.data";
import { DEMO_PERSONA_POSTS } from "../../subprofiles/data/personaPosts.data";
import { demoStudioRelease, demoStudioTrack } from "../api/studioDemoApi";
import { findStudioLink, type StudioLinkTarget } from "./studioLinkTarget";

beforeEach(() => setDemoModeRuntime(true));
afterEach(() => setDemoModeRuntime(false));

function targetIn(text: string | null | undefined): StudioLinkTarget {
  const match = findStudioLink(text ?? "");
  expect(match).not.toBeNull();
  return match!.target;
}

function resolve(target: StudioLinkTarget) {
  return target.kind === "track"
    ? demoStudioTrack(target.id)
    : demoStudioRelease(target.id);
}

describe("rich card post seeds resolve in the demo Studio registries", () => {
  it("seeds a Pulse post with a release that the demo feed shows", () => {
    const hub = LIVING["trans-hub"]!;
    const board = [...hub.pinned, ...hub.pulse];
    const seedIndex = board.findIndex((post) => post.id === "hub-p-studio");
    expect(seedIndex).toBeGreaterThan(-1);
    expect(seedIndex).toBeLessThan(2);
    const target = targetIn(board[seedIndex]?.body);
    expect(target.kind).toBe("release");
    expect(resolve(target).id).toBe(target.id);
  });

  it("seeds a forum reply with a track and one with a withdrawn release", () => {
    const welcome = THREADS.find((thread) => thread.id === 3)!;
    const replyById = (id: string) =>
      welcome.replies.find((reply) => reply.id === id)!;
    const trackTarget = targetIn(
      replyById("reply-thread3-carla-studio").body.join("\n"),
    );
    expect(trackTarget.kind).toBe("track");
    expect(resolve(trackTarget).id).toBe(trackTarget.id);
    const withdrawnTarget = targetIn(
      replyById("reply-thread3-diogo-studio").body.join("\n"),
    );
    try {
      resolve(withdrawnTarget);
      throw new Error("expected a 410");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(410);
    }
  });

  it("seeds persona posts with a release and a scheduled release", () => {
    const marianaPost = DEMO_PERSONA_POSTS["demo-persona-mariana-sol"]!.find(
      (post) => post.id === "demo-post-mariana-release",
    )!;
    const releaseTarget = targetIn(marianaPost.linkUrl);
    expect(resolve(releaseTarget).id).toBe(releaseTarget.id);
    const nightformPost = DEMO_PERSONA_POSTS["sp-diogo-nightform"]![0]!;
    const scheduledTarget = targetIn(nightformPost.linkUrl);
    expect(demoStudioRelease(scheduledTarget.id).status).toBe("scheduled");
  });
});
