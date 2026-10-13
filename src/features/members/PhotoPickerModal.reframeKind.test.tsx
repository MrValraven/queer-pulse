import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { MyMediaItem } from "../settings/api/myMedia.api";
import { PhotoPickerModal } from "./PhotoPickerModal";

// Keys back as their own text so assertions don't depend on the catalogs.
vi.mock("../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({
    language: "en",
    setLanguage: vi.fn(),
    t: (key: string) => key,
    translateIn: () => undefined,
  }),
}));

vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("./api/useUploadImage", () => ({
  useUploadImage: () => vi.fn(),
}));

const mediaItems: { current: MyMediaItem[] } = { current: [] };

vi.mock("../settings/api/useMyMedia", () => ({
  useMyMedia: () => ({
    items: mediaItems.current,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useDeleteMyMedia: () => ({ mutate: vi.fn(), isPending: false }),
  useSaveMyMediaCrop: () => ({ mutate: vi.fn(), isPending: false }),
}));

const SAVED_CROP = { x: 0.1, y: 0.2, width: 0.6, height: 0.5, aspect: "7:3" };

function mediaItem(overrides: Partial<MyMediaItem>): MyMediaItem {
  return {
    key: "uploads/photo.jpg",
    kind: "avatar",
    size: 120_000,
    lastModified: "2026-08-09T10:00:00.000Z",
    fileUrl: "https://example.test/photo.jpg",
    references: [],
    crop: null,
    ...overrides,
  };
}

function tileFor(index: number) {
  const tile = screen.getAllByRole("listitem").at(index);
  if (!tile) throw new Error(`No grid tile at index ${index}`);
  return within(tile);
}

const REPOSITION_LABEL = "members:avatar.picker.edit";

// A crop is stored once per media item, so repositioning a past upload of
// another kind (an avatar inside a listing cover picker) would reframe it
// everywhere else it is used. Only uploads of the picker's own kind offer it.
describe("PhotoPickerModal reposition button", () => {
  it("shows on a past upload of the picker's kind and hides on another kind", () => {
    mediaItems.current = [
      mediaItem({ key: "uploads/avatar.jpg", kind: "avatar" }),
      mediaItem({ key: "uploads/cover.jpg", kind: "listing-cover" }),
    ];
    render(
      <PhotoPickerModal
        kind="listing-cover"
        onClose={vi.fn()}
        onPick={vi.fn()}
      />,
    );

    expect(
      tileFor(0).queryByRole("button", { name: REPOSITION_LABEL }),
    ).toBeNull();
    expect(
      tileFor(1).getByRole("button", { name: REPOSITION_LABEL }),
    ).toBeTruthy();
  });

  it("offers it on avatar uploads in the default avatar picker", () => {
    mediaItems.current = [
      mediaItem({ key: "uploads/avatar.jpg", kind: "avatar" }),
      mediaItem({ key: "uploads/work.jpg", kind: "work-image" }),
    ];
    render(<PhotoPickerModal onClose={vi.fn()} onPick={vi.fn()} />);

    expect(
      tileFor(0).getByRole("button", { name: REPOSITION_LABEL }),
    ).toBeTruthy();
    expect(
      tileFor(1).queryByRole("button", { name: REPOSITION_LABEL }),
    ).toBeNull();
  });

  it("keeps GIFs of the picker's kind without the button", () => {
    mediaItems.current = [
      mediaItem({ key: "uploads/loop.GIF", kind: "listing-cover" }),
    ];
    render(
      <PhotoPickerModal
        kind="listing-cover"
        onClose={vi.fn()}
        onPick={vi.fn()}
      />,
    );

    expect(
      tileFor(0).queryByRole("button", { name: REPOSITION_LABEL }),
    ).toBeNull();
  });

  it("still picks a past upload of another kind with its saved crop", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    mediaItems.current = [
      mediaItem({
        key: "uploads/avatar.jpg",
        kind: "avatar",
        crop: SAVED_CROP,
      }),
    ];
    render(
      <PhotoPickerModal
        kind="listing-cover"
        onClose={vi.fn()}
        onPick={onPick}
      />,
    );

    await user.click(
      tileFor(0).getByRole("button", { name: "members:avatar.picker.useThis" }),
    );

    expect(onPick).toHaveBeenCalledWith(
      "uploads/avatar.jpg",
      expect.any(String),
      SAVED_CROP,
    );
  });
});
