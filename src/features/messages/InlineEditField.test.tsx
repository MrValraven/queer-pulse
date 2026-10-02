// src/features/messages/InlineEditField.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { InlineEditField } from "./InlineEditField";

/** Renders the editor, empties its field and presses Save. Returns the
 *  submit spy so each case can say whether the empty edit went through. */
async function clearAndSave(initialValue: string, isCaption: boolean) {
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
  // The field is a mention combobox (`MentionTextarea`), not a bare textbox.
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "" } });
  // The `messages` catalog loads lazily, so wait for the translated label.
  fireEvent.click(await screen.findByRole("button", { name: "Save" }));
  return onSubmit;
}

describe("InlineEditField, clearing a caption (ENG-405)", () => {
  it("saves an empty edit that removes a caption the photo already had", async () => {
    const onSubmit = await clearAndSave("Sunset at the pier", true);
    expect(onSubmit).toHaveBeenCalledWith("");
  });

  it("keeps Save blocked on an empty caption edit of a photo that had none", async () => {
    const onSubmit = await clearAndSave("", true);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("keeps Save blocked on an empty text message edit", async () => {
    const onSubmit = await clearAndSave("See you at nine", false);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
