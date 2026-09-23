import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { GifAttachment } from "../../shared/api/gifs";
import { useAttachmentSendQueue } from "./useAttachmentSendQueue";

// Task 7 (business mailboxes): an attachment queued in a business thread
// sends as the identity it was composed as, even when it leaves the queue
// after the member has switched mailboxes. A GIF skips the upload, so it
// walks the same `sendStaged` to `flushPendingHead` to `sendResolvedItem`
// path an uploaded image or document takes once its upload resolves.

vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));
vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("../members/api/useUploadImage", () => ({
  useUploadImage: () => vi.fn(),
}));
vi.mock("./useUploadDocument", () => ({
  useUploadDocument: () => vi.fn(),
}));

const CAFE_THREAD_ID = "66666666-6666-4666-8666-666666666666";

const gif: GifAttachment = {
  url: "https://media.example/cafe.gif",
  previewUrl: "https://media.example/cafe-preview.gif",
  width: 200,
  height: 120,
  provider: "klipy",
};

describe("the attachment queue", () => {
  it("sends a queued attachment as the identity snapshotted at Send", () => {
    const onSendGif = vi.fn();
    const { result } = renderHook(() => useAttachmentSendQueue({ onSendGif }));

    act(() => result.current.stageGif(CAFE_THREAD_ID, gif));
    act(() =>
      result.current.sendStaged(CAFE_THREAD_ID, {
        sendAsIdentityId: "identity-cafe",
      }),
    );

    expect(onSendGif).toHaveBeenCalledTimes(1);
    expect(onSendGif.mock.calls[0]![1]).toMatchObject({
      conversationId: CAFE_THREAD_ID,
      sendAsIdentityId: "identity-cafe",
    });
  });

  it("leaves a personal batch without an identity", () => {
    const onSendGif = vi.fn();
    const { result } = renderHook(() => useAttachmentSendQueue({ onSendGif }));

    act(() => result.current.stageGif(CAFE_THREAD_ID, gif));
    act(() => result.current.sendStaged(CAFE_THREAD_ID, {}));

    expect(onSendGif.mock.calls[0]![1]).toMatchObject({
      sendAsIdentityId: undefined,
    });
  });
});
