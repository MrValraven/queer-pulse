import { QueryClient, type InfiniteData } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { patchMessageEdit } from "../../shared/api/messageCache";
import type { MessageResponse } from "../../shared/contracts/contracts";
import { groupIntoAlbums } from "./messageAlbums";
import {
  editableTextOf,
  editedTextOfResponse,
  isCaptionEditKind,
  isEditableMessageKind,
} from "./messageEditKinds";
import { useMessageActionMenu } from "./useMessageActionMenu";
import type { LongPressOrigin } from "./useLongPress";
import type { ChatMessage } from "./data";

const editMutate = vi.fn();
const idleMutation = { mutate: vi.fn(), isPending: false };

vi.mock("./api/useMessageActions", () => ({
  useToggleReaction: () => idleMutation,
  useDeleteMessage: () => idleMutation,
  useDeleteMessageForMe: () => idleMutation,
  useEditMessage: () => ({ mutate: editMutate, isPending: false }),
}));

const ORIGIN: LongPressOrigin = {
  rect: { top: 0, left: 0, width: 100, height: 40 } as DOMRect,
  source: "pointer",
  point: { x: 10, y: 10 },
};

function ownMessage(overrides: Partial<ChatMessage>): ChatMessage {
  return {
    id: "message-1",
    from: "me",
    text: "See you at nine",
    canEdit: true,
    ...overrides,
  };
}

function captionedPhoto(caption?: string): ChatMessage {
  return ownMessage({
    kind: "image",
    text: "Photo",
    attachment: {
      url: "https://example.test/photo.jpg",
      previewUrl: "https://example.test/photo.jpg",
      width: 800,
      height: 600,
      provider: "upload",
      ...(caption ? { caption } : {}),
    },
  });
}

function captionedGif(caption?: string): ChatMessage {
  return ownMessage({
    kind: "gif",
    text: "GIF",
    attachment: {
      url: "https://media.example.test/wave.gif",
      previewUrl: "https://media.example.test/wave.gif",
      width: 200,
      height: 200,
      provider: "klipy",
      ...(caption ? { caption } : {}),
    },
  });
}

const STICKER_MESSAGE = ownMessage({
  kind: "sticker",
  text: "",
  attachment: {
    url: "https://example.test/sticker.png",
    previewUrl: "https://example.test/sticker.png",
    width: 256,
    height: 256,
    provider: "sticker",
    stickerId: "sticker-1",
    label: "Pride flag",
  },
});

describe("message edit kinds (ENG-405)", () => {
  it("withholds Edit from stickers only and keeps it on every other kind", () => {
    expect(isEditableMessageKind("sticker")).toBe(false);
    expect(isEditableMessageKind("gif")).toBe(true);
    expect(isEditableMessageKind("image")).toBe(true);
    expect(isEditableMessageKind("document")).toBe(true);
    expect(isEditableMessageKind("user")).toBe(true);
    expect(isEditableMessageKind(undefined)).toBe(true);
  });

  it("edits the caption of a photo, document or GIF only", () => {
    expect(isCaptionEditKind("image")).toBe(true);
    expect(isCaptionEditKind("document")).toBe(true);
    expect(isCaptionEditKind("gif")).toBe(true);
    expect(isCaptionEditKind("sticker")).toBe(false);
    expect(isCaptionEditKind("user")).toBe(false);
  });

  it("seeds a photo edit with its caption, empty when it has none", () => {
    expect(editableTextOf(captionedPhoto("Sunset at the pier"))).toBe(
      "Sunset at the pier",
    );
    expect(editableTextOf(captionedPhoto())).toBe("");
    expect(editableTextOf(ownMessage({}))).toBe("See you at nine");
  });

  it("seeds a GIF edit with its caption and keeps the GIF fallback out", () => {
    expect(editableTextOf(captionedGif("Hapy birthday"))).toBe("Hapy birthday");
    expect(editableTextOf(captionedGif())).toBe("");
  });

  it("reads the edited caption off a server response for a GIF", () => {
    const response = {
      kind: "gif",
      body: "GIF",
      attachment: {
        url: "u",
        previewUrl: "u",
        width: 1,
        height: 1,
        provider: "klipy",
        caption: "Happy birthday",
      },
    } as MessageResponse;
    expect(editedTextOfResponse(response)).toBe("Happy birthday");
  });

  it("reads the edited caption off a server response for a photo", () => {
    const response = {
      kind: "image",
      body: "Photo",
      attachment: {
        url: "u",
        previewUrl: "u",
        width: 1,
        height: 1,
        provider: "upload",
        caption: "Sunset",
      },
    } as MessageResponse;
    expect(editedTextOfResponse(response)).toBe("Sunset");
    expect(
      editedTextOfResponse({
        ...response,
        attachment: null,
      }),
    ).toBe("");
    expect(
      editedTextOfResponse({
        ...response,
        kind: "user",
        body: "Hello",
        attachment: null,
      }),
    ).toBe("Hello");
  });
});

