import { useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDismiss } from "./useDismiss";

/** A bare dialog on the shared hook: portalled, labelled, aria-modal. */
function TestDialog({
  label,
  children,
  shouldFocusField = false,
}: {
  label: string;
  children?: ReactNode;
  shouldFocusField?: boolean;
}) {
  const fieldRef = useRef<HTMLInputElement>(null);
  const dialogRef = useDismiss(
    () => undefined,
    shouldFocusField ? fieldRef : undefined,
  );
  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
    >
      {children}
      {shouldFocusField && (
        <input ref={fieldRef} aria-label={`${label} search`} />
      )}
    </div>,
    document.body,
  );
}

function Harness({
  isViewerOpen,
  isPickerOpen,
}: {
  isViewerOpen: boolean;
  isPickerOpen: boolean;
}) {
  return (
    <>
      <button type="button">Open photo</button>
      {isViewerOpen && (
        <TestDialog label="Viewer">
          <button type="button">Forward</button>
        </TestDialog>
      )}
      {isPickerOpen && <TestDialog label="Picker" shouldFocusField />}
    </>
  );
}

describe("useDismiss focus return", () => {
  it("returns focus to the opener when a lone dialog closes", () => {
    const view = render(<Harness isViewerOpen={false} isPickerOpen={false} />);
    screen.getByRole("button", { name: "Open photo" }).focus();
    view.rerender(<Harness isViewerOpen isPickerOpen={false} />);
    expect(document.activeElement).toBe(
      screen.getByRole("dialog", { name: "Viewer" }),
    );
    view.rerender(<Harness isViewerOpen={false} isPickerOpen={false} />);
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Open photo" }),
    );
  });

  it("keeps focus in a dialog opened on top while the one underneath finishes closing", () => {
    const view = render(<Harness isViewerOpen={false} isPickerOpen={false} />);
    screen.getByRole("button", { name: "Open photo" }).focus();
    view.rerender(<Harness isViewerOpen isPickerOpen={false} />);
    screen.getByRole("button", { name: "Forward" }).focus();
    // Forward opens the picker while the viewer is still on its way out.
    view.rerender(<Harness isViewerOpen isPickerOpen />);
    const pickerField = screen.getByRole("textbox", { name: "Picker search" });
    expect(document.activeElement).toBe(pickerField);
    // The viewer's exit ends: its unmount leaves focus in the picker.
    view.rerender(<Harness isViewerOpen={false} isPickerOpen />);
    expect(document.activeElement).toBe(pickerField);
  });

  it("hands the picker's close through to the control that opened the viewer", () => {
    const view = render(<Harness isViewerOpen={false} isPickerOpen={false} />);
    screen.getByRole("button", { name: "Open photo" }).focus();
    view.rerender(<Harness isViewerOpen isPickerOpen={false} />);
    screen.getByRole("button", { name: "Forward" }).focus();
    view.rerender(<Harness isViewerOpen isPickerOpen />);
    view.rerender(<Harness isViewerOpen={false} isPickerOpen />);
    // The picker's own opener (Forward) left with the viewer.
    view.rerender(<Harness isViewerOpen={false} isPickerOpen={false} />);
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Open photo" }),
    );
  });
});
