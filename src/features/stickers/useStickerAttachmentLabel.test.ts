import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StickerPackResponse } from "../../shared/contracts/contracts";
import { useStickerAttachmentLabel } from "./useStickerAttachmentLabel";

const translationState = { language: "en" as "en" | "pt" };
const stickerPacksMock = vi.fn<
  (options: { isEnabled?: boolean }) => {
    data: StickerPackResponse[] | undefined;
  }
>();

vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    language: translationState.language,
  }),
}));

vi.mock("./api/useStickerPacks", () => ({
  useStickerPacks: (options: { isEnabled?: boolean }) =>
    stickerPacksMock(options),
}));

const STICKER_ID = "sticker-1";

const catalogue: StickerPackResponse[] = [
  {
    id: "pack-1",
    slug: "bi-pride",
    name: "Bi pride",
    namePt: "Orgulho bi",
    description: null,
    coverStickerId: null,
    stickers: [
      {
        id: STICKER_ID,
        slug: "bi-reverse",
        label: "Bi reverse",
        labelPt: "Bi do catalogo",
        url: "https://example.test/bi-reverse.png",
        width: 512,
        height: 512,
        keywords: { en: [], pt: [] },
      },
    ],
  },
];

describe("useStickerAttachmentLabel", () => {
  beforeEach(() => {
    translationState.language = "en";
    stickerPacksMock.mockReset();
    stickerPacksMock.mockReturnValue({ data: catalogue });
  });

  it("names the sticker by its English label for an English reader", () => {
    const { result } = renderHook(() =>
      useStickerAttachmentLabel({
        stickerId: STICKER_ID,
        label: "Bi reverse",
        labelPt: "Bi invertido",
      }),
    );

    expect(result.current).toBe("Bi reverse");
    expect(stickerPacksMock).toHaveBeenCalledWith({ isEnabled: false });
  });

  it("uses the baked Portuguese name for a Portuguese reader and skips the catalogue", () => {
    translationState.language = "pt";

    const { result } = renderHook(() =>
      useStickerAttachmentLabel({
        stickerId: STICKER_ID,
        label: "Bi reverse",
        labelPt: "Bi invertido",
      }),
    );

    expect(result.current).toBe("Bi invertido");
    expect(stickerPacksMock).toHaveBeenCalledWith({ isEnabled: false });
  });

  it("falls back to the catalogue name for a Portuguese reader of an older sticker message", () => {
    translationState.language = "pt";

    const { result } = renderHook(() =>
      useStickerAttachmentLabel({ stickerId: STICKER_ID, label: "Bi reverse" }),
    );

    expect(result.current).toBe("Bi do catalogo");
    expect(stickerPacksMock).toHaveBeenCalledWith({ isEnabled: true });
  });

  it("falls back to the English label while the catalogue has not loaded", () => {
    translationState.language = "pt";
    stickerPacksMock.mockReturnValue({ data: undefined });

    const { result } = renderHook(() =>
      useStickerAttachmentLabel({ stickerId: STICKER_ID, label: "Bi reverse" }),
    );

    expect(result.current).toBe("Bi reverse");
  });

  it("returns an empty name and keeps the catalogue idle for a message that is no sticker", () => {
    translationState.language = "pt";

    const { result } = renderHook(() => useStickerAttachmentLabel(null));

    expect(result.current).toBe("");
    expect(stickerPacksMock).toHaveBeenCalledWith({ isEnabled: false });
  });
});