describe("useMessageActionMenu edit gating (ENG-405)", () => {
  beforeEach(() => {
    editMutate.mockClear();
  });

  it("offers Edit on an own photo or GIF and withholds it from an own sticker", () => {
    const { result } = renderHook(() => useMessageActionMenu("conversation-1"));

    act(() =>
      result.current.openActions(captionedPhoto("Sunset"), ORIGIN, true),
    );
    expect(result.current.actionTarget?.canEdit).toBe(true);

    act(() => result.current.openActions(captionedGif(), ORIGIN, true));
    expect(result.current.actionTarget?.canEdit).toBe(true);

    act(() => result.current.openActions(STICKER_MESSAGE, ORIGIN, true));
    expect(result.current.actionTarget?.canEdit).toBe(false);
  });

  it("still follows the server flag when it withholds Edit", () => {
    const { result } = renderHook(() => useMessageActionMenu("conversation-1"));

    act(() =>
      result.current.openActions(
        { ...captionedPhoto("Sunset"), canEdit: false },
        ORIGIN,
        true,
      ),
    );
    expect(result.current.actionTarget?.canEdit).toBe(false);
  });

  it("never opens the inline editor for a sticker", () => {
    const { result } = renderHook(() => useMessageActionMenu("conversation-1"));

    act(() => result.current.beginEdit(STICKER_MESSAGE));
    expect(result.current.editingMessageId).toBeNull();

    act(() => result.current.beginEdit(captionedGif("Hapy birthday")));
    expect(result.current.editingMessageId).toBe("message-1");
  });

  it("sends an empty edit that clears a caption the GIF already had", () => {
    const { result } = renderHook(() => useMessageActionMenu("conversation-1"));

    act(() => result.current.submitEdit(captionedGif("Hapy birthday"), " "));
    expect(editMutate).toHaveBeenCalledWith({
      messageId: "message-1",
      body: "",
    });
  });

  it("saves a changed caption and skips an unchanged one", () => {
    const { result } = renderHook(() => useMessageActionMenu("conversation-1"));
    const photo = captionedPhoto("Sunset");

    act(() => result.current.submitEdit(photo, "  Sunset  "));
    expect(editMutate).not.toHaveBeenCalled();

    act(() => result.current.submitEdit(photo, "Sunset over the river"));
    expect(editMutate).toHaveBeenCalledWith({
      messageId: "message-1",
      body: "Sunset over the river",
    });
  });

  it("saves a first caption on a photo whose text is the Photo fallback", () => {
    const { result } = renderHook(() => useMessageActionMenu("conversation-1"));

    act(() => result.current.submitEdit(captionedPhoto(), "Photo"));
    expect(editMutate).toHaveBeenCalledWith({
      messageId: "message-1",
      body: "Photo",
    });
  });

  it("sends an empty edit that clears a caption the photo already had", () => {
    const { result } = renderHook(() => useMessageActionMenu("conversation-1"));

    act(() => result.current.submitEdit(captionedPhoto("Sunset"), "   "));
    expect(editMutate).toHaveBeenCalledWith({
      messageId: "message-1",
      body: "",
    });
    expect(result.current.editingMessageId).toBeNull();
  });

  it("skips an empty edit on a captionless photo and on a text message", () => {
    const { result } = renderHook(() => useMessageActionMenu("conversation-1"));

    act(() => result.current.submitEdit(captionedPhoto(), ""));
    act(() => result.current.submitEdit(ownMessage({}), ""));
    expect(editMutate).not.toHaveBeenCalled();
  });
});

