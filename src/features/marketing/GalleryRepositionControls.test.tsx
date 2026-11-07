import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { awaitCatalog } from "../../test/awaitCatalog";
import { TestProviders } from "../../test/TestProviders";
import type { ListingPhotoFramingError } from "./api/listingPhotoFraming.api";
import {
  GalleryRepositionControls,
  type GalleryRepositionControlsProps,
} from "./GalleryRepositionControls";

/** `marketing` is a lazy namespace, so the helper waits for its catalog. The
 *  controls sit in their own box: the toast region keeps an empty alert of
 *  its own beside them. */
async function renderControls(
  overrides: Partial<GalleryRepositionControlsProps>,
) {
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
      <div data-testid="reposition-controls">
        <GalleryRepositionControls {...props} />
      </div>
    </TestProviders>,
  );
  await awaitCatalog("marketing");
  const rerenderWith = (changes: Partial<GalleryRepositionControlsProps>) =>
    rerender(
      <TestProviders>
        <div data-testid="reposition-controls">
          <GalleryRepositionControls {...props} {...changes} />
        </div>
      </TestProviders>,
    );
  return { ...props, rerenderWith };
}

describe("GalleryRepositionControls", () => {
  it("shows Reposition photos outside edit mode and starts editing on click", async () => {
    const props = await renderControls({ isEditing: false });
    fireEvent.click(
      await screen.findByRole("button", { name: "Reposition photos" }),
    );
    expect(props.onStart).toHaveBeenCalledTimes(1);
  });

  it("leaves focus alone on first render", async () => {
    await renderControls({ isEditing: false });
    expect(
      await screen.findByRole("button", { name: "Reposition photos" }),
    ).not.toHaveFocus();
  });

  it("returns focus to Reposition photos when edit mode ends", async () => {
    const { rerenderWith } = await renderControls({ isEditing: true });
    (await screen.findByRole("button", { name: "Cancel" })).focus();
    rerenderWith({ isEditing: false });
    expect(
      await screen.findByRole("button", { name: "Reposition photos" }),
    ).toHaveFocus();
  });

  it("shows Save positions, Cancel and a pressed Desktop toggle in edit mode", async () => {
    await renderControls({});
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
    await renderControls({ isDirty: false });
    expect(
      await screen.findByRole("button", { name: "Save positions" }),
    ).toBeDisabled();
  });

  it("labels the save button Saving positions while the save runs", async () => {
    await renderControls({ isSaving: true });
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
    await renderControls({ error });
    expect(
      await within(screen.getByTestId("reposition-controls")).findByRole(
        "alert",
      ),
    ).toHaveTextContent(
      "You no longer manage this listing, so the photo positions were not saved.",
    );
  });

  it("puts the HTTP status into the refused message", async () => {
    await renderControls({ error: { reason: "refused", status: 418 } });
    expect(
      await within(screen.getByTestId("reposition-controls")).findByRole(
        "alert",
      ),
    ).toHaveTextContent("(error 418)");
  });
});
