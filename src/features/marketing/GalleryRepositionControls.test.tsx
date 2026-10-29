import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { ListingPhotoFramingError } from "./api/listingPhotoFraming.api";
import {
  GalleryRepositionControls,
  type GalleryRepositionControlsProps,
} from "./GalleryRepositionControls";

/** `marketing` is a lazy namespace, so every query waits with `findBy`. */
function renderControls(overrides: Partial<GalleryRepositionControlsProps>) {
  const props: GalleryRepositionControlsProps = {
    isEditing: true,
    viewport: "desktop",
    onViewportChange: vi.fn(),
    isDirty: true,
    isSaving: false,
    error: null,
    onStart: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
  const { rerender } = render(
    <TestProviders>
      <GalleryRepositionControls {...props} />
    </TestProviders>,
  );
  const rerenderWith = (changes: Partial<GalleryRepositionControlsProps>) =>
    rerender(
      <TestProviders>
        <GalleryRepositionControls {...props} {...changes} />
      </TestProviders>,
    );
  return { ...props, rerenderWith };
}

describe("GalleryRepositionControls", () => {
  it("shows Reposition photos outside edit mode and starts editing on click", async () => {
    const props = renderControls({ isEditing: false });
    fireEvent.click(
      await screen.findByRole("button", { name: "Reposition photos" }),
    );
    expect(props.onStart).toHaveBeenCalledTimes(1);
  });

  it("leaves focus alone on first render", async () => {
    renderControls({ isEditing: false });
    expect(
      await screen.findByRole("button", { name: "Reposition photos" }),
    ).not.toHaveFocus();
  });

  it("returns focus to Reposition photos when edit mode ends", async () => {
    const { rerenderWith } = renderControls({ isEditing: true });
    (await screen.findByRole("button", { name: "Cancel" })).focus();
    rerenderWith({ isEditing: false });
    expect(
      await screen.findByRole("button", { name: "Reposition photos" }),
    ).toHaveFocus();
  });

  it("shows Save positions, Cancel and a pressed Desktop toggle in edit mode", async () => {
    renderControls({});
    expect(
      await screen.findByRole("button", { name: "Desktop" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Phone" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(
      screen.getByRole("region", { name: "Photo positions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save positions" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("keeps Save positions disabled until a photo moved", async () => {
    renderControls({ isDirty: false });
    expect(
      await screen.findByRole("button", { name: "Save positions" }),
    ).toBeDisabled();
  });

  it("labels the save button Saving positions while the save runs", async () => {
    renderControls({ isSaving: true });
    expect(
      await screen.findByRole("button", { name: "Saving positions" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  it("names the reason when a save failed", async () => {
    const error: ListingPhotoFramingError = {
      reason: "notManager",
      status: 403,
    };
    renderControls({ error });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You no longer manage this listing, so the photo positions were not saved.",
    );
  });

  it("puts the HTTP status into the refused message", async () => {
    renderControls({ error: { reason: "refused", status: 418 } });
    expect(await screen.findByRole("alert")).toHaveTextContent("(error 418)");
  });
});
