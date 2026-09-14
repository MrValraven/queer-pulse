import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useChatImageViewerState } from "./useChatImageViewerState";
import type { ChatMessage } from "./data";

const options = { counterpartName: "Nadia", youLabel: "You" };

function photoMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    from: "them",
    text: "Photo",
    time: "14:32",
    kind: "image",
    attachment: {
      url: "https://cdn.example/a.jpg",
      previewUrl: "https://cdn.example/a-small.jpg",
      width: 800,
      height: 600,
      provider: "upload",
    },
    ...overrides,
  };
}

describe("useChatImageViewerState", () => {
  it("keeps openImage referentially stable across a rerender with unchanged groups and options", () => {
    const messageGroups = [
      { day: "Today", items: [photoMessage({ id: "m1" })] },
    ];
    const { result, rerender } = renderHook(
      (props: { messageGroups: typeof messageGroups }) =>
        useChatImageViewerState(props.messageGroups, options),
      { initialProps: { messageGroups } },
    );
    const firstOpenImage = result.current.openImage;

    rerender({ messageGroups });

    expect(result.current.openImage).toBe(firstOpenImage);
  });

  it("gives openImage a new identity when the groups produce a different gallery", () => {
    const groupsWithOnePhoto = [
      { day: "Today", items: [photoMessage({ id: "m1" })] },
    ];
    const groupsWithTwoPhotos = [
      {
        day: "Today",
        items: [photoMessage({ id: "m1" }), photoMessage({ id: "m2" })],
      },
    ];
    const { result, rerender } = renderHook(
      (props: { messageGroups: typeof groupsWithOnePhoto }) =>
        useChatImageViewerState(props.messageGroups, options),
      { initialProps: { messageGroups: groupsWithOnePhoto } },
    );
    const firstOpenImage = result.current.openImage;

    rerender({ messageGroups: groupsWithTwoPhotos });

    expect(result.current.openImage).not.toBe(firstOpenImage);
  });

  it("leaves openIndex null for a message outside the gallery and sets it for one inside", () => {
    const inGallery = photoMessage({ id: "m1" });
    const notInGallery = photoMessage({
      id: "not-in-gallery",
      attachment: {
        url: "https://cdn.example/elsewhere.jpg",
        previewUrl: "https://cdn.example/elsewhere-small.jpg",
        width: 400,
        height: 300,
        provider: "upload",
      },
    });
    const messageGroups = [{ day: "Today", items: [inGallery] }];
    const { result } = renderHook(() =>
      useChatImageViewerState(messageGroups, options),
    );

    act(() => {
      result.current.openImage(notInGallery);
    });
    expect(result.current.openIndex).toBeNull();

    act(() => {
      result.current.openImage(inGallery);
    });
    expect(result.current.openIndex).toBe(0);
  });
});
