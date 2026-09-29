// src/features/messages/InlineEditField.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { InlineEditField } from "./InlineEditField";

/** Renders the editor, empties its field and presses Save. Returns the
 *  submit spy so each case can say whether the empty edit went through. */
function clearAndSave(initialValue: string, isCaption: boolean) {
  const onSubmit = vi.fn();
  render(
    <InlineEditField
      initialValue={initialValue}
      isCaption={isCaption}
      onSubmit={onSubmit}
      onCancel={vi.fn()}
    />,
    { wrapper: TestProviders },
  );
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "" } });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  return onSubmit;
}

describe("InlineEditField, clearing a caption (ENG-405)", () => {
  it("saves an empty edit that removes a caption the photo already had", () => {
    const onSubmit = clearAndSave("Sunset at the pier", true);
    expect(onSubmit).toHaveBeenCalledWith("");
  });

  it("keeps Save blocked on an empty caption edit of a photo that had none", () => {
    const onSubmit = clearAndSave("", true);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("keeps Save blocked on an empty text message edit", () => {
    const onSubmit = clearAndSave("See you at nine", false);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
