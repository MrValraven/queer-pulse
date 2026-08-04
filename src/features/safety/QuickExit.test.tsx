import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { QuickExit } from "./QuickExit";

/**
 * Quick-exit safety net (audit item #12).
 *
 * NOTE: the task described a "double-Shift" trigger. The shipped component
 * (`QuickExit.tsx`) actually triggers the decoy redirect on the **Escape** key
 * (a well-known safety pattern) plus a visible button — there is no
 * double-Shift handler in the source. These tests exercise the REAL behaviour:
 * Escape (and the button) navigate away via `window.location.replace`, but
 * Escape is a deliberate NO-OP while focus is in a text-entry field so an
 * accidental Escape can't discard a half-written report.
 *
 * `window.location.replace` is spied on because jsdom's real implementation
 * throws "Not implemented: navigation".
 */
const SAFE_DESTINATION = "https://www.google.com";

afterEach(() => {
  vi.restoreAllMocks();
});

function spyOnReplace() {
  return vi.spyOn(window.location, "replace").mockImplementation(() => {});
}

describe("QuickExit", () => {
  it("redirects to the neutral decoy site on Escape", () => {
    const replace = spyOnReplace();
    render(
      <TestProviders>
        <QuickExit />
      </TestProviders>,
    );

    // Nothing focused → activeElement is <body>, not a text field.
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith(SAFE_DESTINATION);
  });

  it("is a NO-OP on Escape while the user is typing in a text input", () => {
    const replace = spyOnReplace();
    render(
      <TestProviders>
        <input data-testid="report-draft" type="text" />
        <QuickExit />
      </TestProviders>,
    );

    // Put focus in the text field, mirroring someone mid-draft.
    const input = screen.getByTestId<HTMLInputElement>("report-draft");
    input.focus();
    expect(document.activeElement).toBe(input);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    // The visible button stays the always-instant exit; Escape must not fire
    // here or it would throw away the in-progress input.
    expect(replace).not.toHaveBeenCalled();
  });

  it("still redirects immediately when the visible button is pressed", async () => {
    const replace = spyOnReplace();
    render(
      <TestProviders>
        <QuickExit />
      </TestProviders>,
    );

    // The label is a lazy-loaded translation, so wait for the button to resolve.
    const button = await screen.findByRole("button");
    fireEvent.click(button);

    expect(replace).toHaveBeenCalledWith(SAFE_DESTINATION);
  });
});