describe("groupIntoAlbums while a caption is edited (ENG-405)", () => {
  function albumPhoto(id: string): ChatMessage {
    return {
      ...captionedPhoto(),
      id,
      from: "them",
      at: "2026-09-15T10:00:00.000Z",
    };
  }

  it("steps the photo being edited out of its album", () => {
    const items = [albumPhoto("a"), albumPhoto("b"), albumPhoto("c")];

    expect(groupIntoAlbums(items).map((segment) => segment.kind)).toEqual([
      "album",
    ]);
    const editing = groupIntoAlbums(items, "c");
    expect(editing.map((segment) => segment.kind)).toEqual([
      "album",
      "message",
    ]);
    expect(editing[1]).toMatchObject({ kind: "message", index: 2 });
  });
});

describe("patchMessageEdit on a photo (ENG-405)", () => {
  function threadWith(message: MessageResponse): QueryClient {
    const queryClient = new QueryClient();
    queryClient.setQueryData<
      InfiniteData<{ items: MessageResponse[]; nextCursor: string | null }>
    >(["messages", "conversation-1", false], {
      pages: [{ items: [message], nextCursor: null }],
      pageParams: [null],
    });
    return queryClient;
  }

  function cachedMessage(queryClient: QueryClient): MessageResponse {
    const data = queryClient.getQueryData<
      InfiniteData<{ items: MessageResponse[]; nextCursor: string | null }>
    >(["messages", "conversation-1", false]);
    return data!.pages[0]!.items[0]!;
  }

  const photoResponse = {
    id: "message-1",
    kind: "image",
    body: "Photo",
    editedAt: null,
    attachment: {
      url: "u",
      previewUrl: "u",
      width: 1,
      height: 1,
      provider: "upload",
      caption: "Sunset",
    },
  } as MessageResponse;

  it("patches the caption and keeps the Photo body", () => {
    const queryClient = threadWith(photoResponse);

    patchMessageEdit(
      queryClient,
      "conversation-1",
      "message-1",
      "Sunset over the river",
      "2026-09-29T10:00:00.000Z",
    );

    const patched = cachedMessage(queryClient);
    expect(patched.body).toBe("Photo");
    expect(patched.editedAt).toBe("2026-09-29T10:00:00.000Z");
    expect(patched.attachment).toMatchObject({
      caption: "Sunset over the river",
    });
  });

  it("clears the caption on an empty edit and keeps the Photo body", () => {
    const queryClient = threadWith(photoResponse);

    patchMessageEdit(
      queryClient,
      "conversation-1",
      "message-1",
      "",
      "2026-09-29T10:00:00.000Z",
    );

    const patched = cachedMessage(queryClient);
    expect(patched.body).toBe("Photo");
    expect(patched.attachment).toMatchObject({ caption: null });
  });

  it("patches the body of a text message", () => {
    const queryClient = threadWith({
      ...photoResponse,
      kind: "user",
      body: "See you at nine",
      attachment: null,
    });

    patchMessageEdit(
      queryClient,
      "conversation-1",
      "message-1",
      "See you at ten",
      "2026-09-29T10:00:00.000Z",
    );

    expect(cachedMessage(queryClient).body).toBe("See you at ten");
  });
});
