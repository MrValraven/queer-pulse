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
  it("turns play without gaps on from an empty box", async () => {
    const setField = renderField(false);
    const box = screen.getByRole("checkbox");
    expect(box).not.toBeChecked();
    await userEvent.click(box);
    expect(setField).toHaveBeenCalledWith("isGapless", true);
  });

  it("turns it off from a ticked box", async () => {
    const setField = renderField(true);
    const box = screen.getByRole("checkbox");
    expect(box).toBeChecked();
    await userEvent.click(box);
    expect(setField).toHaveBeenCalledWith("isGapless", false);
  });

  it("reads the hint as the box's description", () => {
    renderField(false);
    const box = screen.getByRole("checkbox");
    const hintId = box.getAttribute("aria-describedby") ?? "";
    const hint = document.getElementById(hintId);
    expect(hint?.textContent).toBeTruthy();
    expect(box).toHaveAccessibleDescription(hint?.textContent ?? "");
  });
});
