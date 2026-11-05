import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { SubprofileKindChangeDialog } from "./SubprofileKindChangeDialog";
import type { SubprofileKind } from "./api/subprofiles.api";

function renderDialog({
  currentKind,
  nextKind,
  isSaving = false,
  onConfirm = vi.fn(),
}: {
  currentKind: SubprofileKind;
  nextKind: SubprofileKind;
  isSaving?: boolean;
  onConfirm?: () => void;
}) {
  return render(
    <TestProviders>
      <SubprofileKindChangeDialog
        currentKind={currentKind}
        nextKind={nextKind}
        isSaving={isSaving}
        onConfirm={onConfirm}
        onClose={vi.fn()}
      />
    </TestProviders>,
  );
}

describe("SubprofileKindChangeDialog", () => {
  it("names the hidden, appearing and staying sections for musician to dj", async () => {
    renderDialog({ currentKind: "musician", nextKind: "dj" });
    expect(
      await screen.findByRole("heading", { name: "Change type to DJ?" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Discography will be hidden."),
    ).toBeInTheDocument();
    expect(await screen.findByText("Mixes will appear.")).toBeInTheDocument();
    expect(await screen.findByText("Gigs stays.")).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Nothing is deleted. Change back to Musician and the hidden sections return as they were.",
      ),
    ).toBeInTheDocument();
  });

  it("joins several sections and omits the staying line for developer to ceramicist", async () => {
    renderDialog({ currentKind: "developer", nextKind: "ceramicist" });
    expect(
      await screen.findByText("Projects and Open source will be hidden."),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Wares and Firings & residencies will appear."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/stays\.|stay\./)).toBeNull();
  });

  it("omits the keeps-content line when nothing is hidden", async () => {
    renderDialog({ currentKind: "dancer", nextKind: "pole_dancer" });
    expect(
      await screen.findByRole("heading", {
        name: "Change type to Pole dancer?",
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Classes and Workshops will appear."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Nothing is deleted/)).toBeNull();
  });

  it("shows the keeps-content line when sections are hidden", async () => {
    renderDialog({ currentKind: "musician", nextKind: "dj" });
    expect(await screen.findByText(/Nothing is deleted/)).toBeInTheDocument();
  });

  it("calls onConfirm once when Change type is clicked", async () => {
    const onConfirm = vi.fn();
    renderDialog({ currentKind: "musician", nextKind: "dj", onConfirm });
    fireEvent.click(await screen.findByRole("button", { name: "Change type" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("disables Change type while saving", async () => {
    renderDialog({ currentKind: "musician", nextKind: "dj", isSaving: true });
    expect(
      await screen.findByRole("button", { name: "Change type" }),
    ).toBeDisabled();
  });
});
