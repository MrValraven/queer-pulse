import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { useShareToCommunity } from "../economy/api/useShareToCommunity";
import { useCommunityDiscussions } from "./api/useCommunityDiscussions";
import { useCommunityPosts } from "./api/useCommunityPosts";
import type { Post } from "./community.model";
import {
  addDemoSharedPost,
  clearDemoSharedPosts,
  useDemoSharedPosts,
} from "./demoSharedPosts";

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
);

const sharedPost: Post = {
  id: "demo-shared-test",
  author: { initials: "TC", name: "Tiago Costa", tint: "plum" },
  body: "have a listen\n\nhttps://queerpulse.com/studio/album?id=demo-release-home-3",
  kind: "post",
  reactions: [{ key: "heart", count: 0 }],
  replies: [],
  createdAt: "2026-10-14T10:00:00.000Z",
  communitySlug: "trans-hub",
};

afterEach(() => clearDemoSharedPosts());

describe("demo shared posts", () => {
  it("lands a demo share at the top of that community's board", () => {
    const { result } = renderHook(() => useCommunityPosts("trans-hub"), {
      wrapper,
    });
    const mockCount = result.current.pulse.length;
    act(() => addDemoSharedPost(sharedPost));
    expect(result.current.pulse[0]?.id).toBe("demo-shared-test");
    expect(result.current.pulse).toHaveLength(mockCount + 1);
  });

  it("leaves other communities' boards alone", () => {
    const { result } = renderHook(() => useCommunityPosts("queer-runners"), {
      wrapper,
    });
    act(() => addDemoSharedPost(sharedPost));
    expect(
      result.current.pulse.some((post) => post.id === "demo-shared-test"),
    ).toBe(false);
  });

  it("lands a demo share on a non-flagship community's discussion board", () => {
    const { result } = renderHook(
      () => useCommunityDiscussions("queer-runners"),
      {
        wrapper,
      },
    );
    act(() =>
      addDemoSharedPost({ ...sharedPost, communitySlug: "queer-runners" }),
    );
    expect(result.current.threads[0]?.id).toBe("demo-shared-test");
    expect(result.current.threads[0]?.post).toBe(sharedPost.body);
  });

  it("puts a demo share from the community modal on that board", async () => {
    const { result } = renderHook(
      () => ({
        share: useShareToCommunity(),
        posts: useDemoSharedPosts("trans-hub"),
      }),
      { wrapper },
    );
    act(() => {
      void result.current.share.mutateAsync({
        communitySlug: "trans-hub",
        body: sharedPost.body,
      });
    });
    // The demo round trip waits 550ms before it resolves.
    await waitFor(
      () => expect(result.current.posts[0]?.body).toBe(sharedPost.body),
      { timeout: 3000 },
    );
    expect(result.current.posts[0]?.kind).toBe("post");
    expect(result.current.posts[0]?.communitySlug).toBe("trans-hub");
  });
});
