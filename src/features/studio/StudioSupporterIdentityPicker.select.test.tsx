import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import {
  toSupporterIdentityView,
  type StudioSupporterOptionView,
} from "./api/studioListening.adapters";
import type { StudioSupporterIdentityDTO } from "./api/studioListening.types";
import { StudioSupporterIdentityPicker } from "./StudioSupporterIdentityPicker";

const ACCOUNT_DTO: StudioSupporterIdentityDTO = {
  kind: "account",
  member: { slug: "tiago", displayName: "Tiago Costa", avatarUrl: null },
};

const LATE_BLOOMERS_DTO: StudioSupporterIdentityDTO = {
  kind: "persona",
  persona: {
    id: "sp-late-bloomers",
    handle: "late-bloomers",
    name: "Late Bloomers",
    kind: "musician",
    avatarUrl: null,
    isLinkable: true,
  },
};

function optionOf(
  shownAsSubprofileId: string | null,
  dto: StudioSupporterIdentityDTO,
): StudioSupporterOptionView {
  const identity = toSupporterIdentityView(dto);
  if (identity === null) throw new Error("test identity must resolve");
  return { shownAsSubprofileId, identity };
}

const OPTIONS: StudioSupporterOptionView[] = [
  optionOf(null, ACCOUNT_DTO),
  optionOf("sp-late-bloomers", LATE_BLOOMERS_DTO),
];

function renderPicker(
  extraProps: Partial<Parameters<typeof StudioSupporterIdentityPicker>[0]>,
) {
  render(
    <TestProviders>
      <StudioSupporterIdentityPicker
        personaName="NIGHTFORM"
        options={OPTIONS}
        initialShownAsSubprofileId={null}
        isSaving={false}
        errorKey={null}
        shouldFocusOnOpen={false}
        onSave={vi.fn()}
        onClose={vi.fn()}
        {...extraProps}
      />
    </TestProviders>,
  );
}

describe("StudioSupporterIdentityPicker with a legend and no actions", () => {
  it("names the group by the legend and offers no Save or Close button", () => {
    renderPicker({
      legend: "How you appear on the wall",
      shouldShowActions: false,
      onSelect: vi.fn(),
    });

    expect(
      screen.getByRole("radiogroup", { name: "How you appear on the wall" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Save how you appear" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Close without saving" }),
    ).not.toBeInTheDocument();
  });

  it("reports the persona id for a persona card and null for the account", () => {
    const onSelect = vi.fn();
    renderPicker({
      legend: "How you appear on the wall",
      shouldShowActions: false,
      onSelect,
    });

    fireEvent.click(screen.getByRole("radio", { name: /Late Bloomers/ }));
    expect(onSelect).toHaveBeenLastCalledWith("sp-late-bloomers");

    fireEvent.click(screen.getByRole("radio", { name: /Tiago Costa/ }));
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });

  it("keeps the persona legend and both buttons without the new props", () => {
    renderPicker({});

    expect(
      screen.getByRole("radiogroup", { name: "How NIGHTFORM sees you" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save how you appear" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Close without saving" }),
    ).toBeInTheDocument();
  });
});
