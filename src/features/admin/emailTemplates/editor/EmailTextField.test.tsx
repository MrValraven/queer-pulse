import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ActiveField } from "./activeField";
import { EmailTextField } from "./EmailTextField";

/**
 * Regression test for the stale-closure bug: `registerAsTarget` captures the
 * `insert` closure once, at focus time. A placeholder chip can be clicked
 * much later, after the field's `onChange` prop has been replaced by a
 * re-render (e.g. a sibling AdminSeg edit produced a new block object and a
 * new `onChange` callback for it). The captured `insert` must always route
 * through whichever `onChange` is current at the moment it runs.
 */
describe("EmailTextField", () => {
  it("routes a captured insert through the current onChange after a re-render", () => {
    const onChangeAtFirstRender = vi.fn();
    let capturedField: ActiveField | undefined;

    const { rerender } = render(
      <EmailTextField
        id="heading-text"
        label="Text"
        value="Hello"
        onChange={onChangeAtFirstRender}
        onFocusField={(field) => {
          capturedField = field;
        }}
        maxLength={200}
      />,
    );

    fireEvent.focus(screen.getByRole("textbox"));
    expect(capturedField).toBeDefined();

    const onChangeAfterRerender = vi.fn();
    rerender(
      <EmailTextField
        id="heading-text"
        label="Text"
        value="Hello"
        onChange={onChangeAfterRerender}
        onFocusField={(field) => {
          capturedField = field;
        }}
        maxLength={200}
      />,
    );

    capturedField?.insert("{name}");

    expect(onChangeAfterRerender).toHaveBeenCalledTimes(1);
    expect(onChangeAfterRerender.mock.calls[0]?.[0]).toContain("{name}");
    expect(onChangeAtFirstRender).not.toHaveBeenCalled();
  });
});
