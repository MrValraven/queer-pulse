import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { AddMonthRow } from "./addMonthState";
import { AddMonthRowPhoto } from "./AddMonthRowPhoto";

vi.mock("../fields/CoverUpload", () => ({
  CoverUpload: ({
    value,
    onChange,
    onPreviewChange,
  }: {
    value: string;
    onChange: (value: string) => void;
    onPreviewChange?: (previewUrl: string) => void;
  }) => (
    <div data-testid="cover-upload" data-value={value}>
      <button
        type="button"
        onClick={() => {
          onChange("uploads/row-photo.jpg");
          onPreviewChange?.("blob:row-photo");
        }}
      >
        Stub pick
      </button>
    </div>
  ),
}));

const DATE = "2026-11-07";
const SHARED_COVER_URL = "https://cdn.example/shared-cover.jpg";
const dispatch = vi.fn();

const ROW: AddMonthRow = {
  date: DATE,
  title: "",
  description: "",
  photo: null,
  timeOverride: null,
};

const LIVE_PHOTO = {
  key: "uploads/row-photo.jpg",
  previewUrl: "blob:row-photo",
};

function renderPhoto(row: Partial<AddMonthRow> = {}) {
  return render(
    <TestProviders>
      <h3 id="row-heading">Sat 7 Nov</h3>
      <AddMonthRowPhoto
        row={{ ...ROW, ...row }}
        sharedCoverUrl={SHARED_COVER_URL}
        dispatch={dispatch}
        labelledBy="row-heading"
      />
    </TestProviders>,
  );
}

describe("AddMonthRowPhoto", () => {
  beforeEach(() => {
    dispatch.mockClear();
  });

  it("shows the shared cover marked Shared cover", () => {
    const { container } = renderPhoto();
    expect(screen.getByText("Shared cover")).toBeInTheDocument();
    expect(
      container.querySelector(`img[src="${SHARED_COVER_URL}"]`),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Use a different photo" }),
    ).toBeInTheDocument();
  });

  it("closing the photo picker without a pick keeps the shared cover", async () => {
    renderPhoto();
    await userEvent.click(
      screen.getByRole("button", { name: "Use a different photo" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Close photo picker" }),
    );
    expect(dispatch).not.toHaveBeenCalled();
    expect(screen.getByText("Shared cover")).toBeInTheDocument();
  });

  it("stores the picked key and its preview for this date", async () => {
    renderPhoto();
    await userEvent.click(
      screen.getByRole("button", { name: "Use a different photo" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Stub pick" }));
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: "setRowPhotoKey",
      date: DATE,
      key: "uploads/row-photo.jpg",
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: "setRowPhotoPreview",
      date: DATE,
      key: "uploads/row-photo.jpg",
      previewUrl: "blob:row-photo",
    });
  });

  it("keeps the upload open after a pick, so it keeps showing the photo", async () => {
    const { rerender } = renderPhoto();
    await userEvent.click(
      screen.getByRole("button", { name: "Use a different photo" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Stub pick" }));
    rerender(
      <TestProviders>
        <h3 id="row-heading">Sat 7 Nov</h3>
        <AddMonthRowPhoto
          row={{ ...ROW, photo: LIVE_PHOTO }}
          sharedCoverUrl={SHARED_COVER_URL}
          dispatch={dispatch}
          labelledBy="row-heading"
        />
      </TestProviders>,
    );
    expect(screen.getByTestId("cover-upload")).toHaveAttribute(
      "data-value",
      "uploads/row-photo.jpg",
    );
    // The folded summary can still be on its way out, so the button is
    // looked up inside the open upload block.
    const uploadBlock = screen.getByTestId("cover-upload").parentElement;
    expect(uploadBlock).not.toBeNull();
    expect(
      within(uploadBlock as HTMLElement).getByRole("button", {
        name: "Use the shared cover",
      }),
    ).toBeInTheDocument();
  });

  it("shows Photo added for a preview this card never made", () => {
    renderPhoto({
      photo: {
        key: "uploads/row-photo.jpg",
        previewUrl: "https://cdn.example/x.jpg",
      },
    });
    expect(screen.getByText("Photo added")).toBeInTheDocument();
    expect(screen.queryByTestId("cover-upload")).not.toBeInTheDocument();
  });

  it("shows Photo added for a restored photo with no preview", () => {
    renderPhoto({ photo: { key: "uploads/row-photo.jpg", previewUrl: null } });
    expect(screen.getByText("Photo added")).toBeInTheDocument();
    expect(screen.queryByText("Shared cover")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cover-upload")).not.toBeInTheDocument();
  });

  it("opens the upload empty for a restored key, which is no image address", async () => {
    renderPhoto({ photo: { key: "uploads/row-photo.jpg", previewUrl: null } });
    await userEvent.click(screen.getByRole("button", { name: "Change photo" }));
    expect(screen.getByTestId("cover-upload")).toHaveAttribute(
      "data-value",
      "",
    );
  });

  it("Use the shared cover clears this date's photo", async () => {
    renderPhoto({ photo: LIVE_PHOTO });
    await userEvent.click(
      screen.getByRole("button", { name: "Use the shared cover" }),
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: "setRowPhotoKey",
      date: DATE,
      key: "",
    });
  });
});
