import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioUploadGaplessField } from "./StudioUploadGaplessField";
import { defaultReleaseForm } from "./studioUploadDraft.data";

function renderField(isGapless: boolean) {
  const setField = vi.fn();
  render(
    <TestProviders>
      <StudioUploadGaplessField
        form={{ ...defaultReleaseForm(undefined), isGapless }}
        setField={setField}
      />
    </TestProviders>,
  );
  return setField;
}

describe("StudioUploadGaplessField", () => {
  it("turns play without gaps on from an empty line", async () => {
    const setField = renderField(false);
    const line = screen.getByRole("button");
    expect(line).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(line);
    expect(setField).toHaveBeenCalledWith("isGapless", true);
  });

  it("turns it off from a ticked line", async () => {
    const setField = renderField(true);
    const line = screen.getByRole("button");
    expect(line).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(line);
    expect(setField).toHaveBeenCalledWith("isGapless", false);
  });

  it("reads the hint with the choice", () => {
    renderField(false);
    const line = screen.getByRole("button");
    expect(line.textContent).toMatch(/\S/);
    expect(line.querySelectorAll("span span").length).toBeGreaterThan(1);
  });
});
