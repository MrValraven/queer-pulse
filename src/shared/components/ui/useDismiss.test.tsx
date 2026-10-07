import { useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDismiss } from "./useDismiss";

/** A bare dialog on the shared hook: portalled, labelled, aria-modal. */
function TestDialog({
  label,
  children,
  shouldFocusField = false,
  onClose = () => undefined,
}: {
  label: string;
  children?: ReactNode;
  shouldFocusField?: boolean;
  onClose?: () => void;
}) {
  const fieldRef = useRef<HTMLInputElement>(null);
  const dialogRef = useDismiss(
    onClose,
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

function pressEscapeOnDocument(): KeyboardEvent {
  const escapeEvent = new KeyboardEvent("keydown", {
    key: "Escape",
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(escapeEvent);
  return escapeEvent;
}

describe("useDismiss Escape", () => {
  it("closes the topmost dialog and marks the key as spent", () => {
    const onClose = vi.fn();
    const view = render(<TestDialog label="Scanner" onClose={onClose} />);
    const escapeEvent = pressEscapeOnDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(escapeEvent.defaultPrevented).toBe(true);
    view.unmount();
  });

  it("leaves the key alone in a dialog covered by another one", () => {
    const onCloseUnderneath = vi.fn();
    const onCloseOnTop = vi.fn();
    function Stack({ isConfirmOpen }: { isConfirmOpen: boolean }) {
      return (
        <>
          <TestDialog label="Drawer" onClose={onCloseUnderneath} />
          {isConfirmOpen && (
            <TestDialog label="Confirm" onClose={onCloseOnTop} />
          )}
        </>
      );
    }
    const view = render(<Stack isConfirmOpen={false} />);
    // Registered between the two dialogs' listeners, so it sees the press
    // after the covered dialog has had its turn and before the top one does.
    const spentStatesBeforeTopDialog: boolean[] = [];
    const recordSpentState = (event: KeyboardEvent) => {
      spentStatesBeforeTopDialog.push(event.defaultPrevented);
    };
    document.addEventListener("keydown", recordSpentState);
    view.rerender(<Stack isConfirmOpen />);
    const escapeEvent = pressEscapeOnDocument();
    document.removeEventListener("keydown", recordSpentState);
    expect(spentStatesBeforeTopDialog).toEqual([false]);
    expect(onCloseUnderneath).not.toHaveBeenCalled();
    expect(onCloseOnTop).toHaveBeenCalledTimes(1);
    expect(escapeEvent.defaultPrevented).toBe(true);
    view.unmount();
  });

  it("leaves keys other than Escape and Tab alone", () => {
    const onClose = vi.fn();
    const view = render(<TestDialog label="Scanner" onClose={onClose} />);
    const enterEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(enterEvent);
    expect(onClose).not.toHaveBeenCalled();
    expect(enterEvent.defaultPrevented).toBe(false);
    view.unmount();
  });
});
