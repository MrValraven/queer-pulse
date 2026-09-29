import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { subprofiles as enSubprofiles } from "../../shared/i18n/catalogs/en/subprofiles";
import { TestProviders } from "../../test/TestProviders";
import { EditorConflictAlert } from "./EditorConflictAlert";
import {
  SubprofileEditorContext,
  type SubprofileEditorContextValue,
} from "./subprofileEditorContext";
import type { PendingChange } from "./subprofileEditorDiff";

/**
 * ENG-451: the save-conflict alert, rendered against a stub editor context
 * inside a `.savebar`, the way every savebar layout mounts it. The copy
 * assertions read the EN catalog strings for `subprofiles:editConflict.*`,
 * so a copy edit there keeps these specs meaningful.
 */

type AlertContext = Pick<
  SubprofileEditorContextValue,
  | "hasEditConflict"
  | "dirty"
  | "pending"
  | "reloadLatest"
  | "isReloading"
  | "hasReloadFailed"
  | "reloadGeneration"
>;

/** The EN catalog string for `key`. Catalog lookups are typed optional, so
 *  this narrows them once and fails loudly if a key goes missing. */
function copy(key: string): string {
  const value = enSubprofiles[key];
  if (value === undefined) {
    throw new Error(`Missing EN catalog key: subprofiles:${key}`);
  }
  return value;
}

const TAGLINE_CHANGE: PendingChange = {
  area: { kind: "meta" },
  areaLabelKey: "subprofiles:pending.area.meta",
  summaryKey: "subprofiles:pending.metaEdited",
  params: { field: "subprofiles:pending.field.tagline" },
};

function contextValue(overrides: Partial<AlertContext>) {
  const value: AlertContext = {
    hasEditConflict: true,
    dirty: true,
    pending: [TAGLINE_CHANGE],
    reloadLatest: vi.fn(),
    isReloading: false,
    hasReloadFailed: false,
    reloadGeneration: 0,
    ...overrides,
  };
  // The alert reads only the fields above.
  return value as SubprofileEditorContextValue;
}

function Harness({ value }: { value: SubprofileEditorContextValue }) {
  return (
    <TestProviders>
      <SubprofileEditorContext.Provider value={value}>
        <label>
          Name
          <input />
        </label>
        <div className="savebar">
          <button type="button">Save</button>
          <EditorConflictAlert />
        </div>
      </SubprofileEditorContext.Provider>
    </TestProviders>
  );
}

const reloadButton = () => screen.getByRole("button", { name: /reload/i });

describe("EditorConflictAlert (ENG-451)", () => {
  it("renders nothing while there is no conflict", () => {
    render(<Harness value={contextValue({ hasEditConflict: false })} />);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("renders a role=alert with the title and the body, and Reload beside it", () => {
    render(<Harness value={contextValue({})} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(copy("editConflict.title"));
    expect(alert).toHaveTextContent(copy("editConflict.body"));
    expect(reloadButton()).toBeInTheDocument();
  });

  it("keeps the controls out of the live region, so a moving count is not read out", () => {
    render(<Harness value={contextValue({})} />);
    expect(within(screen.getByRole("alert")).queryByRole("button")).toBeNull();
  });

  it("folds the unsaved list behind a toggle that opens it for copying", () => {
    render(<Harness value={contextValue({})} />);
    const toggle = screen.getByRole("button", { name: /unsaved/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Tagline edited")).not.toBeVisible();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Tagline edited")).toBeVisible();
  });

  it("shows no unsaved toggle once the editor is clean", () => {
    render(<Harness value={contextValue({ dirty: false, pending: [] })} />);
    expect(screen.queryByRole("button", { name: /unsaved/i })).toBeNull();
    expect(reloadButton()).toBeInTheDocument();
  });

  it("moves focus to Reload when the conflict lands while focus is in the savebar", () => {
    const { rerender } = render(
      <Harness value={contextValue({ hasEditConflict: false })} />,
    );
    screen.getByRole("button", { name: "Save" }).focus();

    rerender(<Harness value={contextValue({})} />);

    expect(reloadButton()).toHaveFocus();
  });

  it("moves focus to Reload when the conflict lands with focus on the page body", () => {
    const { rerender } = render(
      <Harness value={contextValue({ hasEditConflict: false })} />,
    );
    expect(document.activeElement).toBe(document.body);

    rerender(<Harness value={contextValue({})} />);

    expect(reloadButton()).toHaveFocus();
  });

  it("leaves focus where it is when the member is working in a field", () => {
    const { rerender } = render(
      <Harness value={contextValue({ hasEditConflict: false })} />,
    );
    const nameField = screen.getByRole("textbox", { name: "Name" });
    nameField.focus();

    rerender(<Harness value={contextValue({})} />);

    expect(nameField).toHaveFocus();
  });

  it("hands focus back to Reload when the bar changes and leaves focus on the body", () => {
    const { rerender } = render(<Harness value={contextValue({})} />);
    screen.getByRole("textbox", { name: "Name" }).focus();
    (document.activeElement as HTMLElement).blur();

    rerender(<Harness value={contextValue({ dirty: false })} />);

    expect(reloadButton()).toHaveFocus();
  });

  it("calls reloadLatest on press and ignores a press while a reload runs", () => {
    const reloadLatest = vi.fn();
    const { rerender } = render(
      <Harness value={contextValue({ reloadLatest })} />,
    );
    fireEvent.click(reloadButton());
    expect(reloadLatest).toHaveBeenCalledTimes(1);

    rerender(
      <Harness value={contextValue({ reloadLatest, isReloading: true })} />,
    );
    fireEvent.click(reloadButton());

    expect(reloadLatest).toHaveBeenCalledTimes(1);
    expect(reloadButton()).toHaveAttribute("aria-busy", "true");
    expect(reloadButton()).toBeEnabled();
  });

  it("says the reload failed, keeping the alert and Reload on screen", () => {
    render(<Harness value={contextValue({ hasReloadFailed: true })} />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      copy("editConflict.reloadFailed"),
    );
    expect(reloadButton()).toBeInTheDocument();
  });
});
